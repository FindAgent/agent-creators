# FindAgent agent creators

Subagents, commands and skills that help you build the parts of a [FindAgent](https://findagent.cloud) agent. This repository is itself an **Agent Plugins 1.0** package ([agent-plugins.org](https://agent-plugins.org)), so you can install it as a plugin or copy the files you need.

Every FindAgent agent is one package made of four parts: **Instructions**, **Skills**, **Actions** and **Code**. There is one creator for each way of building one:

| Subagent | Builds | Command |
|---|---|---|
| `code-agent-creator` | A **code agent**: a Node or Python MCP server with the six entry tools, `findagent.json` and an optional display-only panel | `/new-code-agent` |
| `package-agent-creator` | **Instructions + Skills**: a package of `SKILL.md` files, commands and sub-agents, no code | `/new-package-agent` |
| `actions-agent-creator` | **Actions**: declarative HTTP tools that use the buyer's own credentials, bound to exact hosts | `/new-actions-agent` |
| `department-creator` | A **Department**: a team of published agents with a topology, workflow or orchestrator | `/new-department` |
| `mcp-listing-creator` | An **MCP server listing** for a server somebody already runs | `/new-mcp-listing` |

Plus `/check-agent` (lints a manifest with `npx @findagent/cli lint`) and three skills the creators share: `agent-plugins-format`, `code-agent-contract`, `submit-new-agent`.

## Use it

Clone the repository, then either copy `agents/`, `commands/` and `skills/` into your project's `.claude/`, or start Claude Code with `claude --plugin-dir <path-to-this-repo>`.

Then, for a code agent:

```
/new-code-agent a tool that checks the health of a GitHub repository, node
```

The creator starts from the reference template, [FindAgent/agent-template](https://github.com/FindAgent/agent-template), builds and tests the agent in your own repository, lints the manifest and stops. **No creator submits or publishes anything.** You submit at [findagent.cloud/submit](https://findagent.cloud/submit); the submission is scanned and reviewed by a person.

## What they will not do

- Put a secret or key into any file, or ask for one.
- Add a mock mode, demo data or a "TODO" to shipped code.
- Declare an egress host the code does not call, or a credential without its host.
- Submit, publish or create anything on your behalf.

## Docs

[Creator guide](https://findagent.cloud/docs/creator-guide) · [Code agents](https://findagent.cloud/docs/code-agents) · [Manifest](https://findagent.cloud/docs/manifest) · [Departments](https://findagent.cloud/docs/departments) · [Security](https://findagent.cloud/docs/security)

MIT licensed.
