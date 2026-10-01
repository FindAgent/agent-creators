# Playbook: package-agent-creator

> Builds the INSTRUCTIONS and SKILLS part of a FindAgent agent as a valid Agent Plugins 1.0 package (plugin.json, skills/<id>/SKILL.md, commands/, agents/) with no code, scan-clean and ready for the /submit Upload / GitHub / Editor doors or the MCP package tools. Use when asked to create or port a skills / instructions / prompt-only agent or a Claude, Codex, Cursor or Gemini plugin. Not for agents that call APIs (actions-agent-creator) or ship code (code-agent-creator). Does NOT submit or publish; you decide when to submit.

Follow this playbook as the working instructions for the task. It is plain Markdown and works in any assistant that can read files and run shell commands. See "Requirements" in `AGENTS.md` for what it expects the assistant to have.

# Package agent creator

You build the **Instructions + Skills** part of one FindAgent agent, as an **Agent Plugins 1.0** package (agent-plugins.org). Every FindAgent agent is stored as that one package shape; yours has no executable code. Read the files named in section 1 before designing — never rely on memory of them. Work in a scratch directory; the package lives in its own repo (your GitHub account or organization, MIT, `main`) unless you say otherwise.

## 0. Is this the right kind?

| The agent needs... | Use |
|---|---|
| Behaviour, knowledge, procedures, prompts only | **this** (a package of skills) |
| To call an HTTP API with the buyer's own key | `actions-agent-creator` (Actions part; can live in the same package) |
| Real logic that must run code | `code-agent-creator` |
| To point at a server somebody else runs | `mcp-listing-creator` |

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
mcp.json                    the gateway address FindAgent writes; do not hand-author a launcher
```

Rules the platform enforces (each one measured, not guessed):

- **plugin.json**: `"$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json"`, `name` matches `^[a-z0-9](?:[a-z0-9.-]{0,62}[a-z0-9])?$` (refused, never rewritten), a real description, a version.
- **SKILL.md frontmatter**: `name` is 1-64 chars of lowercase letters, digits and single hyphens and MUST equal the folder id; `description` is required, at most 1024 chars, written as *when to use this skill*. A bad `name` is refused; the rest are warnings.
- **At most 40 skills.** More is refused, never silently cut.
- **Text only.** A binary file is left out and reported. A non-root skill folder is kept whole.
- **No machine-side parts unless you mean Install.** A `hooks/` file, anything under `scripts/` or `bin/`, an executable extension, a launcher with a `command`, shell-expansion syntax (the bang-backtick and bang-brace forms) in a command body, or `allowed-tools` / `tools` granting `Bash` makes that part run on the buyer's machine. It is **Install-only**, off the Connect path, and needs the buyer's explicit consent. Keep the Connect path clean by default; add machine-side parts only when the agent truly needs them, and say so in the README.
- **Secrets**: never a key, token or password anywhere in the tree, including examples; the file scan reads every file and a hit blocks the submit.
- **Injection**: do not write skill text that tells the model to ignore rules, reveal prompts, or exfiltrate data; those patterns are HIGH findings in a skill body.

## 3. Quality bar (the buyer's model reads these files)

- Instructions: one clear role, the boundaries ("will not do"), how to say "I could not check this", and no invented facts. State the output shape.
- Each skill: one job, a `description` that says *when* to use it and when not to, concrete steps, a worked example, and what to return. Move long reference material to `references/` and link it.
- Commands: one verb, a one-line `description`, arguments named in the body.
- Honesty: a skill must never claim a capability the package does not have (no "I browsed", no "I ran").
- Write for the model that will read it: short imperative sentences, no marketing copy.

## 4. Gates (paste real output, no claim without evidence)

1. A validation script you write (outside `scripts/` and `bin/`, which are machine-side) that checks: plugin.json shape and name rule; every skill folder has SKILL.md with valid frontmatter and name equals folder; description lengths; skill count at most 40; no binary; no machine-side part unless intended; no secret shapes. Run it; also mutation-check it (break a rule, watch it go red, assert the break landed).
2. Cross-check against the real importer: upload the folder or zip on https://findagent.cloud/submit (Upload door) and read the "We found" card: parts, left-out binaries, machine-side parts, warnings. Zero unexplained warnings. Nothing is submitted until you press submit.
3. Read every skill once as the buyer's model would: no contradictions between Instructions and skills, no dead links.
4. `grep -rniE "TODO|FIXME|lorem|placeholder|your_api_key"` over the tree: nothing meaningful.

## 5. Handoff

- Never submit or publish. Report: repo, sha, file tree, the validator output, the normalizer output, every deferral or doubt.
- Tell the user how to submit: web `https://findagent.cloud/submit` (Upload a zip/folder, or the GitHub door), or the MCP tools `findagent_create_package_draft` (files as text) then `findagent_submit_for_review`; a new version of a live agent goes through `findagent_reupload`. The creator attests the files are their own; the package is scanned and a human reviews it. A platform admin's own submission auto-approves on a clean scan; everyone else waits for human review.
- Commit under your own identity.

## Manifest gate (run before you report)

Validate the manifest with the same validator the marketplace runs at submit: `npx --yes @findagent/cli@0.4.0 lint <path-to-manifest>` (no account or login; the first run downloads the CLI package, so it needs network once, or run it from a local clone of the CLI). Paste its output verbatim; every error must be fixed at the source. Then run the live checks this file lists. Background skills: `skills/agent-plugins-format/SKILL.md`, `skills/code-agent-contract/SKILL.md`, `skills/submit-new-agent/SKILL.md`.
