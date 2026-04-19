> [!TIP]
> **SYSTEM STATUS: ACTIVE**
> All specialized Gemma4 models (EN-JP and Coding) have been optimized with DPO alignment. Production services are healthy.

# SUPAA - Multi-Agent Orchestration Platform


SUPAA is the intelligent orchestration layer for multi-agent AI systems, built for scalability and performance on Google Cloud Platform.

## Technical Documentation
Detailed information on our architecture, data strategy, and specialized models can be found here:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System overview and component breakdown.
- [FRONTEND_ARCHITECTURE.md](https://github.com/SuperAgentsCompany/documentations/blob/main/engineering/architecture.md) - Frontend architecture, apps, and styling guidelines.
- [TUTOR_FRONTEND_TECHNICAL_DOC.md](https://github.com/SuperAgentsCompany/documentations/blob/main/engineering/tutor_frontend.md) - EN-JP Tutor frontend technical documentation.
- [TECHNICAL_DESIGN.md](./TECHNICAL_DESIGN.md) - Detailed API, Database, and Orchestration specs.
- [TECHNICAL_DATA_STRATEGY.md](./TECHNICAL_DATA_STRATEGY.md) - Our "Teacher-Student" distillation and fine-tuning approach.
- [STRATEGY_CUSTOM_MODEL.md](./STRATEGY_CUSTOM_MODEL.md) - Roadmap for proprietary model development.
- [ML_SCRIPTS.md](./ML_SCRIPTS.md) - Guide to our synthetic data generation and training tools.

## Repository Structure

- `api/`: FastAPI backend service (Core Platform).
- `tutor-backend/`: Node.js backend for the EN-JP Tutor MVP.
- `tutor-frontend/`: Vite/React frontend for the EN-JP Tutor MVP.
- `frontend/`: Next.js (React) frontend (Core Platform).
- `infra/terraform/`: GCP Infrastructure as Code.
- `docker-compose.yml`: Local development setup.

## Getting Started

### Local Development

To start the entire stack locally using Docker Compose:

```bash
docker-compose up --build
```

- API will be available at `http://localhost:8000`
- Frontend will be available at `http://localhost:3000`

### Public Prototype (Live)

The EN-JP Tutor prototype is live at the following URLs:

- **Frontend:** https://tutor-frontend-ybdfmwxycq-uc.a.run.app
- **Credentials:** `superagents` / `superagents`
- **Backend API:** https://tutor-backend-ybdfmwxycq-uc.a.run.app

## Tech Stack

- **Backend:** Python (FastAPI), Node.js (Express).
- **Frontend:** Next.js, Vite/React, Vanilla CSS.
- **Models:** Gemma4-4b (Fine-tuned for EN-JP and Coding).
- **Data:** PostgreSQL (pgvector), Redis.
- **Cloud:** GCP (Cloud Run, Cloud SQL, Memorystore, Cloud Storage).
