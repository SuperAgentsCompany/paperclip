# Technical Strategy: SUPAA Custom Model Development (SUPAA-19)

## Executive Summary
This strategy outlines the path for SUPAA to develop and deploy proprietary models optimized for specialized agentic workflows, specifically leveraging the **Gemma4** base model. Our goal is to move beyond generic LLMs to provide superior performance, lower latency, and better cost efficiency for complex domain-specific tasks, hosted within the `super-power-agents` GCP ecosystem.

## 1. Technical Feasibility
Developing custom models is highly feasible given our access to GCP resources and the arrival of Gemma4.

- **Base Model Selection:** **Gemma4** is our primary target for fine-tuning, given its state-of-the-art performance for its size (4B) and its optimization for agentic tasks.
- **Fine-Tuning Methodology:** 
    - **PEFT (LoRA/QLoRA):** Primary approach for rapid iteration and reduced compute costs.
    - **DPO (Direct Preference Optimization):** To align model behavior with specific pedagogical or orchestration patterns.
- **Data Strategy:** (See [TECHNICAL_DATA_STRATEGY.md](./TECHNICAL_DATA_STRATEGY.md) for details)
    - **Synthetic Data:** Utilizing larger models (Gemini 2.0 Flash, GPT-4o, Claude 3.5 Sonnet) to generate high-quality training examples.
    - **Data Flywheel:** Extracting high-signal interaction data from our EN-JP Tutor and orchestration platform.

## 2. Compute Requirements
We adopt a cloud-first approach for compute, utilizing GCP (Vertex AI/GKE) and specialized GPU providers as needed.

- **Development/Training Phase:**
    - **hermes-finetune-gemma:** GCP VM with 1x NVIDIA L4 GPU, ideal for LoRA/QLoRA fine-tuning.
- **Production/Inference Phase:**
    - **vLLM on Cloud Run:** Serving model checkpoints and adapters for high-speed, scalable inference.
    - **Optimization:** Quantization (FP8/AWQ) and speculative decoding to minimize latency.

## 3. Technical Roadmap (Current Progress)

### Phase 1: Research & Evaluation (COMPLETED)
- Benchmarked Gemma4 on pedagogical and coding tasks.
- Established evaluation framework (`gemma4_evaluation.py`).

### Phase 2: Data Infrastructure & Generation (COMPLETED)
- Built synthetic data generation pipeline (`generate_data.py`, `generate_more.py`).
- Produced high-quality EN-JP teaching dataset (`train_data_clean.jsonl`).

### Phase 3: Model Training & Iteration (COMPLETED)
- Supervised Fine-Tuning (SFT) of Gemma-4-E4B-it for EN-JP Tutor using Unsloth.
- Direct Preference Optimization (DPO) of Coding Model to resolve asyncio and security regressions.
- Final adapters exported to GCS (`gs://super-power-agents-gemma-exports/`).

### Phase 4: Integration & Scale (IN PROGRESS)
- Integration of specialized adapters into the core Paperclip orchestration layer.
- Global low-latency serving via Vertex AI or GKE.

## 4. Risks & Mitigations
- **Data Quality:** mitigated by rigorous automated cleaning (`clean_data.py`) and expert review.
- **Compute Costs:** mitigated by starting with PEFT/LoRA and using cost-effective L4 GPUs.
- **Model Regression:** mitigated by continuous benchmarking against the base model using `evaluate_regressions_local.py`.
