# Technical Data Strategy: SUPAA Custom Model (SUPAA-28)

## 1. Overview
This document defines the data strategy for developing and improving the SUPAA proprietary models, specifically focusing on the fine-tuning of Gemma4 for specialized domains, with the current primary focus being the **English-Japanese AI Tutor**.

## 2. Data Lifecycle

### 2.1. Collection (Data Flywheel)
We capture high-quality interaction trajectories from the SUPAA platform.
- **Source:** Real agent interactions (CEO, CMO, UX, CTO), EN-JP Tutor user sessions, and human-in-the-loop (HITL) feedback.
- **Format:** JSONL trajectories containing messages, tool calls, tool outputs, and reasoning steps.
- **Metadata:** Success/failure labels, pedagogical accuracy ratings, and execution metrics.

### 2.2. Synthetic Data Generation
To bootstrap performance in specific domains, we use a "Teacher-Student" distillation approach.
- **Teacher Models:** Gemini 2.0 Flash, GPT-4o, Claude 3.5 Sonnet.
- **Goal:** Generate complex pedagogical interactions and multi-agent coordination scenarios.
- **Scripts:** (See [ML_SCRIPTS.md](./ML_SCRIPTS.md) for usage details)
    - `generate_data.py`: CLI tool for generating EN-JP teaching examples via remote Gemma4 API.
    - `generate_more.py`: Batch generation script for multiple Japanese language topics.
- **Filtering:** Automated validation using `clean_data.py` and `fix_examples.py` to ensure JSON consistency and content quality.

### 2.3. Processing & Labeling
- **Normalization:** Standardizing interaction formats into the Gemma4 native instruction format.
- **Reasoning Extraction:** Capturing "Chain of Thought" (COT) steps within `<thought>` tags for training reasoning-aware models.
- **DPO Pairing:** Creating preference pairs (win/loss) based on pedagogical correctness and reasoning clarity.

## 3. Use-Case: English-Japanese AI Tutor

### 3.1. Pedagogical Excellence
- **Training Goal:** Accurate translation with deep grammatical explanations and cultural nuances (e.g., Keigo usage, particles, regional dialects).
- **Data Source:** `train_data_clean.jsonl` - A curated dataset of ~600 unique, high-quality EN-JP interactions.

### 3.2. Reasoning-Aware Teaching
- **Scenario:** A student asks a "Why?" question about Japanese grammar.
- **Training Goal:** The model should reason through the grammatical rule before providing the answer.

## 4. Technical Architecture
- **Storage:** GCP BigQuery for structured telemetry; GCS for raw JSONL trajectories and model checkpoints.
- **Training Pipeline:** PEFT/LoRA fine-tuning using **Unsloth** on GCP L4 GPUs.
- **Scripts:** (See [ML_SCRIPTS.md](./ML_SCRIPTS.md) for details)
    - `finetune_gemma.py`: SFT (Supervised Fine-Tuning) script using Unsloth.
- **Evaluation:**
    - `gemma4_evaluation.py`: Framework for benchmarking models.
    - `evaluate_regressions_local.py`: Script to check for performance regressions.

## 5. Metrics
- **Pedagogical Accuracy:** >95% on expert-reviewed grammar explanations.
- **Translation Quality:** High BLEU/METEOR scores on standard benchmark sets.
- **Reasoning Coherence:** >90% adherence to defined `<thought>` tag structure and logical flow.
