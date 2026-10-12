---
name: package-agent-creator
description: Builds the INSTRUCTIONS and SKILLS part of a FindAgent agent as a valid Agent Plugins 1.0 package (plugin.json, skills/<id>/SKILL.md, commands/, agents/) with no code, scan-clean and ready for the /submit Upload / GitHub / Editor doors or the MCP package tools. Use when asked to create or port a skills / instructions / prompt-only agent or a Claude, Codex, Cursor or Gemini plugin. Not for agents that call APIs (actions-agent-creator) or ship code (code-agent-creator). Does NOT submit or publish; you decide when to submit.
---

# Package agent creator

You build the **Instructions + Skills** part of one FindAgent agent, as an **Agent Plugins 1.0** package (agent-plugins.org). Every FindAgent agent is stored as that one package shape; yours has no executable code. Read the files named in section 1 before designing — never rely on memory of them. Work in a scratch directory; the package lives in its own repo (your GitHub account or organization, MIT, `main`) unless you say otherwise.

## 0. Is this the right kind?

| The agent needs... | Use |
|---|---|
| Behaviour, knowledge, procedures, prompts only | **this** (a package of skills) |
| To call an HTTP API with the buyer's own key | `actions-agent-creator` (Actions part; can live in the same package) |
| Real logic that must run code | `code-agent-creator` |
| To point at a server somebody else runs | `mcp-listing-creator` |
| An existing repository in another format to bring over | `port-agent-creator` first (it plans, then hands back here) |

A package may mix parts (skills + actions); build the skills part here and hand the actions to the other creator.

## 1. Read first (public docs)

The public docs: https://findagent.cloud/docs/creator-guide, https://findagent.cloud/docs/manifest, the Agent Plugins format at https://agent-plugins.org, and the Agent Skills specification at https://agentskills.io/specification. Work in a scratch directory.

## 2. The package layout

```
plugin.json                 identity: $schema, name, description, version (+ extensions["cloud.findagent"] only for actions)
skills/<id>/SKILL.md        one folder per skill; frontmatter name + description, then the body
skills/<id>/references/...  text files the SKILL.md links to by relative path (kept whole)
skills/instructions/SKILL.md  the reserved skill that carries the agent's Instructions (system-prompt-level behaviour)
commands/<name>.md          ready-made commands (served in Connect as a prompt `command-<name>`)
agents/<name>.md            sub-agents (served as a prompt `agent-<name>`)
mcp.json                    the gateway address, written by FindAgent in the Agent Plugins form ($schema + mcpServers); do not hand-author a launcher
```

Rules the platform enforces (each one measured, not guessed):

- **plugin.json**: `"$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"`, `name` matches `^[a-z0-9](?:[a-z0-9.-]{0,62}[a-z0-9])?$` (refused, never rewritten), a real description, a version.
- **SKILL.md frontmatter**: `name` is 1-64 chars of lowercase letters, digits and single hyphens and should equal the folder id; `description` is required, at most 1024 chars, written as *when to use this skill*. A `name` that breaks the rule is refused (`invalid_skill_name`); a missing name or description, an over-long description and a name that differs from the folder id import with a warning, and the Skills extension leaves out all of those skills except the one with the over-long description.
- **At most 40 skills.** More is refused (`too_many_skills`), never silently cut; see 2c for how to split. The stored package is at most 8 MB; over MCP the text door takes 4 MB in total, 2 MB per file and 4000 files.
- **Text only.** A binary file is left out and reported. A non-root skill folder is kept whole.
- **No machine-side parts unless you mean Install.** A `hooks/` file, anything under `scripts/` or `bin/`, an executable extension, a launcher with a `command`, shell-expansion syntax (the bang-backtick and bang-brace forms) in a command body, or `allowed-tools` / `tools` granting `Bash` makes that part run on the buyer's machine. It is **Install-only**, off the Connect path, and needs the buyer's explicit consent. Keep the Connect path clean by default; add machine-side parts only when the agent truly needs them, and say so in the README.
- **Secrets**: never a key, token or password anywhere in the tree, including examples; the file scan reads every file and a hit blocks the submit.
- **Injection**: do not write skill text that tells the model to ignore rules, reveal prompts, or exfiltrate data; those patterns are HIGH findings in a skill body.

## 2a. Accepted manifest formats

The importer reads one tree in one of these formats (first match wins in this order). Which one a tree is decides where its commands, sub-agents and vendor settings are read from; all of them end up as the same stored package.

| Format | Recognised by | Notes |
|---|---|---|
| Agent Plugins | root `plugin.json` whose `$schema` contains `agent-plugins.org/schemas/` | The format to write new packages in. |
| Codex plugin | root `plugin.json` with `extensions["com.openai"]`, or `.codex-plugin/plugin.json` | The vendor block is kept. |
| Claude plugin | `.claude-plugin/plugin.json` | `userConfig` is kept as a vendor block. |
| Cursor plugin | `.cursor-plugin/plugin.json` | Its `rules/` files are kept as vendor parts. |
| Gemini extension | `gemini-extension.json` | The context file (`contextFileName`, default `GEMINI.md`) is kept. |
| FindAgent manifest | `findagent.json` (or `.findagent/manifest.json`, `.findagent/findagent.json`, `.findagent.json`) | For actions or a code agent; see the other creators. |
| Bare skills tree | no manifest at all | Any `SKILL.md` outside dependency and build folders is a skill (its folder name is the id). |

A `plugin.json` that is not a JSON object is refused (`unreadable_manifest`). Run `npx --yes @findagent/cli@latest check <dir>` and read which format it reports.

## 2b. Rule files and standing instructions

Some rule files are read as skills; others are not. Move standing instructions into `skills/instructions/SKILL.md` so they always travel with the agent.

| File | What the importer does |
|---|---|
| root `AGENTS.md`, `.cursorrules`, `.windsurfrules` | Each becomes one skill (counts toward the 40). |
| `.cursor/rules/*.mdc` and `*.md`, `.windsurf/rules/*.md`, `.continue/rules/*.md` | One skill per file (counts toward the 40). |
| `CLAUDE.md`, `.clinerules`, `copilot-instructions.md`, `CONVENTIONS.md`, a root `GEMINI.md` | Not recognised as a part of the package. They are developer-tool files for people working on the repo, not content for the buyer's assistant. Exception: in a Gemini extension the declared context file is kept. |

A file that becomes a skill is not held to the Agent Skills naming rules, but its text still reaches the buyer's model, so write it for that reader and read it once for contradictions with `skills/instructions/SKILL.md`.

## 2c. More than 40 skills: split, never cut

The cap is 40 skills per agent. A tree over the cap is refused (`too_many_skills`), never trimmed, so the importer will not quietly drop skill 41 and up. The reason for the number: in the buyer's client every skill is served as one tool plus one prompt, and a model chooses badly among hundreds of tools. Split instead:

1. Group the skills by top-level folder or theme (for example `seo/`, `ads/`, `analytics/`).
2. Make one package per group, each with at most 40 skills and its own `plugin.json` name, Instructions and README. Aim for 10 to 25 sharp skills per agent, not 40 as a target.
3. When the groups belong together, compose the published agents with `department-creator`: one connection for the whole team.
4. Name the groups in each README so a buyer finds the right agent.

## 2d. Hooks, scripts and other machine-side parts

Files under `hooks/`, `scripts/`, `bin/`, executables, launchers with a `command` and Bash grants are stored and scanned, but today they reach no buyer: the public plugin catalog exports every agent without that content, and Connect never serves them. Do not rely on them for the agent to work. Anything the agent needs must be reachable as instructions, a skill, a command or an action. Say in the README what you left out for that reason.

## 2e. Coming from a Custom GPT or a Gem

A Custom GPT or Gem is instructions plus, optionally, actions from an OpenAPI schema. Open the Editor at `https://findagent.cloud/editor?from=custom-gpt`: paste the instructions (they become `skills/instructions/SKILL.md`) and import the OpenAPI schema for the actions. Knowledge files are not carried; turn the useful parts into skills or `references/` files you wrote yourself.

## 2f. Ownership and licence before you port

FindAgent accepts only the OWNER's own repository: you attest the files are your own at submit, and a third-party repository cannot be brought in. Before porting, read the source repository's LICENSE: permissive licences (MIT, Apache-2.0, BSD) need their notice kept; copyleft licences (GPL, AGPL, CC-BY-SA) bind the derived package, so the owner must decide that on purpose; no licence means all rights reserved and you may not port it. Put the licence you choose in the repository root.

## 3. Quality bar (the buyer's model reads these files)

- Instructions: one clear role, the boundaries ("will not do"), how to say "I could not check this", and no invented facts. State the output shape.
- Each skill: one job, a `description` that says *when* to use it and when not to, concrete steps, a worked example, and what to return. Move long reference material to `references/` and link it.
- Commands: one verb, a one-line `description`, arguments named in the body.
- Honesty: a skill must never claim a capability the package does not have (no "I browsed", no "I ran").
- Write for the model that will read it: short imperative sentences, no marketing copy.

## 4. Gates (paste real output, no claim without evidence)

1. A validation script you write (outside `scripts/` and `bin/`, which are machine-side) that checks: plugin.json shape and name rule; every skill folder has SKILL.md with valid frontmatter and name equals folder; description lengths; skill count at most 40; no binary; no machine-side part unless intended; no secret shapes. Run it; also mutation-check it (break a rule, watch it go red, assert the break landed).
2. Cross-check against the real importer: run `npx --yes @findagent/cli@latest check <repo-dir>` (it runs the platform's package normaliser offline: parts, left-out binaries, machine-side parts, warnings), and optionally upload the folder or zip on https://findagent.cloud/submit (Upload door) to read the same "We found" card. Zero unexplained warnings. Nothing is submitted until you press submit.
3. Read every skill once as the buyer's model would: no contradictions between Instructions and skills, no dead links.
4. `grep -rniE "TODO|FIXME|lorem|placeholder|your_api_key"` over the tree: nothing meaningful.

## 5. Handoff

- Never submit or publish. Report: repo, sha, file tree, the validator output, the normalizer output, every deferral or doubt.
- Tell the user how to submit: web `https://findagent.cloud/submit` (Upload a zip/folder, or the GitHub door), or the MCP tools `findagent_create_package_draft` (files as text) then `findagent_submit_for_review`; a new version of a live agent goes through `findagent_new_version` (it routes on the agent's kind) or, for an uploaded package, `findagent_reupload`; an agent imported from GitHub is re-pulled and `findagent_reupload` refuses it (`github_source`). The creator attests the files are their own; the package is scanned and a human reviews it. A platform admin's own submission auto-approves on a clean scan; everyone else waits for human review.
- Commit under your own identity.

## Manifest gate (run before you report)

Check the whole repository first with the platform's own offline check: `npx --yes @findagent/cli@latest check <repo-dir>` (manifest schema, the six entry tools, example prompts, egress hosts, lockfile, package parts, actions and secret shapes; no account or login, read-only; the first run downloads the CLI package, so it needs network once). Then validate a lone manifest or a package's `plugin.json` with `npx --yes @findagent/cli@latest lint <path>`. Paste both outputs verbatim; every FAIL must be fixed at the source and every WARN explained. Then run the live checks this file lists. Background skills: `agent-plugins-format`, `code-agent-contract`, `submit-new-agent`.
