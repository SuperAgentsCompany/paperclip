import json
import re

with open("examples.jsonl", "r") as f:
    content = f.read()

# Each example starts with -e {"messages":
examples = content.split("-e {")
valid_lines = []

for ex in examples:
    if not ex.strip(): continue
    ex = "{" + ex
    
    # We know the structure is {"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
    # Let's try to extract user content and assistant content manually
    try:
        user_match = re.search(r'\{"role": "user", "content": "(.*?)"\},', ex, re.DOTALL)
        assistant_match = re.search(r'\{"role": "assistant", "content": "(.*?)"\}\}\s*$', ex, re.DOTALL)
        
        if user_match and assistant_match:
            user_content = user_match.group(1).replace('\n', '\\n')
            assistant_content = assistant_match.group(1).replace('\n', '\\n')
            
            # Escape double quotes that are NOT escaped
            # This is hard to do perfectly with regex but let's try
            # Actually, if we just put them back into a JSON object, json.dumps will handle them.
            
            # Wait, the content itself might have " that need escaping.
            # I'll just use the raw string and let json.dumps handle it.
            
            obj = {
                "messages": [
                    {"role": "user", "content": user_match.group(1).strip()},
                    {"role": "assistant", "content": assistant_match.group(1).strip()}
                ]
            }
            valid_lines.append(json.dumps(obj))
    except:
        pass

print(f"Fixed {len(valid_lines)} examples from examples.jsonl")
for line in valid_lines:
    print(line[:100] + "...")
