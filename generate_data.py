import subprocess
import json
import os
import sys
import re

def generate_examples(topic, count=10):
    prompt = f"""
Generate {count} new examples of English-Japanese language teaching interactions focusing on the topic: "{topic}".
Each example should be a JSON object on a single line (JSONL format).
The format MUST be:
{{"messages": [{{"role": "user", "content": "STUDENT_QUESTION"}}, {{"role": "assistant", "content": "TEACHER_ANSWER"}}]}}

The STUDENT_QUESTION should be a realistic question a beginner or intermediate learner might ask about Japanese.
The TEACHER_ANSWER should be:
1. Encouraging and polite.
2. Detailed but easy to understand.
3. Include Japanese examples with kanji, romaji, and English translations.
4. Explain subtle nuances and common mistakes.

Output ONLY the JSONL lines. Do NOT use any tools. Do NOT include markdown code blocks. Do NOT include any preamble or postamble.
"""
    
    try:
        # Using the gemma4.py script in /tmp
        result = subprocess.run(
            ["python3", "/tmp/gemma4.py", "-p", prompt],
            capture_output=True, text=True, check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        return None

def extract_json_lines(text):
    lines = []
    # Try to find anything that looks like a JSON object
    # This regex is a bit simplistic but might work for JSONL
    potential_lines = text.splitlines()
    for line in potential_lines:
        line = line.strip()
        if not line: continue
        
        # Remove markdown backticks if present
        line = re.sub(r'^```jsonl?\s*', '', line)
        line = re.sub(r'```$', '', line)
        line = line.strip()
        
        if line.startswith("{") and line.endswith("}"):
            try:
                json.loads(line)
                lines.append(line)
            except:
                # Try to fix common issues like missing closing brackets
                if line.count('{') > line.count('}'):
                    line += '}' * (line.count('{') - line.count('}'))
                if line.count('[') > line.count(']'):
                    line += ']' * (line.count('[') - line.count(']'))
                
                try:
                    json.loads(line)
                    lines.append(line)
                except:
                    pass
    return lines

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 generate_data.py <topic> <count>")
        sys.exit(1)
    
    topic = sys.argv[1]
    count = int(sys.argv[2])
    
    output = generate_examples(topic, count)
    if output:
        valid_lines = extract_json_lines(output)
        
        with open("generated_examples.jsonl", "a") as f:
            for line in valid_lines:
                f.write(line + "\n")
        print(f"Successfully generated {len(valid_lines)} examples for topic: {topic}")
