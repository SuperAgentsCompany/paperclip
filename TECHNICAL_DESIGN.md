# SUPAA Detailed Technical Design

This document provides the technical specifications for the SUPAA platform, covering the API, Database, and Orchestration layers.

## 1. API Design

The API is built using FastAPI and follows RESTful principles for data management, with WebSockets for real-time orchestration updates.

### 1.1 REST Endpoints

#### Projects
- `GET /projects`: List all projects.
- `POST /projects`: Create a new project.
- `GET /projects/{id}`: Get project details.
- `PATCH /projects/{id}`: Update project settings.

#### Agents
- `GET /agents`: List available agent templates.
- `GET /projects/{id}/agents`: List agents active in a project.
- `POST /projects/{id}/agents`: Deploy an agent instance to a project.

#### Tasks
- `GET /projects/{id}/tasks`: List all tasks in a project.
- `POST /projects/{id}/tasks`: Create a new task (triggers orchestration).
- `GET /tasks/{id}`: Get task status and artifacts.
- `GET /tasks/{id}/logs`: Get execution logs for a task.

#### Knowledge Base
- `POST /projects/{id}/knowledge`: Upload a document to the knowledge base (triggers embedding).
- `GET /projects/{id}/knowledge`: Search and list knowledge artifacts.

### 1.2 WebSocket Protocol

**Endpoint:** `WS /ws/orchestration/{task_id}`

**Client -> Server Events:**
- `cancel_task`: Request to stop the current orchestration.

**Server -> Client Events:**
- `agent_thought`: Streaming text of agent reasoning.
- `agent_action`: Notification of an agent calling a tool.
- `task_update`: Status change (e.g., `PENDING` -> `RUNNING`).
- `artifact_generated`: Notification of a new file or code snippet created.
- `handoff`: Notification of task passing from one agent to another.

## 2. Database Schema (PostgreSQL + pgvector)

### 2.1 Core Tables

#### `users`
- `id`: UUID (PK)
- `email`: String (Unique)
- `hashed_password`: String
- `created_at`: Timestamp

#### `waitlist`
- `id`: UUID (PK)
- `email`: String (Unique)
- `created_at`: Timestamp

#### `projects`
- `id`: UUID (PK)
- `name`: String
- `description`: Text
- `owner_id`: UUID (FK -> users.id)
- `created_at`: Timestamp

#### `agents`
- `id`: UUID (PK)
- `project_id`: UUID (FK -> projects.id)
- `name`: String
- `role`: String (e.g., 'researcher', 'coder')
- `system_prompt`: Text
- `model`: String (e.g., 'gemini-1.5-pro')

#### `tasks`
- `id`: UUID (PK)
- `project_id`: UUID (FK -> projects.id)
- `title`: String
- `description`: Text
- `status`: Enum ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')
- `result`: JSONB (Final output summary)
- `created_at`: Timestamp

#### `knowledge_base`
- `id`: UUID (PK)
- `project_id`: UUID (FK -> projects.id)
- `filename`: String
- `content`: Text
- `embedding`: Vector(768) (pgvector)
- `metadata`: JSONB

## 3. Orchestration Logic

The orchestration layer manages the lifecycle of a task and coordinates between multiple agents.

### 3.1 Task State Machine
1.  **PENDING:** Task created, waiting for orchestrator.
2.  **PLANNING:** Orchestrator analyzes the task and breaks it down into sub-tasks.
3.  **RUNNING:** Agents are executing sub-tasks.
4.  **REVIEW:** Results are being aggregated and validated.
5.  **COMPLETED/FAILED:** Terminal states.

### 3.2 Agent Handoff Mechanism
- The **Orchestrator** acts as a central router.
- When an agent finishes its work, it returns a `HandoffRequest` containing:
    - `next_agent_role`: The suggested next agent.
    - `payload`: Data to be passed.
    - `context_summary`: Condensed history of actions taken.
- The Orchestrator validates the request and spins up the next agent instance with the provided context.

### 3.3 Context Management
- **Conversation History:** Stored in Redis during active execution for fast retrieval.
- **RAG (Retrieval-Augmented Generation):** Before each agent turn, the Orchestrator queries the `knowledge_base` using pgvector to inject relevant project context into the agent's prompt.
- **Artifacts:** Code, docs, and images are stored in Cloud Storage, with references in PostgreSQL.
