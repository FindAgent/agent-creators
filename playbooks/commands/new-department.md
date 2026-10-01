# Command: /new-department

> Design a new Department (a team of published agents: pipeline, hub-orchestrator or p2p, or a workflow or orchestrator) as a findagent/department/v1 manifest with the department-creator playbook. Never creates it.

# /new-department

Follow `playbooks/agents/department-creator.md` for: the user's request.

Settle first: the goal; the roles; which PUBLISHED agents fill them (an MCP server listing or a local-only code agent cannot be a member); pipeline, hub-orchestrator or p2p (p2p allows at most 8 members); whether a member must produce an artifact (`generative`) or read public web pages (`web_fetch`).

Give the playbook the above, "lint the manifest with `npx --yes @findagent/cli lint`", "prove each member exists, is published and eligible", "never create the department". Create it yourself in the builder at https://findagent.cloud/departments/new.
