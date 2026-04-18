# Technical Investigation: GCP Resources and Gemma4 Integration (SUPAA-21)

## Executive Summary
This report summarizes the current state of GCP infrastructure and the feasibility of integrating the Gemma4 model into the SUPAA platform. Our investigation confirms that a Gemma4 4B model is already deployed and accessible, and the necessary compute resources for fine-tuning are available.

## 1. GCP Infrastructure Status
The project `super-power-agents` is currently hosting several key resources:

- **Serving Layer (Cloud Run):** 
    - Service: `gemma4-4b`
    - Region: `us-central1`
    - Endpoint: `https://gemma4-4b-762452591869.us-central1.run.app`
    - Hardware: 1x NVIDIA RTX Pro 6000 GPU, 80Gi RAM, 20 vCPUs.
    - Status: **Online & Publicly Accessible**.
- **Model Storage (GCS):**
    - Path: `gs://super-power-agents-model-cache/models/gemma-4-E4B-it/`
    - Contains the base Gemma4 4B Instruct model.
- **Compute Engine (Development/Tuning):**
    - `hermes-finetune-gemma` (asia-southeast1-b): 1x NVIDIA L4 GPU. Ideal for LoRA/QLoRA fine-tuning.
    - `gemma-tuning-vm` (us-central1-a): 1x NVIDIA Tesla T4 GPU.
- **Networking:**
    - Custom VPC `gemma-vpc` and subnet `gemma-subnet` are configured for secure inter-service communication.

## 2. Gemma4 Model Capabilities
Preliminary testing of the deployed `gemma4-4b` service confirms:
- **OpenAI Compatibility:** The vLLM serving stack provides a standard `/v1/chat/completions` endpoint.
- **Tool Use:** Native tool-calling is functional and highly accurate. The model correctly identifies and formats arguments for defined tools.
- **Reasoning:** The model supports internal reasoning. While the current vLLM configuration allows for a `reasoning` field, further calibration on trigger tokens/tags is required to fully leverage the `reasoning-parser=gemma4` feature.

## 3. Integration Plan with Paperclip
To integrate Gemma4 into the core SUPAA orchestration platform:

1.  **Gemma4 CLI Adapter:** Develop a lightweight CLI (or Python-based wrapper) that interacts with the Cloud Run endpoint.
2.  **Paperclip Adapter:** Implement a `gemma4_local` adapter in the `paperclip` repository. This adapter will follow the pattern of existing local adapters (like `gemini_local`) but optimized for Gemma4's specific reasoning and tool-calling output formats.
3.  **Migration:** Transition existing agents (CEO, CMO, UX) to use the `gemma4_local` adapter to leverage the proprietary fine-tuned models as they become available.

## 4. Next Steps & Recommendations
- **Immediate:** Refine the prompt templates to stabilize the reasoning output and capture it in the Paperclip UI.
- **Short-term:** Initiate Phase 1 of the `STRATEGY_CUSTOM_MODEL.md` (Benchmarking) using the `hermes-finetune-gemma` VM.
- **Infrastructure:** Monitor GPU utilization on Cloud Run to determine if scaling to multiple instances or moving to GKE is necessary as agent concurrency increases.

**Conclusion:** The technical foundation for the Gemma4 revolution is ready. We can proceed with the integration and fine-tuning phases immediately.
