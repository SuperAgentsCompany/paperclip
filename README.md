# SUPAA - Multi-Agent Orchestration Platform

SUPAA is the intelligent orchestration layer for multi-agent AI systems, built for scalability and performance on Google Cloud Platform.

## Repository Structure

- `api/`: FastAPI backend service.
  - `app/`: Application logic.
  - `Dockerfile`: Container definition for backend.
  - `requirements.txt`: Python dependencies.
- `frontend/`: Next.js (React) frontend.
  - `src/app/`: Next.js App Router pages and layouts.
  - `Dockerfile`: Container definition for frontend.
  - `package.json`: Node.js dependencies.
- `infra/terraform/`: GCP Infrastructure as Code.
- `docker-compose.yml`: Local development setup.
- `tutor-backend/`: Node.js backend for the EN-JP Tutor.
- `tutor-frontend/`: Vite/React frontend for the EN-JP Tutor.

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

### Infrastructure Deployment (Terraform)

1. Initialize Terraform:
   ```bash
   cd infra/terraform
   terraform init
   ```

2. Plan the deployment:
   ```bash
   terraform plan -var="project_id=YOUR_PROJECT_ID" -var="db_password=YOUR_DB_PASSWORD"
   ```

3. Apply the changes:
   ```bash
   terraform apply -var="project_id=YOUR_PROJECT_ID" -var="db_password=YOUR_DB_PASSWORD"
   ```

## CI/CD Pipeline

Automated deployments are configured via GitHub Actions in `.github/workflows/deploy-tutor.yml`.
Pushes to the `master` branch trigger builds and deployments for both the Tutor frontend and backend to Google Cloud Run.

## Tech Stack

- **Backend:** Python (FastAPI), Node.js (Express).
- **Frontend:** Next.js, Vite/React, Vanilla CSS.
- **Models:** Gemma4-4b (Fine-tuned for EN-JP and Coding).
- **Data:** PostgreSQL (pgvector), Redis.
- **Cloud:** GCP (Cloud Run, Cloud SQL, Memorystore, Cloud Storage).
