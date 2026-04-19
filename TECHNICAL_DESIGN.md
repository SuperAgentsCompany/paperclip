# SUPAA Detailed Technical Design

This document provides the technical specifications for the SUPAA platform, covering the API, Database, and Orchestration layers.

## 1. API Design

SUPAA utilizes a multi-backend architecture to support both core platform services and specialized product demonstrations.

### 1.1 Core Platform API (FastAPI)
The central API for multi-agent management, project lifecycle, and task orchestration.
- **Stack:** Python, FastAPI.
- **Location:** `api/`
- **Responsibilities:**
    - Agent lifecycle management.
    - Project and workspace provisioning.
    - Centralized telemetry and logging.

### 1.2 EN-JP Tutor API (Express/Node.js)
A specialized high-performance backend optimized for the English-Japanese language teaching MVP.
- **Stack:** Node.js, Express.
- **Location:** `tutor-backend/`
- **Responsibilities:**
    - Real-time streaming of model responses.
    - Pedagogical reasoning extraction.
    - Language-learning session management.

## 2. Database Schema (PostgreSQL + pgvector)

### 2.1 Core Tables

#### `users` / `waitlist`
- `id`: UUID (PK)
- `email`: String (Unique)
- `hashed_password`: String (for users)
- `created_at`: Timestamp

#### `projects`
- `id`: UUID (PK)
- `name`: String
- `description`: Text
- `owner_id`: UUID (FK -> users.id)

#### `agents`
- `id`: UUID (PK)
- `project_id`: UUID (FK -> projects.id)
- `name`: String
- `role`: String
- `system_prompt`: Text
- `model`: String (e.g., 'gemma4-4b-it')

#### `tasks`
- `id`: UUID (PK)
- `project_id`: UUID (FK -> projects.id)
- `title`: String
- `status`: Enum ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')
- `result`: JSONB (Final output summary)

#### `knowledge_base`
- `id`: UUID (PK)
- `project_id`: UUID (FK -> projects.id)
- `filename`: String
- `content`: Text
- `embedding`: Vector(768) (pgvector)

## 3. Orchestration Logic

The orchestration layer manages the lifecycle of a task and coordinates between multiple agents via **Paperclip**.

### 3.1 Task State Machine
1.  **PENDING:** Task created, waiting for orchestrator.
2.  **PLANNING:** Orchestrator analyzes the task and breaks it down into sub-tasks.
3.  **RUNNING:** Agents are executing sub-tasks.
4.  **REVIEW:** Results are being aggregated and validated.
5.  **COMPLETED/FAILED:** Terminal states.

### 3.2 Agent Handoff Mechanism
- The **Orchestrator** acts as a central router.
- When an agent finishes its work, it returns a `HandoffRequest` containing `next_agent_role`, `payload`, and `context_summary`.
- The Orchestrator validates the request and spins up the next agent instance.

### 3.3 Context Management
- **Conversation History:** Stored in Redis during active execution.
- **RAG (Retrieval-Augmented Generation):** Before each agent turn, relevant project context is injected from the `knowledge_base` using pgvector similarity search.
- **Artifacts:** Code, docs, and images are stored in Cloud Storage.
