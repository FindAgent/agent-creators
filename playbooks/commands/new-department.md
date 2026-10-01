# Command: /new-department

> Design a new Department (a team of published agents: pipeline, hub-orchestrator or p2p, or a workflow or orchestrator) as a findagent/department/v1 manifest with the department-creator playbook. Never creates it.

# /new-department

Follow the `department-creator` creator for this request: <the team's goal and the roles>

Settle first: the goal; the roles; which PUBLISHED agents fill them (an MCP server listing or a local-only code agent cannot be a member); pipeline, hub-orchestrator or p2p (p2p allows at most 8 members); whether a member must produce an artifact (`generative`) or read public web pages (`web_fetch`).

Hold the creator to the above: "lint the manifest with `npx --yes @findagent/cli@0.4.0 lint`", "prove each member exists, is published and eligible", "never create the department". Create it yourself in the builder at https://findagent.cloud/departments/new.
