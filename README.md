# FindAgent agent creators

Playbooks, commands and skills that help any AI assistant build the parts of a [FindAgent](https://findagent.cloud) agent. This repository is itself an **Agent Plugins 1.0** package ([agent-plugins.org](https://agent-plugins.org)), so you can install it as a plugin or copy the files you need.

Every FindAgent agent is one package made of four parts: **Instructions**, **Skills**, **Actions** and **Code**. There is one creator for each way of building one:

| Creator (playbook) | Builds | Claude Code command |
|---|---|---|
| `code-agent-creator` | A **code agent**: a Node or Python MCP server with the six entry tools, `findagent.json` and an optional display-only panel | `/new-code-agent` |
| `package-agent-creator` | **Instructions + Skills**: a package of `SKILL.md` files, commands and sub-agents, no code | `/new-package-agent` |
| `actions-agent-creator` | **Actions**: declarative HTTP tools that use the buyer's own credentials, bound to exact hosts | `/new-actions-agent` |
| `department-creator` | A **Department**: a team of published agents with a topology, workflow or orchestrator | `/new-department` |
| `mcp-listing-creator` | An **MCP server listing** for a server somebody already runs | `/new-mcp-listing` |

Plus `/check-agent` (or `node scripts/check-agent.mjs`, which lints a `findagent.json` or a department manifest with `npx @findagent/cli lint`; a package's `plugin.json` is checked by uploading the folder on the submit page and reading the "We found" card) and three skills the creators share: `agent-plugins-format`, `code-agent-contract`, `submit-new-agent`.

## Use it with any assistant

The creators are plain Markdown **playbooks** plus two Node scripts, so they work with any LLM provider that can read files and run commands. `AGENTS.md` is the entry point and lists every playbook.

| Assistant | How it picks this up |
|---|---|
| Claude Code | `claude --plugin-dir <this repo>`, or copy `agents/`, `commands/`, `skills/` into `.claude/` |
| Codex, Cursor, Copilot, Gemini CLI, Aider, others | Open this repo (or copy it into yours): they read `AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `GEMINI.md` or `CONVENTIONS.md`, which all point at `playbooks/` |
| Anything else | Tell the model: "read AGENTS.md, then follow playbooks/agents/code-agent-creator.md" |

Then ask for the agent, for example:

```
Build a code agent that checks the health of a GitHub repository, in node.
Follow playbooks/agents/code-agent-creator.md.
```

(Claude Code users can type `/new-code-agent <idea>` instead.) Every assistant gets the FindAgent platform MCP from `mcp.json` (also `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`), so it can also create the draft over MCP. The creator starts from the reference template, [FindAgent/agent-template](https://github.com/FindAgent/agent-template), builds and tests the agent in your own repository, lints the manifest and stops. **No creator submits or publishes anything.** You submit at [findagent.cloud/submit](https://findagent.cloud/submit); the submission is scanned and reviewed by a person.

## Scripts

```
node scripts/check-agent.mjs <path to findagent.json>   # lint with the marketplace's own validator
node scripts/build-adapters.mjs                         # regenerate playbooks/ and the per-assistant files
node scripts/build-adapters.mjs --check                 # CI: fail when they are stale
```

`agents/` and `commands/` are the source; `playbooks/`, `AGENTS.md`, `GEMINI.md`, `CONVENTIONS.md`, `.github/copilot-instructions.md` and `.cursor/rules/` are generated from them.

## Which assistants this was checked with

The playbooks are plain Markdown, so any assistant that can read files and run commands can follow them. The adapters
(`CLAUDE.md`, `GEMINI.md`, `CONVENTIONS.md`, `.github/copilot-instructions.md`, `.cursor/rules/`, `.aider.conf.yml`) are
generated and CI checks they are current. The scripts were run here on Windows with Node 25; CI is configured for Node 22. The
playbooks were exercised end to end with Claude Code only; Codex, Cursor, Gemini CLI, GitHub Copilot and Aider read the
same files but no run with them is recorded here.

## What they will not do

- Put a secret or key into any file, or ask for one.
- Add a mock mode, demo data or a "TODO" to shipped code.
- Declare an egress host the code does not call, or a credential without its host.
- Submit, publish or create anything on your behalf.

## Docs

[Creator guide](https://findagent.cloud/docs/creator-guide) · [Code agents](https://findagent.cloud/docs/code-agents) · [Manifest](https://findagent.cloud/docs/manifest) · [Departments](https://findagent.cloud/docs/departments) · [Security](https://findagent.cloud/docs/security)

MIT licensed.
