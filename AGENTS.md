# FindAgent agent creators: instructions for any AI assistant

This repository teaches an AI assistant to build a [FindAgent](https://findagent.cloud) agent. It is plain Markdown plus two Node scripts, so it works the same in Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, Aider or any assistant that can read files and run commands.

**How to use a playbook:** read the playbook named below in full, then do what it says in the user's own repository. Playbooks are the working instructions; skills are shared reference (`skills/<name>/SKILL.md`).

## Creators

| Build | Playbook |
|---|---|
| Builds the ACTIONS part of a FindAgent agent | `playbooks/agents/actions-agent-creator.md` |
| Builds the CODE part of a FindAgent agent end to end | `playbooks/agents/code-agent-creator.md` |
| Designs a FindAgent Department | `playbooks/agents/department-creator.md` |
| Prepares an MCP SERVER LISTING for FindAgent | `playbooks/agents/mcp-listing-creator.md` |
| Builds the INSTRUCTIONS and SKILLS part of a FindAgent agent | `playbooks/agents/package-agent-creator.md` |

## Commands

- `playbooks/commands/check-agent.md`: Lint an agent manifest (findagent.json, a department manifest or a package's plugin.json) with the same validator the FindAgent marketplace runs at submit. Local, read-only.
- `playbooks/commands/new-actions-agent.md`: Build a new ACTIONS agent (declarative HTTP tools that use the buyer's own credentials, exact allowed hosts, guardrails) with the actions-agent-creator playbook. Never submits.
- `playbooks/commands/new-code-agent.md`: Build a new CODE agent (a Node or Python MCP server with the six FindAgent entry tools, findagent.json and an optional display-only panel) with the code-agent-creator playbook. Never submits.
- `playbooks/commands/new-department.md`: Design a new Department (a team of published agents: pipeline, hub-orchestrator or p2p, or a workflow or orchestrator) as a findagent/department/v1 manifest with the department-creator playbook. Never creates it.
- `playbooks/commands/new-mcp-listing.md`: Prepare an MCP SERVER LISTING (a hosted https or local stdio server that somebody already runs) with an introspected tool list and the right ownership proof, with the mcp-listing-creator playbook. Never submits.
- `playbooks/commands/new-package-agent.md`: Build a new INSTRUCTIONS + SKILLS agent as an Agent Plugins 1.0 package (plugin.json, skills/, commands/, agents/) with the package-agent-creator playbook. Never submits.

## Shared reference (skills)

- `skills/agent-plugins-format/SKILL.md`
- `skills/code-agent-contract/SKILL.md`
- `skills/submit-new-agent/SKILL.md`

## Requirements

Playbooks assume an assistant that can read and write files, run shell commands and read public web pages. Some steps also use the following, and must say "not checked: <tool> unavailable" when it is missing:

- network access once, to download the CLI the lint step runs (`npx @findagent/cli`), or a local clone of it;
- a connected FindAgent MCP server (`mcp.json`) for the catalogue and submission steps;
- Node 20+ for the scripts, plus `pnpm` and headless Chromium for code-agent panel checks, or Python 3.13 for Python agents;
- an MCP client to run the finished agent live.

## Scripts

- `node scripts/check-agent.mjs <path>`: lint a manifest with the same validator the marketplace runs (Node 20+; downloads the pinned `@findagent/cli` through npx).
- `node scripts/build-adapters.mjs`: regenerate this file and the per-assistant files after editing `agents/`, `commands/` or `skills/`.

## Submitting over MCP

Connect the FindAgent platform MCP (`https://mcp.findagent.cloud/mcp`; ready-made configs: `mcp.json`, `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`). Create drafts with `findagent_create_code_draft` (code), `findagent_create_package_draft` (instructions and skills) or `findagent_create_draft` (actions), then `findagent_submit_for_review`. Use these repositories as the reference: https://github.com/FindAgent/agent-template for code and these playbooks for every part. A person reviews every submission.

## Rules every playbook shares

- Never put a secret or key in any file, and never ask the user for one.
- No mock mode, demo data or unfinished-work markers in shipped code.
- Declare only the egress hosts the code really calls, and a credential only together with its host.
- Never submit or publish for the user. They submit at https://findagent.cloud/submit (or over MCP) and a person reviews it.

Reference template for code agents: https://github.com/FindAgent/agent-template
