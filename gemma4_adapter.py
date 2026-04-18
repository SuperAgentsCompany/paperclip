#!/usr/bin/env python3
import os
import sys
import json
import argparse
import requests
import uuid
import subprocess
import time
from datetime import datetime
from pathlib import Path

ENDPOINT = "https://gemma4-4b-762452591869.us-central1.run.app/v1/chat/completions"
MODEL = "gemma4-4b"

class Gemma4Adapter:
    def __init__(self, args):
        self.args = args
        self.session_id = args.resume if args.resume and args.resume != "latest" else str(uuid.uuid4())
        self.sessions_dir = Path.home() / ".gemma4" / "sessions"
        self.sessions_dir.mkdir(parents=True, exist_ok=True)
        self.session_file = self.sessions_dir / f"{self.session_id}.json"
        self.history = self.load_history()
        self.tools = self.setup_tools()
        self.start_time = time.time()
        self.total_tokens = 0
        self.input_tokens = 0
        self.output_tokens = 0

    def load_history(self):
        if self.args.resume and self.session_file.exists():
            with open(self.session_file, "r") as f:
                return json.load(f)
        return []

    def save_history(self):
        with open(self.session_file, "w") as f:
            json.dump(self.history, f, indent=2)

    def setup_tools(self):
        return [
            {
                "type": "function",
                "function": {
                    "name": "read_file",
                    "description": "Read the contents of a file",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "file_path": {"type": "string"},
                            "start_line": {"type": "integer"},
                            "end_line": {"type": "integer"}
                        },
                        "required": ["file_path"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "write_file",
                    "description": "Write content to a file. Overwrites existing file.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "file_path": {"type": "string"},
                            "content": {"type": "string"}
                        },
                        "required": ["file_path", "content"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "run_shell_command",
                    "description": "Run a shell command",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "command": {"type": "string"}
                        },
                        "required": ["command"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_directory",
                    "description": "List files in a directory",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "dir_path": {"type": "string"}
                        },
                        "required": ["dir_path"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "grep_search",
                    "description": "Search for a pattern in files",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pattern": {"type": "string"},
                            "include_pattern": {"type": "string"},
                            "exclude_pattern": {"type": "string"},
                            "case_sensitive": {"type": "boolean"}
                        },
                        "required": ["pattern"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "replace",
                    "description": "Replace text in a file using old_string/new_string matching.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "file_path": {"type": "string"},
                            "old_string": {"type": "string"},
                            "new_string": {"type": "string"},
                            "allow_multiple": {"type": "boolean"}
                        },
                        "required": ["file_path", "old_string", "new_string"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "glob",
                    "description": "Find files matching a glob pattern",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "pattern": {"type": "string"}
                        },
                        "required": ["pattern"]
                    }
                }
            }
        ]

    def execute_tool(self, tool_call):
        name = tool_call["function"]["name"]
        try:
            args = json.loads(tool_call["function"]["arguments"])
        except:
            return "Error: Invalid JSON in tool arguments"
        
        try:
            if name == "read_file":
                path = args["file_path"]
                with open(path, "r") as f:
                    lines = f.readlines()
                    start = args.get("start_line", 1) - 1
                    end = args.get("end_line", len(lines))
                    return "".join(lines[start:end])
            elif name == "write_file":
                path = args["file_path"]
                content = args["content"]
                os.makedirs(os.path.dirname(path), exist_ok=True)
                with open(path, "w") as f:
                    f.write(content)
                return f"Successfully wrote to {path}"
            elif name == "run_shell_command":
                cmd = args["command"]
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=120)
                return f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}\nExit Code: {result.returncode}"
            elif name == "list_directory":
                path = args["dir_path"]
                files = os.listdir(path)
                return "\n".join(files)
            elif name == "grep_search":
                pattern = args["pattern"]
                include = args.get("include_pattern", "*")
                exclude = args.get("exclude_pattern", "")
                case_sensitive = args.get("case_sensitive", False)
                
                cmd = ["grep", "-rn"]
                if not case_sensitive:
                    cmd.append("-i")
                if exclude:
                    cmd.append(f"--exclude={exclude}")
                cmd.append(pattern)
                cmd.append(".")
                
                result = subprocess.run(" ".join(cmd), shell=True, capture_output=True, text=True, timeout=60)
                return result.stdout or "No matches found"
            elif name == "replace":
                path = args["file_path"]
                old = args["old_string"]
                new = args["new_string"]
                allow_multiple = args.get("allow_multiple", False)
                
                with open(path, "r") as f:
                    content = f.read()
                
                count = content.count(old)
                if count == 0:
                    return f"Error: old_string not found in {path}"
                if count > 1 and not allow_multiple:
                    return f"Error: old_string found {count} times, but allow_multiple is false"
                
                new_content = content.replace(old, new)
                with open(path, "w") as f:
                    f.write(new_content)
                return f"Successfully replaced {count} occurrences in {path}"
            elif name == "glob":
                pattern = args["pattern"]
                import glob
                files = glob.glob(pattern, recursive=True)
                return "\n".join(files)
            else:
                return f"Error: Tool {name} not implemented"
        except Exception as e:
            return f"Error executing tool: {str(e)}"

    def log_event(self, event):
        event["timestamp"] = datetime.now().isoformat() + "Z"
        if self.args.output_format == "stream-json":
            print(json.dumps(event), flush=True)
        elif self.args.output_format == "text":
            if event["type"] == "assistant":
                msg = event.get("message")
                if isinstance(msg, dict):
                    print(msg.get("text", ""))
                elif isinstance(msg, str):
                    print(msg)
            elif event["type"] == "error":
                print(f"ERROR: {event['message']}", file=sys.stderr)

    def run(self):
        self.log_event({
            "type": "init",
            "session_id": self.session_id,
            "model": self.args.model or MODEL
        })

        if self.args.prompt:
            self.history.append({"role": "user", "content": self.args.prompt})
        
        while True:
            data = {
                "model": MODEL,
                "messages": self.history,
                "tools": self.tools,
                "tool_choice": "auto"
            }
            
            try:
                response = requests.post(ENDPOINT, json=data, timeout=120)
                if response.status_code != 200:
                    self.log_event({"type": "error", "message": f"API Error: {response.text}"})
                    break
            except Exception as e:
                self.log_event({"type": "error", "message": f"Connection Error: {str(e)}"})
                break
            
            result = response.json()
            
            if "choices" not in result or not result["choices"]:
                 self.log_event({"type": "error", "message": "No choices in API response"})
                 break
                 
            # Update token usage
            usage = result.get("usage", {})
            self.input_tokens += usage.get("prompt_tokens", 0)
            self.output_tokens += usage.get("completion_tokens", 0)
            self.total_tokens += usage.get("total_tokens", 0)

            message = result["choices"][0]["message"]
            self.history.append(message)
            
            # Handle reasoning from dedicated field
            reasoning = message.get("reasoning")
            if reasoning:
                self.log_event({
                    "type": "thought",
                    "subject": "Reasoning",
                    "description": reasoning
                })

            content = message.get("content")
            tool_calls = message.get("tool_calls")

            # Handle reasoning from <thought> tags in content
            if content and "<thought>" in content and "</thought>" in content:
                import re
                thoughts = re.findall(r"<thought>(.*?)</thought>", content, re.DOTALL)
                for t in thoughts:
                    self.log_event({
                        "type": "thought",
                        "subject": "Reasoning",
                        "description": t.strip()
                    })
                # Clean up content for display if desired, or keep as is. 
                # Keeping as is for now to avoid losing data.

            if content is not None or tool_calls:
                assistant_event = {
                    "type": "assistant",
                    "message": {
                        "text": content or "",
                    }
                }
                if tool_calls:
                    assistant_event["message"]["tool_calls"] = tool_calls
                
                self.log_event(assistant_event)
            
            if tool_calls:
                for tool_call in message["tool_calls"]:
                    tool_result = self.execute_tool(tool_call)
                    self.history.append({
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "name": tool_call["function"]["name"],
                        "content": tool_result
                    })
                # Continue the loop to let the model process tool results
                continue
            else:
                # No more tool calls, we are done
                duration_ms = int((time.time() - self.start_time) * 1000)
                self.log_event({
                    "type": "result",
                    "status": "success",
                    "session_id": self.session_id,
                    "usage": {
                        "input_tokens": self.input_tokens,
                        "output_tokens": self.output_tokens,
                        "total_tokens": self.total_tokens
                    },
                    "stats": {
                        "total_tokens": self.total_tokens,
                        "input_tokens": self.input_tokens,
                        "output_tokens": self.output_tokens,
                        "duration_ms": duration_ms
                    }
                })
                break
        
        self.save_history()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", "--prompt", help="Run with the given prompt")
    parser.add_argument("-r", "--resume", help="Resume a previous session")
    parser.add_argument("-o", "--output-format", choices=["text", "json", "stream-json"], default="text")
    parser.add_argument("--model", help="Model ID")
    parser.add_argument("--approval-mode", help="Approval mode")
    parser.add_argument("--sandbox", action="store_true", help="Run in sandbox mode")
    parser.add_argument("--sandbox=none", action="store_false", dest="sandbox", help="Run without sandbox")
    parser.add_argument("--include-directories", action="append", help="Include directories")
    
    args, unknown = parser.parse_known_args()
    
    adapter = Gemma4Adapter(args)
    adapter.run()
