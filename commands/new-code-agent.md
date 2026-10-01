---
description: Build a new CODE agent (a Node or Python MCP server with the six FindAgent entry tools, findagent.json and an optional display-only panel) with the code-agent-creator subagent. Never submits.
argument-hint: <what the agent does> [node|python]
---

# /new-code-agent

Dispatch the `code-agent-creator` subagent for: `$ARGUMENTS`.

Settle first, deciding from the code or docs rather than guessing: the agent's single job; Node or Python (Python for data and parsing work, Node otherwise); the hosts it will call (they become `allowed_hosts`); whether it needs a buyer credential (declare a slot, never a value).

Give the subagent: the job, the runtime, the hosts, "start from https://github.com/FindAgent/agent-template", "lint with `npx --yes @findagent/cli lint findagent.json` and paste the output", "never submit or publish". When it returns, lint again yourself, then submit at https://findagent.cloud/submit (GitHub door) when you are ready.
