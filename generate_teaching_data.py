import os
import json
import requests
import time
from pathlib import Path

API_KEY = os.getenv("GEMINI_API_KEY")
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={API_KEY}"

PROMPT = """
You are an expert English-Japanese language teacher. Generate a high-quality dataset of pedagogical interactions for fine-tuning a smaller model (Gemma4-4b).
Each interaction should be a single-turn conversation (User: student, Assistant: teacher).
The teacher should demonstrate pedagogical excellence:
- Clear explanations of grammar.
- Nuanced translation that considers cultural context.
- Patient and encouraging tone.
- Use of both English and Japanese as appropriate for a learner.

Categories to cover:
1. Particles (wa vs ga, ni vs e, o vs de).
2. Verb conjugations (te-form, potential form, causative-passive).
3. Keigo (Sonkeigo, Kenjougo, Teineigo).
4. Idiomatic expressions (e.g., "yoroshiku onegaishimasu", "otsukaresama").
5. Common pitfalls for English speakers (e.g., subject omission, literal translation of "to be").
6. Kanji/Vocabulary nuance (e.g., "shiru" vs "wakaru").

Format: Provide the output as a raw list of JSON objects, one per line (JSONL format). 
Each object MUST follow this structure:
{"messages": [{"role": "user", "content": "STUDENT_QUERY"}, {"role": "assistant", "content": "TEACHER_RESPONSE"}]}

Generate 20 diverse and high-quality examples. Do not include any markdown formatting like ```json or ```. Just the raw JSONL.
"""

def generate_data():
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{
            "parts": [{"text": PROMPT}]
        }]
    }
    
    response = requests.post(ENDPOINT, headers=headers, json=data)
    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
        return []
    
    result = response.json()
    text = result['candidates'][0]['content']['parts'][0]['text']
    
    # Basic cleanup in case the model ignores "no markdown" instruction
    lines = text.strip().split('\n')
    valid_lines = []
    for line in lines:
        line = line.strip()
        if not line: continue
        if line.startswith('```'): continue
        try:
            json.loads(line)
            valid_lines.append(line)
        except:
            # Try to see if it's a code block and we can extract it
            pass
            
    return valid_lines

if __name__ == "__main__":
    all_data = []
    for i in range(3): # Generate 60 examples
        print(f"Generating batch {i+1}...")
        batch = generate_data()
        all_data.extend(batch)
        print(f"  Generated {len(batch)} examples.")
        time.sleep(2) # Avoid rate limits
        
    output_file = Path("en_jp_teaching_data.jsonl")
    with open(output_file, "w") as f:
        for line in all_data:
            f.write(line + "\n")
            
    print(f"Total examples generated: {len(all_data)}")
    print(f"Saved to {output_file}")
