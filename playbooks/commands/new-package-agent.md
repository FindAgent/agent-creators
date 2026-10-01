# Command: /new-package-agent

> Build a new INSTRUCTIONS + SKILLS agent as an Agent Plugins 1.0 package (plugin.json, skills/, commands/, agents/) with the package-agent-creator playbook. Never submits.

# /new-package-agent

Follow `playbooks/agents/package-agent-creator.md` for: the user's request.

Settle first: the agent's role and boundaries (its Instructions); the list of skills (one job each, at most 40); any commands or sub-agents; whether anything must run on the buyer's machine (hooks and scripts make a part Install-only; default to none).

Give the playbook the role, the skill list, "no code, no machine-side parts unless stated", "never submit or publish". When it returns, upload the folder on https://findagent.cloud/submit (Upload door) and read the "We found" card before submitting.
