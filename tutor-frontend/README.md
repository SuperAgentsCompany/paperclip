# EN-JP Tutor Frontend MVP

## Overview
The `tutor-frontend` is the frontend application for the EN-JP Tutor MVP. Designed as a "glass box" pedagogical interface, it provides real-time visibility into the AI tutor's reasoning process and a seamless conversational experience, routing user queries to our custom fine-tuned Gemma4-4B model.

## Technology Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS, enforcing the Nova Design System guidelines.
- **Routing/Deployment**: Nginx serving statically built assets on GCP Cloud Run.

## Getting Started
To run the tutor application locally:

```bash
npm install
npm run dev
```
Note: Ensure the `tutor-backend` service is also running (default proxy port is 3005).

## Key Features
- **Glass Box Reasoning**: The Right Sidebar (Pedagogical Reasoning) visualizes the LLM's thought stream.
- **Responsive Layout**: Designed mobile-first, adhering to 100dvh for optimal viewing.
- **Session Stats**: Dynamically integrates with the backend API to retrieve active progress.

For an in-depth look at the architecture, please refer to the [TUTOR_FRONTEND_TECHNICAL_DOC.md](https://github.com/SuperAgentsCompany/documentations/blob/main/TUTOR_FRONTEND_TECHNICAL_DOC.md) in our central documentation repository.
