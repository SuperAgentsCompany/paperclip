import os, requests

api_url = os.environ.get("PAPERCLIP_API_URL")
api_key = os.environ.get("PAPERCLIP_API_KEY")
company_id = os.environ.get("PAPERCLIP_COMPANY_ID")
agent_id = os.environ.get("PAPERCLIP_AGENT_ID")

payload = {
  "title": "Routine: Visible Progress Report",
  "description": "Generate a 30-minute visibility report of employee progress and post it.",
  "assigneeAgentId": agent_id,
  "projectId": "27b8f245-426e-40d1-bffe-bd9f7f4bbfc0",
  "priority": "high",
  "status": "active"
}

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

res = requests.post(f"{api_url}/api/companies/{company_id}/routines", headers=headers, json=payload)
print(res.status_code)
routine = res.json()
print("Routine ID:", routine["id"])

# Add trigger
trigger_payload = {
  "kind": "schedule",
  "cronExpression": "*/30 * * * *",
  "timezone": "UTC"
}
res2 = requests.post(f"{api_url}/api/routines/{routine['id']}/triggers", headers=headers, json=trigger_payload)
print(res2.status_code, res2.json())
