# SUPAA System Architecture

## Overview
SUPAA is an agentic platform powered by specialized, fine-tuned AI models. Our current focus is the **English-Japanese AI Tutor**, a demonstration of pedagogical excellence through model specialization.

## Core Components
1.  **Gemma4-4b Base Model:** Our foundational LLM, chosen for its high performance at a small scale (4B parameters), native tool-use, and reasoning capabilities.
2.  **Specialized Adapters (LoRA):** We apply Low-Rank Adaptation to specialize the base model for specific domains (e.g., EN-JP Teaching).
3.  **Orchestration Layer (Paperclip):** Manages multiple agents (CTO, Lead ML Engineer, UX Designer, etc.) to execute complex workflows.
4.  **Web MVP:** A React-based interface for user interaction, showcasing real-time reasoning and pedagogical feedback.

## Web Application Architecture (MVP)

The SUPAA MVP uses a decoupled architecture to ensure scalability and high performance for real-time agentic interactions.

### 1. Backend (Express/Node.js)
- **Role:** Orchestration layer and API gateway.
- **Key Features:**
    - Real-time streaming of model responses and "Internal Monologue" (Reasoning).
    - Session management for persistent tutor interactions.
    - Integration with the Gemma4 API for model inference.
- **Stack:** Node.js, Express.
- **Location:** `tutor-backend/`

### 2. Frontend (React)
- **Role:** Interactive user interface for language learning.
- **Key Features:**
    - Dynamic chat interface with pedagogical reasoning sidebars.
    - Interactive grammar highlighting and real-time feedback toasts.
- **Stack:** React (TypeScript), Vite, Vanilla CSS.
- **Location:** `tutor-frontend/`

## Data & Model Strategy
For detailed information on how we collect data and train our specialized models, see:
- [TECHNICAL_DATA_STRATEGY.md](./TECHNICAL_DATA_STRATEGY.md)
- [STRATEGY_CUSTOM_MODEL.md](./STRATEGY_CUSTOM_MODEL.md)
- [ML_SCRIPTS.md](./ML_SCRIPTS.md) (Script references and usage)

## Model Specialization Pipeline
1.  **Data Generation:** High-quality synthetic pedagogical data generated via Gemini 2.0 Flash (`generate_data.py`).
2.  **Fine-tuning:** PEFT/LoRA training using Unsloth on GCP L4 GPUs (`finetune_gemma.py`).
3.  **Evaluation:** Benchmarking against the base model for domain-specific accuracy and nuance (`gemma4_evaluation.py`).
4.  **Deployment:** Serving the fine-tuned adapter via vLLM on Cloud Run.
