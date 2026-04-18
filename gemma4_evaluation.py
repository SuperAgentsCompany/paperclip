import json
import urllib.request
import time

ENDPOINT = "https://gemma4-4b-762452591869.us-central1.run.app/v1/chat/completions"
MODEL = "gemma4-4b"

def call_gemma(messages, tools=None):
    data = {
        "model": MODEL,
        "messages": messages,
    }
    if tools:
        data["tools"] = tools
        data["tool_choice"] = "auto"
    
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req) as f:
            response = json.loads(f.read().decode("utf-8"))
            latency = time.time() - start_time
            response["latency"] = latency
            return response
    except Exception as e:
        return {"error": str(e)}

def test_tool_use():
    print("Testing Tool Use...")
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "The city and state, e.g. San Francisco, CA"
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"]
                        }
                    },
                    "required": ["location"]
                }
            }
        }
    ]
    
    messages = [
        {"role": "user", "content": "What is the weather like in Tokyo today?"}
    ]
    
    response = call_gemma(messages, tools=tools)
    
    if "error" in response:
        print(f"  FAILED: {response['error']}")
        return False, 0
    
    latency = response["latency"]
    choice = response["choices"][0]
    message = choice["message"]
    
    if message.get("tool_calls"):
        tool_call = message["tool_calls"][0]
        func_name = tool_call["function"]["name"]
        args = json.loads(tool_call["function"]["arguments"])
        print(f"  SUCCESS: Called {func_name} with args {args} (Latency: {latency:.2f}s)")
        return True, latency
    else:
        print(f"  FAILED: No tool call found (Latency: {latency:.2f}s)")
        print(f"  Response: {message.get('content')}")
        return False, latency

def test_reasoning():
    print("Testing Multi-step Reasoning...")
    messages = [
        {"role": "user", "content": "Sally has 3 brothers. Each of her brothers has 2 sisters. How many sisters does Sally have?"}
    ]
    
    response = call_gemma(messages)
    
    if "error" in response:
        print(f"  FAILED: {response['error']}")
        return False, 0
    
    latency = response["latency"]
    content = response["choices"][0]["message"]["content"]
    print(f"  Response: {content} (Latency: {latency:.2f}s)")
    
    # Correct answer: 1 sister (Sally herself)
    if "1" in content and "sister" in content.lower():
        print(f"  SUCCESS: Correct answer (likely) (Latency: {latency:.2f}s)")
        return True, latency
    else:
        print(f"  FAILED: Incorrect answer (Latency: {latency:.2f}s)")
        return False, latency

def test_instruction_following():
    print("Testing Instruction Following...")
    messages = [
        {"role": "system", "content": "You are a helpful assistant. Always respond in valid JSON format."},
        {"role": "user", "content": "List three colors and their hex codes."}
    ]
    
    response = call_gemma(messages)
    
    if "error" in response:
        print(f"  FAILED: {response['error']}")
        return False, 0
    
    latency = response["latency"]
    content = response["choices"][0]["message"]["content"].strip()
    
    # Clean up potential markdown blocks
    if content.startswith("```json"):
        content = content[7:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()

    print(f"  Response: {content} (Latency: {latency:.2f}s)")
    
    try:
        json.loads(content)
        print(f"  SUCCESS: Valid JSON response (Latency: {latency:.2f}s)")
        return True, latency
    except:
        print(f"  FAILED: Response is not valid JSON (Latency: {latency:.2f}s)")
        return False, latency

if __name__ == "__main__":
    tests = {
        "tool_use": test_tool_use,
        "reasoning": test_reasoning,
        "instruction_following": test_instruction_following
    }
    
    results = {}
    for name, test_func in tests.items():
        success, latency = test_func()
        results[name] = {"success": success, "latency": latency}
    
    print("\nSummary:")
    for test, data in results.items():
        print(f"  {test}: {'PASS' if data['success'] else 'FAIL'} (Latency: {data['latency']:.2f}s)")

