import subprocess
import time

topics = [
    "Common Japanese particles used as sentence endings (Yo, Ne, Zo, Wa)",
    "Expressing probability and doubt (~darou, ~kamoshirenai, ~hazu desu)",
    "Talking about obligations and permissions (~nakereba naranai, ~temo ii)",
    "Describing sequences of actions (~te kara, ~ato de, ~mae ni)",
    "Comparisons and superlatives (~yori, ~no hou ga, ~de ichiban)",
    "Expressing desires and intentions (~tai, ~tsumori, ~ou to omou)",
    "Reporting speech and thoughts (~to iu, ~to omou, ~sou desu)",
    "Japanese idioms related to body parts (e.g., Me ga takai, Mimi ga itai)",
    "Formal vs. Informal writing styles (Da/Dearu vs Desu/Masu)",
    "Japanese festivals (Matsuri) and related vocabulary"
]

for topic in topics:
    print(f"Generating for topic: {topic}")
    subprocess.run(["python3", "generate_data.py", topic, "10"])
    time.sleep(1) # Avoid rate limiting if any
