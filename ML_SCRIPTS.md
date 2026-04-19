# Machine Learning Scripts & Tools

This document provides an overview of the scripts and tools used for data generation, cleaning, and fine-tuning of the SUPAA specialized models.

## 1. Data Generation

### `generate_data.py`
A CLI tool that uses the remote Gemma4 API to generate synthetic English-Japanese language teaching interactions.
- **Usage:** `python3 generate_data.py "<topic>" <count>`
- **Example:** `python3 generate_data.py "particles" 10`
- **Output:** Appends valid examples to `generated_examples.jsonl`.

### `generate_more.py`
A batch generation script that iterates through a list of Japanese language topics and calls `generate_data.py` for each.
- **Usage:** `python3 generate_more.py`
- **Purpose:** Rapidly expanding the training dataset coverage across various grammatical and cultural domains.

### `generate_teaching_data.py`
Original script for generating basic teaching examples.

## 2. Data Cleaning & Processing

### `clean_data.py`
A robust script that parses multiple JSONL sources, fixes common formatting issues (literal newlines, unescaped quotes), and de-duplicates examples.
- **Usage:** `python3 clean_data.py`
- **Input:** `en_jp_teaching_data.jsonl`, `generated_examples.jsonl`, `examples.jsonl`.
- **Output:** `train_data_clean.jsonl` (The final high-quality dataset).

### `fix_examples.py`
A targeted script to fix the heavily broken `examples.jsonl` file using regex-based extraction.
- **Usage:** `python3 fix_examples.py`

## 3. Fine-Tuning & Evaluation

### `finetune_gemma.py`
Script for Supervised Fine-Tuning (SFT) of the Gemma4-4b model using **Unsloth**.
- **Features:** LoRA/PEFT, 4-bit quantization, optimized for GCP L4 GPUs.
- **Input:** `train_data_clean.jsonl`.

### `dpo_finetune_coding_unsloth.py`
Direct Preference Optimization (DPO) script used for aligning coding and orchestration models.

### `gemma4_evaluation.py`
A benchmarking framework for evaluating model performance on domain-specific tasks (translation, reasoning).

### `evaluate_regressions_local.py`
Script to detect performance regressions by comparing a fine-tuned model against the base Gemma4 model.

## 4. Paperclip Integration

### `gemma4_adapter.py`
The bridge between the fine-tuned Gemma4 models and the Paperclip orchestration layer. This adapter handles the specific reasoning and tool-calling formats of Gemma4.
