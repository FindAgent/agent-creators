---
description: Build a new INSTRUCTIONS + SKILLS agent as an Agent Plugins 1.0 package (plugin.json, skills/, commands/, agents/) with the package-agent-creator subagent. Never submits.
argument-hint: <what the agent should know or do>
---

# /new-package-agent

Dispatch the `package-agent-creator` subagent for: `$ARGUMENTS`.

Settle first: the agent's role and boundaries (its Instructions); the list of skills (one job each, at most 40); any commands or sub-agents; whether anything must run on the buyer's machine (hooks and scripts make a part Install-only; default to none).

Give the subagent the role, the skill list, "no code, no machine-side parts unless stated", "never submit or publish". When it returns, upload the folder on https://findagent.cloud/submit (Upload door) and read the "We found" card before submitting.
