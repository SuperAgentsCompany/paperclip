terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud SQL (PostgreSQL + pgvector)
resource "google_sql_database_instance" "postgres" {
  name             = "supaa-db-instance"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro" # Minimum tier for MVP
  }
  deletion_protection = false
}

resource "google_sql_database" "database" {
  name     = "supaa"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "users" {
  name     = "supaa_admin"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Redis (Memorystore)
resource "google_redis_instance" "cache" {
  name           = "supaa-redis"
  memory_size_gb = 1
  region         = var.region
}

# Cloud Storage
resource "google_storage_bucket" "assets" {
  name     = "supaa-assets-${var.project_id}"
  location = var.region
}

# --- Cloud Run Services ---

# 1. Legacy/General API
resource "google_cloud_run_v2_service" "api" {
  name     = "supaa-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/${var.project_id}/supaa-api:latest"
      env {
        name  = "DATABASE_URL"
        value = "postgresql://supaa_admin:${var.db_password}@${google_sql_database_instance.postgres.public_ip_address}/supaa"
      }
      env {
        name  = "REDIS_HOST"
        value = google_redis_instance.cache.host
      }
    }
  }
}

# 2. EN-JP Tutor Backend
resource "google_cloud_run_v2_service" "tutor_backend" {
  name     = "tutor-backend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/${var.project_id}/tutor-backend:latest"
      env {
        name  = "GEMMA_API_ENDPOINT"
        value = "https://gemma4-4b-${var.project_id}.us-central1.run.app/v1/chat/completions"
      }
    }
  }
}

# 3. EN-JP Tutor Frontend
resource "google_cloud_run_v2_service" "tutor_frontend" {
  name     = "tutor-frontend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/${var.project_id}/tutor-frontend:latest"
    }
  }
}

# 4. Gemma4 Base Model (GPU)
resource "google_cloud_run_v2_service" "gemma4_base" {
  name     = "gemma4-4b"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "us-docker.pkg.dev/vertex-ai/vertex-vision-model-garden-dockers/pytorch-vllm-serve:gemma4"
      args = [
        "serve",
        "gs://${var.project_id}-model-cache/models/gemma-4-E4B-it",
        "--enable-chunked-prefill",
        "--enable-prefix-caching",
        "--dtype=bfloat16",
        "--max-num-seqs=64",
        "--gpu-memory-utilization=0.95",
        "--port=8080",
        "--host=0.0.0.0"
      ]
      resources {
        limits = {
          cpu    = "20"
          memory = "80Gi"
          "nvidia.com/gpu" = "1"
        }
      }
    }
    node_selector {
      accelerator = "nvidia-rtx-pro-6000"
    }
  }
}

# 5. Gemma4 Coding Model (GPU)
resource "google_cloud_run_v2_service" "gemma4_coding" {
  name     = "gemma4-coding"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "us-docker.pkg.dev/vertex-ai/vertex-vision-model-garden-dockers/pytorch-vllm-serve:gemma4"
      args = [
        "serve",
        "gs://${var.project_id}-model-cache/models/gemma-4-coding-adapter",
        "--dtype=bfloat16",
        "--port=8080"
      ]
      resources {
        limits = {
          cpu    = "20"
          memory = "80Gi"
          "nvidia.com/gpu" = "1"
        }
      }
    }
    node_selector {
      accelerator = "nvidia-rtx-pro-6000"
    }
  }
}

# --- IAM Policy for Public Access ---

resource "google_cloud_run_v2_service_iam_member" "api_public" {
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "tutor_backend_public" {
  location = google_cloud_run_v2_service.tutor_backend.location
  name     = google_cloud_run_v2_service.tutor_backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "tutor_frontend_public" {
  location = google_cloud_run_v2_service.tutor_frontend.location
  name     = google_cloud_run_v2_service.tutor_frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
