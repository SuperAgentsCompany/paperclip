from unsloth import FastLanguageModel
import torch
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments

max_seq_length = 2048
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True

print("Loading model and tokenizer with Unsloth...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "./gemma-4-E4B-it",
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

print("Adding LoRA adapters...")
model = FastLanguageModel.get_peft_model(
    model,
    r = 16,
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0,
    bias = "none",
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
    use_rslora = False,
    loftq_config = None,
)

print("Loading dataset...")
dataset = load_dataset("json", data_files="en_jp_teaching_data.jsonl", split="train")

def format_instruction(sample):
    messages = sample["messages"]
    # Gemma 4 instruction format
    prompt = f"<start_of_turn>user\n{messages[0]['content']}<end_of_turn>\n<start_of_turn>model\n{messages[1]['content']}<end_of_turn>"
    return {"text": prompt}

dataset = dataset.map(format_instruction)

print("Starting training...")
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        max_steps = 60,
        learning_rate = 2e-4,
        fp16 = not torch.cuda.is_bf16_supported(),
        bf16 = torch.cuda.is_bf16_supported(),
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
        report_to = "none",
    ),
)

trainer.train()

print("Saving adapter...")
model.save_pretrained_lora("gemma-en-jp-adapter")
tokenizer.save_pretrained("gemma-en-jp-adapter")
print("Done!")
