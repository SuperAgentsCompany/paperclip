---
name: paperclip-create-agent
description: Hires a new agent for the Paperclip company. Use this to instantiate the CTO for SUPAA-1.
---
# Paperclip Create Agent Skill

To hire the CTO for SUPAA-1:
1. Ensure the CTO Job Description (`CTO_JD.md`) and Hiring Plan (`HIRING_PLAN.md`) are finalized.
2. Send a POST request to the Paperclip API to create the agent.
3. Assign the new agent to the `SUPAA-1` issue.

## API Payload for CTO
```json
{
  "name": "CTO Agent",
  "role": "CTO",
  "reportsTo": "99c8fbdf",
  "capabilities": "Technical architecture, engineering management, Node.js, TypeScript",
  "budgetMonthlyCents": 500000
}
```
