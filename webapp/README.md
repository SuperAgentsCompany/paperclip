# EN-JP Tutor Web App Demo

This is a functional prototype of the English-Japanese AI Tutor, built with the Nova Design System.

## Features
- **Learning Dashboard:** 3-column layout for a focused learning experience.
- **Pedagogical Stream:** Chat bubbles that expand to show the model's internal reasoning.
- **Glass Box Reasoning:** A real-time sidebar visualizing the tutor's thought process.
- **Fine-tuned Gemma 4 Integration:** Powered by a model optimized for language teaching.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Vanilla CSS.
- **Backend:** Node.js, Express.
- **Design System:** Nova (Custom CSS Variables).

## How to Run

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Start the Backend
```bash
cd webapp/backend
npm install
node index.js
```
The backend runs on `http://localhost:3001`.

### 3. Start the Frontend
```bash
cd webapp/frontend
npm install
npm run dev
```
The frontend runs on `http://localhost:3000`.

## Design Compliance
This prototype strictly adheres to the Nova Design System specifications:
- **Colors:** Quantum Blue, Electric Cyan, Thought Purple, etc.
- **Typography:** Inter for UI, JetBrains Mono for reasoning.
- **Components:** Glass Box sidebar, Pedagogical bubbles, Logic-based feedback.
