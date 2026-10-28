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
| Maps an EXISTING repository in another format | `playbooks/agents/port-agent-creator.md` |

## Commands

- `playbooks/commands/check-agent.md`: Check a local agent repository (code agent, skills or plugin package, actions agent or department manifest) the way FindAgent reads it, before you submit. Local, read-only.
- `playbooks/commands/connect-github.md`: Walk the user through connecting GitHub to FindAgent, which the GitHub door of the submit page and the MCP tools findagent_import_repo, findagent_create_code_draft and findagent_create_package_draft with a repo all need.
- `playbooks/commands/new-actions-agent.md`: Build a new ACTIONS agent (declarative HTTP tools that use the buyer's own credentials, exact allowed hosts, guardrails) with the actions-agent-creator playbook. Never submits.
- `playbooks/commands/new-code-agent.md`: Build a new CODE agent (a Node or Python MCP server with the six FindAgent entry tools, findagent.json and an optional display-only panel) with the code-agent-creator playbook. Never submits.
- `playbooks/commands/new-department.md`: Design a new Department (a team of published agents: pipeline, hub-orchestrator or p2p, or a workflow or orchestrator) as a findagent/department/v1 manifest with the department-creator playbook. Never creates it.
- `playbooks/commands/new-mcp-listing.md`: Prepare an MCP SERVER LISTING (a hosted https or local stdio server that somebody already runs) with an introspected tool list and the right ownership proof, with the mcp-listing-creator playbook. Never submits.
- `playbooks/commands/new-package-agent.md`: Build a new INSTRUCTIONS + SKILLS agent as an Agent Plugins 1.0 package (plugin.json, skills/, commands/, agents/) with the package-agent-creator playbook. Never submits.
- `playbooks/commands/port-agent.md`: Plan how an existing repository (a skills collection, a vendor plugin, a rules repo, an OpenAPI wrapper, an MCP server, a framework agent) becomes a FindAgent agent with the port-agent-creator playbook. Plans only; never ports, submits or publishes.
- `playbooks/commands/use-the-editor.md`: Walk the user through the FindAgent Editor (https://findagent.cloud/editor), the browser door that writes an Agent Plugins package with instructions, actions, skills, commands and sub-agents and submits it for review. Nothing is published for them.

## Shared reference (skills)

- `skills/agent-plugins-format/SKILL.md`
- `skills/code-agent-contract/SKILL.md`
- `skills/submit-new-agent/SKILL.md`

## Requirements

Playbooks assume an assistant that can read and write files, run shell commands and read public web pages. Some steps also use the following, and must say "not checked: <tool> unavailable" when it is missing:

- network access once, to download the CLI the lint step runs (`npx @findagent/cli`), or a local clone of it;
- a connected FindAgent MCP server (`mcp.json`) for the catalogue and submission steps;
- Node 20+ for the scripts, plus `pnpm` and headless Chromium for code-agent panel checks, or Python 3.13 for Python agents;
- Python 3 for the scaffold script of the reference template (`python scripts/init_agent.py <variant> <dir>` in https://github.com/FindAgent/agent-template), which every creator starts from, even for a Node agent;
- an MCP client to run the finished agent live.

## Scripts

- `node scripts/check-agent.mjs <path>`: run the platform's own offline check with the latest `@findagent/cli` through npx (Node 20+): `check` on a repository folder, `lint` on one manifest file.
- `node scripts/build-adapters.mjs`: regenerate this file and the per-assistant files after editing `agents/`, `commands/` or `skills/`.

## Submitting over MCP

Connect the FindAgent platform MCP (`https://mcp.findagent.cloud/mcp`). Ready-made configs exist for Claude Code (`.mcp.json`), Cursor (`.cursor/mcp.json`) and VS Code with GitHub Copilot (`.vscode/mcp.json`); `mcp.json` is the same server in the Agent Plugins format. For any other assistant add the server by hand (README, "Connect the platform MCP"). Create drafts with `findagent_create_code_draft` (code; connect GitHub first, see `playbooks/commands/connect-github.md`), `findagent_create_package_draft` (instructions and skills, or a package with actions) or `findagent_create_draft` (a `findagent.json` doer with actions), then `findagent_preflight` and `findagent_submit_for_review` (it needs `confirm_original`, `confirm_not_prohibited` and `llms`, and two calls: the first returns the final slug, the second passes it as `confirm_slug`). Package uploads share a limit of 10 per 15 minutes. Use these repositories as the reference: https://github.com/FindAgent/agent-template for code and these playbooks for every part. A person reviews every submission.

## Rules every playbook shares

- Never put a secret or key in any file, and never ask the user for one.
- No mock mode, demo data or unfinished-work markers in shipped code.
- Declare only the egress hosts the code really calls, and a credential only together with its host.
- Never submit or publish for the user. They submit at https://findagent.cloud/submit (or over MCP) and a person reviews it.

Reference template for code agents: https://github.com/FindAgent/agent-template
