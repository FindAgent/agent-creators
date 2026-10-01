---
name: agent-plugins-format
description: Reference for how FindAgent stores every agent as ONE Agent Plugins 1.0 package (plugin.json, skills/, commands/, agents/, hooks/, scripts/, mcp.json, extensions["cloud.findagent"].actions) and which parts work in Connect versus Install only. Use when authoring or reviewing any agent's files, or when someone asks what an agent is made of.
---

# Agent Plugins 1.0 on FindAgent

**An Agent is one package with four parts:** Instructions, Skills, Actions, Code. Two ways to use it: **Connect** (add the gateway address in any MCP client; everything runs on FindAgent) and **Install** (a plugin from the catalog, only for apps that install plugins).

| Path | Part | Notes |
|---|---|---|
| `plugin.json` | identity | `$schema` https://agent-plugins.org/schemas/1.0.0/plugin.schema.json; `name` `^[a-z0-9](?:[a-z0-9.-]{0,62}[a-z0-9])?$` (refused, never rewritten) |
| `skills/<id>/SKILL.md` | Skills | frontmatter `name` (lowercase, digits, single hyphens, equal to the folder id) + `description` (<=1024); at most 40 per agent, refused not cut |
| `skills/instructions/SKILL.md` | Instructions | the reserved skill carrying the agent's behaviour |
| `extensions["cloud.findagent"].actions` | Actions | `{tools, credential_slots}`; http / prompt-template only; secrets are declarations, never values |
| `findagent.json` (v1.2, `kind: code-bundle`) | Code | entrypoint, runtime, `allowed_hosts`, `skills[]`, `example_prompts[]` |
| `commands/*.md`, `agents/*.md` | commands, sub-agents | served in Connect as prompts `command-<name>` / `agent-<name>` |
| `hooks/`, `scripts/`, `bin/`, a launcher `mcp.json` with a `command`, shell forms, `allowed-tools: Bash` | machine-side | **Install only**, off Connect, buyer consent; never the default |
| `mcp.json` | gateway address | written by FindAgent |

Departments are not plugins (one connection over several agents) and MCP server listings are not agents (FindAgent never runs the server).

Check a manifest with `npx --yes @findagent/cli lint <path>`; check a package tree by uploading it on https://findagent.cloud/submit (Upload) and reading the "We found" card. Spec: https://agent-plugins.org and https://findagent.cloud/docs/manifest.
