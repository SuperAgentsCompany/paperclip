# SUPAA Infrastructure

## Cloud Environment: Google Cloud Platform (GCP)
Project ID: `super-power-agents`

## Compute Resources
1.  **Serving (Cloud Run):**
    - Service: `gemma4-4b` (Base Model)
    - Service: `gemma4-coding` (Specialized Coding Model)
    - Service: `tutor-backend` (EN-JP Tutor API)
    - Service: `tutor-frontend` (EN-JP Tutor Web UI)
    - Service: `supaa-api` (Legacy/General API)
    - Service: `orchestration-layer` (Task Orchestrator)
    - Region: `us-central1` (mostly)
    - Hardware: GPUs (L4/RTX 6000) for model services; Standard for apps.

## CI/CD Pipeline
- **Tool:** GitHub Actions
- **Workflow:** `.github/workflows/deploy-tutor.yml`
- **Trigger:** Pushes to `master` branch.
- **Process:** Docker build -> Push to GCR -> Deploy to Cloud Run.
2.  **Fine-tuning (Compute Engine):**
    - VM: `hermes-finetune-gemma`
    - Region: `asia-southeast1-b`
    - Hardware: 1x NVIDIA L4 GPU.
    - Software: PyTorch, Unsloth, HuggingFace Transformers.
3.  **Development VM:**
    - VM: `gemma-tuning-vm`
    - Region: `us-central1-a`
    - Hardware: 1x NVIDIA Tesla T4 GPU.

## Storage
- **Model Cache (GCS):** `gs://super-power-agents-model-cache/`
- **Dataset Storage:** Local `.jsonl` files in the Paperclip workspace, backed up to GCS.

## Networking
- **VPC:** `gemma-vpc`
- **Subnet:** `gemma-subnet`
- Cloud Run is publicly accessible via the authenticated endpoint, restricted to Paperclip agents and the Web MVP.
