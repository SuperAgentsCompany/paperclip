import json
import re
import os

def extract_json_objects(content, is_examples=False):
    if is_examples:
        examples = content.split("-e {")
        lines = []
        for ex in examples:
            if not ex.strip(): continue
            ex = "{" + ex
            user_match = re.search(r'\{"role": "user", "content": "(.*?)"\},', ex, re.DOTALL)
            assistant_match = re.search(r'\{"role": "assistant", "content": "(.*?)"\}\}\s*$', ex, re.DOTALL)
            if user_match and assistant_match:
                obj = {
                    "messages": [
                        {"role": "user", "content": user_match.group(1).strip()},
                        {"role": "assistant", "content": assistant_match.group(1).strip()}
                    ]
                }
                lines.append(json.dumps(obj))
        return lines

    starts = [m.start() for m in re.finditer(r'\{"messages":', content)]
    lines = []
    for start in starts:
        depth = 0
        found_end = -1
        for j in range(start, len(content)):
            if content[j] == '{': depth += 1
            elif content[j] == '}': depth -= 1
            if depth == 0:
                found_end = j
                break
        if found_end != -1:
            potential_json = content[start:found_end+1]
            try:
                obj = json.loads(potential_json)
                lines.append(json.dumps(obj))
            except:
                try:
                    fixed = potential_json
                    def fix(match):
                        return match.group(0).replace('\n', '\\n').replace('\r', '\\r')
                    fixed = re.sub(r'("content":\s*)("(?:[^"\\]|\\.)*")', fix, fixed, flags=re.DOTALL)
                    obj = json.loads(fixed)
                    lines.append(json.dumps(obj))
                except:
                    pass
    return lines

all_lines = []
for fname in ["en_jp_teaching_data.jsonl", "generated_examples.jsonl", "examples.jsonl"]:
    if os.path.exists(fname):
        print(f"Cleaning {fname}...")
        with open(fname, "r", errors="ignore") as f:
            content = f.read()
        file_lines = extract_json_objects(content, is_examples=(fname == "examples.jsonl"))
        print(f"Found {len(file_lines)} valid examples in {fname}")
        all_lines.extend(file_lines)

unique_lines = list(set(all_lines))
print(f"Total unique examples: {len(unique_lines)}")

with open("train_data_clean.jsonl", "w") as f:
    for line in unique_lines:
        f.write(line + "\n")
