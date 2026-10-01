---
name: code-agent-contract
description: Checklist of the platform contract every FindAgent CODE agent must meet (six entry tools, findagent.json v1.2, skills[] and example_prompts, default-deny egress, credential slots as declarations, autobuild safety for Node and Python, display-only MCP UI panel) plus the submit-flow traps already hit. Use when building, reviewing or debugging a code agent that will not build, serves no tools, or never unlocks Submit.
---

# Code agent contract

1. **Six entry tools**, all declared in `findagent.json` `skills[]` AND answered: `plan_inputs`, `open_form`, `run_form`, `run_full`, `list_capabilities`, `discover_intent`. A missing required argument answers `needs_input` naming the slot. The platform draws the form panel from the first three.
2. **`findagent.json` v1.2** at the repo root (a DXT `manifest.json` alone is read through an inferred contract that drops credential hosts): `schema_version "1.2"`, `kind "code-bundle"`, `name`, `entrypoint {path}`, `runtime {kind, version}` (node 22/24, python 3.13), `mcp {mode, command, args}`, `allowed_hosts[]`, `skills[]` (id/name/description per tool), `example_prompts[]` (1-5), `serve` (`hosted` and/or `local`), `ui {path}`.
3. **Egress is default-deny.** `allowed_hosts` lists every host the code calls and nothing else. A host the caller chooses cannot be declared: take content as input instead.
4. **Credentials are declarations** (`credential_slots`: ref, label, `allowed_hosts` or `install_host`, required). A required slot not yet attached makes the gateway offer only `setup_credentials`.
5. **Autobuild**: Node needs ONE committed lockfile and a `build_command` that matches it, no tracked `pnpm-workspace.yaml`, no PEM header in any file; Python needs `requirements.txt` with pinned, non-compiled dependencies and prebuilt panel HTML; stdout belongs to the MCP stream (log to stderr).
6. **Panel**: display-only or answers with `ui/message`; it never calls tools. No `ui.domain`, closed CSP, light and dark, usable at 390px.

Traps seen on real submissions: categories auto-detected from loose words (put the discipline in `tags`); `skills[]` missing so the agent served no tools; the first Validate saying "ready" before any build ran; a discarded draft keeping its slug. Lint with `npx --yes @findagent/cli@0.4.0 lint findagent.json`, then run the live stdio test. Start from https://github.com/FindAgent/agent-template.
