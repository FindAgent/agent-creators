---
name: agent-plugins-format
description: Reference for how FindAgent stores every agent as ONE Agent Plugins 1.0 package (plugin.json, skills/, commands/, agents/, hooks/, scripts/, mcp.json, extensions["cloud.findagent"].actions) and which parts work in Connect versus Install only. Use when authoring or reviewing any agent's files, or when someone asks what an agent is made of.
---

# Agent Plugins 1.0 on FindAgent

## What an agent is made of

**An Agent is one package with four parts:** Instructions, Skills, Actions, Code. Two ways to use it: **Connect** (add the gateway address in any MCP client; everything runs on FindAgent) and **Install** (a plugin from the catalog, only for apps that install plugins).

| Path | Part | Notes |
|---|---|---|
| `plugin.json` | identity | `$schema` https://agent-plugins.org/schemas/1.0.0/plugin.schema.json; `name` `^[a-z0-9](?:[a-z0-9.-]{0,62}[a-z0-9])?$` (refused, never rewritten) |
| `skills/<id>/SKILL.md` | Skills | frontmatter `name` (lowercase, digits, single hyphens, equal to the folder id) + `description` (<=1024); at most 40 per agent, refused not cut |
| `skills/instructions/SKILL.md` | Instructions | the reserved skill carrying the agent's behaviour |
| `extensions["cloud.findagent"].actions` | Actions | `{tools, credential_slots}`; http / prompt-template only; secrets are declarations, never values |
| `findagent.json` (v1.2, `kind: code-bundle`) | Code | entrypoint, runtime, `allowed_hosts`, `skills[]`, `example_prompts[]`. `skills[]` are the code's MCP tool descriptors, NOT Agent Skills. A code repo may also carry `plugin.json` + `skills/<id>/SKILL.md` (+ `commands/`, `agents/`): only those paths become its package; generated launcher configs, `hooks/`, `scripts/` and the code never do |
| `commands/*.md`, `agents/*.md` | commands, sub-agents | served in Connect as prompts `command-<name>` / `agent-<name>` |
| `hooks/`, `scripts/`, `bin/`, a launcher `mcp.json` with a `command`, shell forms, `allowed-tools: Bash` | machine-side | **Install only**, off Connect, buyer consent; never the default |
| `mcp.json` | gateway address | written by FindAgent in the Agent Plugins form (`$schema` + `mcpServers`, `type: "streamable-http"`); Claude Code's own `.mcp.json` (`type: "http"`) is written beside it. Never hand-author either |

Departments are not plugins (one connection over several agents) and MCP server listings are not agents (FindAgent never runs the server).

## Accepted manifest formats

| Format | Recognised by |
|---|---|
| Agent Plugins | root `plugin.json` whose `$schema` contains `agent-plugins.org/schemas/` |
| Codex plugin | root `plugin.json` with `extensions["com.openai"]`, or `.codex-plugin/plugin.json` |
| Claude plugin | `.claude-plugin/plugin.json` |
| Cursor plugin | `.cursor-plugin/plugin.json` |
| Gemini extension | `gemini-extension.json` (its context file, default `GEMINI.md`, is kept) |
| FindAgent manifest | `findagent.json` (also `.findagent/manifest.json`, `.findagent/findagent.json`, `.findagent.json`) |
| Bare skills tree | no manifest: any `SKILL.md` outside dependency and build folders is a skill |

Rule files: root `AGENTS.md`, `.cursorrules`, `.windsurfrules`, `.cursor/rules/*`, `.windsurf/rules/*` and `.continue/rules/*` each become a skill (they count toward the 40). `CLAUDE.md`, `.clinerules`, `copilot-instructions.md` and `CONVENTIONS.md` are not package parts; put standing instructions in `skills/instructions/SKILL.md`.

## What reaches a buyer today

Machine-side parts (hooks, scripts, executables, launchers) are stored and scanned but reach no buyer today: Connect never serves them, and the public plugin catalog exports every agent without that content. Do not design an agent that depends on them.

## Checking

Check a package tree or any agent repository with `npx --yes @findagent/cli@latest check <dir>` (offline, whole repo); lint one manifest or a package's `plugin.json` with `npx --yes @findagent/cli@latest lint <path>`. Spec: https://agent-plugins.org and https://findagent.cloud/docs/manifest.
