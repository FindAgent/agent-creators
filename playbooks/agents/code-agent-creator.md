# Playbook: code-agent-creator

> Builds the CODE part of a FindAgent agent end to end — a Node or Python code-bundle MCP server with the platform's entry-tool contract, a valid findagent.json, MCP UI panels, honest error handling and live verification — in its own repository. Use when asked to create, port or deepen an agent that ships code. For instructions and skills use package-agent-creator, for API actions actions-agent-creator, for a team department-creator, for an existing server mcp-listing-creator. Does NOT submit or publish; you decide when to submit.

Follow this playbook as the working instructions for the task. It is plain Markdown and works in any assistant that can read files and run shell commands. See "Requirements" in `AGENTS.md` for what it expects the assistant to have.

# Code agent creator

You build one agent for the **FindAgent** marketplace, in its own GitHub repo, and prove it works against the real world. You already know the MCP basics, so this file only carries what is specific to FindAgent. Read the files named here before designing — never rely on memory of them.

## 0. Before anything: pick the kind

| Kind | Use when | Never |
|---|---|---|
| `mcp-tool` (declarative doer) | The agent only calls HTTP APIs with the buyer's credentials. Actions are `http` / `prompt-template`. | It ships no executable code. Never write code for it. |
| `skills-bundle` (Agent Plugins package) | Instructions and skills only. | Same: no code. |
| `code-bundle` | Real logic that needs code. Hosted in the sandbox, or local on the buyer's machine. | A code-bundle is the only kind that runs creator code, and only in the sandbox. |

Choose the lightest kind that is honest. A wrapper around one HTTP API is a doer, not a code-bundle. Runtimes for a code-bundle: `node22`, `node24`, `python3.13`. **Python is a first-class choice**, not a fallback: pick it when the work is data, parsing or ML-adjacent. Its contract is the same six entry tools and the same `findagent.json`, with `runtime: {kind: "python", version: "3.13"}`. Python-only rules: the sandbox build is `pip install -r requirements.txt --target <deps>` then `python3 <entry>`, so no compiled/native dependencies and every version pinned; the panel HTML must be prebuilt and committed (no node step); never `print()` to stdout (it corrupts the MCP stdio stream; log to stderr); verify in a clean venv with `pytest`, `ruff` and a real stdio MCP client run. See the Python half of https://github.com/FindAgent/agent-template.

## 1. Read first (public docs)

The public docs: https://findagent.cloud/docs/code-agents (build + sandbox), https://findagent.cloud/docs/manifest (the manifest), https://findagent.cloud/docs/creator-guide, https://findagent.cloud/docs/security, and the reference template https://github.com/FindAgent/agent-template (the six entry tools, `findagent.json`, the display-only panel, in Node and in Python). Start from that template with its scaffold script, never by hand: `python scripts/init_agent.py <node|python> <new-repo-dir> --name "<Agent Name>"` (run inside a clone of the template). It copies the variant and adds EVERYTHING a complete agent repo carries: `findagent.json`, a DXT `manifest.json`, the assistant entry files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CONVENTIONS.md`, `.aider.conf.yml`, Copilot and Cursor rules), the MCP client configs (`mcp.json`, `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, generated from `findagent.json`), `SECURITY.md`, `CHANGELOG.md`, `LICENSE`, `.gitignore`, `.gitattributes` and the CI workflow. For a repo that already exists, `python scripts/init_agent.py --fill <repo>` adds only what is missing. Then change the tools. Work in a scratch directory.

## 2. The platform contract (every code-bundle)

1. **Entry tools.** All six must exist and work, returning structured JSON: `plan_inputs`, `open_form`, `run_form`, `run_full`, `list_capabilities`, `discover_intent`. The platform draws the form panel for `open_form` / `plan_inputs` / `run_form` itself, so never build your own form panel for those three. Copy the `needs_input` response shapes from the FindAgent agent-template (https://github.com/FindAgent/agent-template). A missing required argument answers `needs_input` (with the slot named), it does not throw.
2. **A real `findagent.json` at the repo root.** `schema_version: "1.2"`, `kind: "code-bundle"`, `name`, `entrypoint`, `runtime` (`{kind, version}` with version `22` or `24` for Node, `3.13` for Python), `mcp`, plus description, `example_prompts` (1-5), and `skills[]`: every tool with `id`, `name`, a description of at most 500 characters (the served tool list cuts there, mid-sentence) and its typed `input_schema`; at most 40 tools. A DXT `manifest.json` alone is replaced by a contract the platform infers, and the credential hosts you declared are dropped; preflight now warns (`findagent_json_missing`) but a version that needs those hosts will not work. If you also ship a `manifest.json`, generate it from `findagent.json` and the real tool list; a re-pull keeps the `skills[]` ids and typed `input_schema` that `findagent.json` declares, but read the stored tool list once after a re-pull. Validate the file with `npx --yes @findagent/cli@0.4.1 lint findagent.json` and report the result.
3. **Egress is default-deny.** The top-level `allowed_hosts` of `findagent.json` lists every host the code calls, and nothing else (the `code.allowed_hosts` form belongs to the older v1.1 manifest). A host the caller chooses cannot be declared, so do not fetch caller-supplied URLs from the sandbox: take the content as input instead (the assistant fetched it), or use an `install_host` slot only when the address belongs to the buyer.
4. **Credentials are declarations, never values.** `credential_slots[]` with `ref`, `label`, `allowed_hosts` (or `install_host`), `required`. Never put a key in the repo, a fixture, a log or an error. A required slot that is not attached makes the gateway offer only `setup_credentials`, and a run with a required slot the buyer never saved is refused before the sandbox starts, for EVERY tool of the bundle; mark a slot `required: false` when some tools work without it. If the agent needs no secret, declare no slot — do not add an optional one "for later".
5. **Autobuild safety.** No tracked `pnpm-workspace.yaml`; no literal PEM header anywhere (fragment it, the submission secret scan fails on it); the Node sandbox installs with npm (`npm ci` only when `package-lock.json` or `npm-shrinkwrap.json` is committed, otherwise a fresh `npm install`; it does not read `pnpm-lock.yaml`, `yarn.lock` or `bun.lock`), so pin EXACT versions in `package.json` and use `npm run <script>` as `build_command`; no native deps for Python (the build is `pip install -r requirements.txt --target <deps>`, then `python3 <entry>`); the entrypoint resolves from the repo root.
6. **MCP UI panels** (when the agent has a result worth seeing). One self-contained HTML document, declared as a `ui://` resource and bound with `_meta.ui`. Hard rules: no `ui.domain`; the CSP stays closed; no network from the panel (data arrives in the tool result); bind with visibility `['model']` and `openai/widgetAccessible: false` (a panel calls no tools; answers go back through `ui/message`); light and dark through CSS custom properties with `prefers-color-scheme`; usable at 390px; keyboard accessible; a plain JSON / text fallback in the tool result for hosts without UI. For Python, ship the panel as a **prebuilt** HTML file in the repo (the sandbox only pip-installs, there is no node step).
7. **Agent memory (optional).** A hosted run delivers the buyer's previous state for this agent as a file: read `FINDAGENT_MEMORY_FILE` FIRST (a path relative to the working directory; the file holds the JSON text). `FINDAGENT_MEMORY` (the same JSON as an environment variable) is only a fallback and is ABSENT when the memory is large, because the sandbox environment has a hard limit of 4096 bytes in total: credentials and platform variables above about 4000 bytes are refused before the sandbox starts, with the creator-facing reason `code_bundle_env_too_large`. Store new state by returning an object under `__memory` in the structured result; it must stay under 64 KB or the write is rejected and the old memory is kept. One user, one agent; hosted runs only; never a secret (the platform scans it). The platform strips `__memory` from what the model and the buyer see. Use it for small caches, not for data you cannot lose, and keep every cache bounded (newest N entries, a size cap).
8. **Updating a live agent.** A new version is a re-pull of the repository (`findagent_new_version`, `findagent_repull` or the dashboard), patch bump by default (`bump: minor|major` to choose), scanned, rebuilt and reviewed while the live version keeps serving. A buyer who already connected is held on the old version until they acknowledge an update that adds a credential slot, a host on a slot, a destructive tool or a changed `auth_scheme`.

## 3. Honesty rules (the product's claims are audited)

- **No fake anywhere in shipped code.** No mock mode, no demo path, no sample data, no `example*` files, no `TODO`. A test double belongs under `test/` / `tests/` and nowhere else. A repo that needs a "mock mode" to run is not finished.
- **A failure is not a finding.** Keep the conditions apart: not found, rate limited (with the reset time), network failure, malformed body, nothing to report. Never collapse them into one message, and never answer "not found" for a refusal.
- **A signal you could not measure is "not checked: <reason>"** — never scored as zero, never silently omitted. Never invent a number. Say how many upstream calls were used.
- Deterministic first. An optional LLM step may rewrite a summary, but the deterministic result must be complete without it and say so.
- One responsibility per tool, verb_noun names, descriptions that say *when* to use the tool, typed inputs validated at the boundary (Zod / Pydantic), `isError: true` with an actionable message instead of a stack trace.

## 4. Quality gates (paste real output for each — no claim without evidence)

1. Clean install, typecheck, lint, build and tests green (`pnpm` for Node; a clean venv + `pytest` + `ruff` for Python).
2. Tests for every scorer / checker and every distinct error class, plus a contract test that all six entry tools exist.
3. **Live verification, no mocks of your own code**: run the built server over stdio with a real MCP client (the SDK client or the MCP inspector CLI) against the real upstream — at least three real inputs including a not-found and a limit / failure path.
4. `grep -rniE "mock|fake|stub|placeholder|lorem|todo|fixme|demo"` over the shipped files returns nothing meaningful; explain any legitimate hit.
5. For panels: parse the emitted script, then render in headless Chromium at 390px and desktop in both color schemes with a fake host posting the tool result; assert no console errors and no horizontal overflow; keep the screenshots.
6. No secrets in the tree or the history.
7. Mutation-check the guards you wrote: break the code, watch the test go red, assert the break landed.

## 5. Repo and handoff

- Create the repo in your own GitHub account or organization (private while you build, MIT, default branch `main`) and commit under your own identity.
- **Never submit or publish.** Do not call FindAgent submit tools. Report the repo URL and sha; the user submits through the platform (web `/submit` or the MCP create / submit tools). An admin's self-submission auto-approves on a clean scan, which is a live listing, so that step is the user's.
- Report concisely: repo, sha, file summary, the real output of every gate, the live runs, `findagent.json`, the panel screenshots, and every deferral or doubt — a skipped or failing step is stated plainly.

## Completeness gate (run before you report)

`python scripts/check_repo_files.py <repo>` (from the template clone) must print `OK`: every file in `scripts/repo-files.json` is present, every JSON file parses, nothing required is hidden by `.gitignore`, and the `findagent.json` entrypoint exists. After editing `mcp` in `findagent.json`, regenerate the MCP configs (`python scripts/sync_mcp_configs.py` in the template; in your repo copy the same script or edit the four files together).

## Manifest gate (run before you report)

Check the whole repository first with the platform's own offline check: `npx --yes @findagent/cli@0.4.1 check <repo-dir>` (manifest schema, the six entry tools, example prompts, egress hosts, lockfile, package parts, actions and secret shapes; no account or login, read-only; the first run downloads the CLI package, so it needs network once). Then validate a lone manifest or a package's `plugin.json` with `npx --yes @findagent/cli@0.4.1 lint <path>`. Paste both outputs verbatim; every FAIL must be fixed at the source and every WARN explained. Then run the live checks this file lists. Background skills: `skills/agent-plugins-format/SKILL.md`, `skills/code-agent-contract/SKILL.md`, `skills/submit-new-agent/SKILL.md`.
