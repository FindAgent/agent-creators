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
| `port-agent-creator` | A **port plan** for an existing repository (skills collection, vendor plugin, rules repo, OpenAPI wrapper, MCP server, framework agent): which creator takes it, and what is kept, left out or refused | `/port-agent` |

Plus three helper commands: `/check-agent` (or `node scripts/check-agent.mjs <path>`, which runs `npx @findagent/cli check` on a repository folder and `lint` on one manifest file), `/use-the-editor` (how to write and submit a package in the browser Editor at [findagent.cloud/editor](https://findagent.cloud/editor)) and `/connect-github` (how to connect GitHub for the repository doors). Three skills are shared by the creators: `agent-plugins-format`, `code-agent-contract`, `submit-new-agent`.

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

(Claude Code users can type `/new-code-agent <idea>` instead.) With the FindAgent platform MCP connected (next section) the assistant can also create the draft over MCP. The creator starts from the reference template, [FindAgent/agent-template](https://github.com/FindAgent/agent-template) (see below for which variant), builds and tests the agent in your own repository, lints the manifest and stops. **No creator submits or publishes anything.** You submit at [findagent.cloud/submit](https://findagent.cloud/submit); the submission is scanned and reviewed by a person.

## Connect the platform MCP

The platform MCP is `https://mcp.findagent.cloud/mcp`. It uses OAuth, so an unauthenticated request answers 401 by design and your client sends you through a sign-in. This repository ships a ready-made config for three assistants only:

| Assistant | Config in this repository |
|---|---|
| Claude Code | `.mcp.json` |
| Cursor | `.cursor/mcp.json` |
| VS Code with GitHub Copilot | `.vscode/mcp.json` |

`mcp.json` holds the same server in the [Agent Plugins](https://agent-plugins.org) format, for tools that install this repository as a package. Other assistants need one manual step:

- **Codex:** `codex mcp add findagent --url https://mcp.findagent.cloud/mcp` (or a `[mcp_servers.findagent]` table with `url` in `~/.codex/config.toml`).
- **Gemini CLI:** `gemini mcp add --transport http findagent https://mcp.findagent.cloud/mcp`.
- **Windsurf:** add `"findagent": { "serverUrl": "https://mcp.findagent.cloud/mcp" }` under `mcpServers` in the `mcp_config.json` that Windsurf's MCP settings open (see Windsurf's MCP docs for where it lives).
- **Aider:** this repository has no MCP config for it; the creators still work without MCP, and you submit at [findagent.cloud/submit](https://findagent.cloud/submit).

Without the MCP the playbooks still build and check the agent; only the "create the draft over MCP" step is left to you on the web.

## Scripts

```
node scripts/check-agent.mjs <repository folder>          # the marketplace's own whole-repo check (findagent check)
node scripts/check-agent.mjs <findagent.json | plugin.json>  # lint one manifest (findagent lint)
node scripts/build-adapters.mjs                         # regenerate playbooks/ and the per-assistant files
node scripts/build-adapters.mjs --check                 # CI: fail when they are stale
node scripts/check-mcp-configs.mjs                      # CI: the four MCP configs are valid for their client
```

`agents/`, `commands/` and `skills/` are the source; `mcp.json`, `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `playbooks/`, `AGENTS.md`, `GEMINI.md`, `CONVENTIONS.md`, `.github/copilot-instructions.md` and `.cursor/rules/` are generated from them.

## Which assistants this was checked with

The playbooks are plain Markdown, so any assistant that can read files and run commands can follow them. The adapters
(`CLAUDE.md`, `GEMINI.md`, `CONVENTIONS.md`, `.github/copilot-instructions.md`, `.cursor/rules/`, `.aider.conf.yml`) are
generated and CI checks they are current. The scripts were run here on Windows with Node 25; CI is configured for Node 22. The
playbooks were exercised end to end with Claude Code only; Codex, Cursor, Gemini CLI, GitHub Copilot and Aider read the
same files but no run with them is recorded here. The Codex, Gemini CLI and Windsurf steps under "Connect the platform MCP" are taken from those tools' documentation and were not run here.

## Which template variant each creator uses

[FindAgent/agent-template](https://github.com/FindAgent/agent-template) has six variants, scaffolded with `python scripts/init_agent.py <variant> <new-repo-dir>`. That script is Python 3, so **Python 3 must be installed even for a Node agent**.

| Creator | Variant |
|---|---|
| `code-agent-creator` | `node`, `python` or `framework` |
| `package-agent-creator` | `package` |
| `actions-agent-creator` | `actions` |
| `mcp-listing-creator` | `listing` |
| `department-creator`, `port-agent-creator` | none (a manifest, or a plan) |

## What they will not do

- Put a secret or key into any file, or ask for one.
- Add a mock mode, demo data or a "TODO" to shipped code.
- Declare an egress host the code does not call, or a credential without its host.
- Submit, publish or create anything on your behalf.

## Docs

[Creator guide](https://findagent.cloud/docs/creator-guide) · [Code agents](https://findagent.cloud/docs/code-agents) · [Manifest](https://findagent.cloud/docs/manifest) · [Departments](https://findagent.cloud/docs/departments) · [Security](https://findagent.cloud/docs/security)

MIT licensed.
