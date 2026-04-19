# SUPAA MVP UI/UX Prototype Specification

## 1. Overview
The SUPAA MVP focuses on providing a clear and powerful interface for multi-agent orchestration. The design follows the **Nova Design System** foundations.

## 2. Layout Structure

### 2.1 Global Navigation (Sidebar)
- **Position:** Left-fixed, 240px width.
- **Background:** `#0A2540` (Quantum Blue).
- **Items:**
  - Dashboard (Home icon)
  - Agents (User Group icon)
  - Orchestrations (Workflow icon)
  - Knowledge Base (Database icon)
  - Settings (Gear icon)

### 2.2 Main View (Dashboard)
- **Header:** Page title and user profile/notifications.
- **Grid Layout:** 3-column grid for top metrics, 2-column grid for main content.

## 3. Key Components

### 3.1 Agent Status Card
- **Background:** `#1E293B` (Slate 800).
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`.
- **Content:**
  - Agent Name (e.g., "Market Researcher")
  - Status Badge:
    - `Thinking`: Pulsing Electric Cyan dot.
    - `Active`: Steady Electric Cyan.
    - `Idle`: Slate 400.
  - Active Task snippet.

### 3.2 Orchestration Graph
- **Visual:** Nodes representing agents, edges representing data flow.
- **Interactivity:** Click node to view agent logs, hover edge to see data payload summary.

### 3.3 Generative Output Display
- **Container:** Slate card with a 4px left-border accent in Electric Cyan (`#00E5FF`).
- **Typography:** Markdown rendered using Inter for prose and JetBrains Mono for code blocks.
- **Actions:** Copy to clipboard, Export, Feedback (thumbs up/down).

## 4. User Flows

### 4.1 Initiating an Orchestration
1. User enters a prompt in the "Command Center" (Global Search/Input).
2. System suggests an orchestration plan.
3. User confirms plan.
4. Dashboard updates with agent status cards and the live orchestration graph.

### 4.2 Monitoring Agent Activity
1. User clicks on an active agent card.
2. A slide-over panel opens showing real-time logs and intermediate outputs.
