# Playbook: code-agent-creator

> Builds the CODE part of a FindAgent agent end to end — a Node or Python code-bundle MCP server with the platform's entry-tool contract, a valid findagent.json, MCP UI panels, honest error handling and live verification — in its own Kata-Agents repo. Use when asked to create, port or deepen an agent that ships code. For instructions and skills use package-agent-creator, for API actions actions-agent-creator, for a team department-creator, for an existing server mcp-listing-creator. Does NOT submit or publish; you decide when to submit.

Follow this playbook as the working instructions for the task. It is plain Markdown and works in any assistant that can read files, run shell commands and browse public pages.

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

The public docs: https://findagent.cloud/docs/code-agents (build + sandbox), https://findagent.cloud/docs/manifest (the manifest), https://findagent.cloud/docs/creator-guide, https://findagent.cloud/docs/security, and the reference template https://github.com/FindAgent/agent-template (the six entry tools, `findagent.json`, the display-only panel, in Node and in Python). Start from that template: copy it, rename it, change the tools. Work in a scratch directory.

## 2. The platform contract (every code-bundle)

1. **Entry tools.** All six must exist and work, returning structured JSON: `plan_inputs`, `open_form`, `run_form`, `run_full`, `list_capabilities`, `discover_intent`. The platform draws the form panel for `open_form` / `plan_inputs` / `run_form` itself, so never build your own form panel for those three. Copy the `needs_input` response shapes from the FindAgent agent-template (https://github.com/FindAgent/agent-template). A missing required argument answers `needs_input` (with the slot named), it does not throw.
2. **A real `findagent.json` at the repo root.** `schema_version: "1.2"`, `kind: "code-bundle"`, `name`, `entrypoint`, `runtime`, plus description and the tool list. A DXT `manifest.json` alone is silently overridden by a synthesised contract and its credential hosts are dropped — the version then sits in review forever. Keep `manifest.json` consistent if you ship one. Validate the file with `npx --yes @findagent/cli lint findagent.json` and report the result.
3. **Egress is default-deny.** `code.allowed_hosts` lists every host the code calls, and nothing else. A host the *you* chooses cannot be declared, so do not fetch you-supplied URLs from the sandbox: take the content as input instead (the assistant fetched it), or use an `install_host` slot only when the address belongs to the buyer.
4. **Credentials are declarations, never values.** `credential_slots[]` with `ref`, `label`, `allowed_hosts` (or `install_host`), `required`. Never put a key in the repo, a fixture, a log or an error. A required slot that is not attached makes the gateway offer only `setup_credentials`; design for that. If the agent needs no secret, declare no slot — do not add an optional one "for later".
5. **Autobuild safety.** No tracked `pnpm-workspace.yaml`; no literal PEM header anywhere (fragment it, the submission secret scan fails on it); lockfile committed and versions pinned; no native deps for Python (the build is `pip install -r requirements.txt --target <deps>`, then `python3 <entry>`); the entrypoint resolves from the repo root.
6. **MCP UI panels** (when the agent has a result worth seeing). One self-contained HTML document, declared as a `ui://` resource and bound with `_meta.ui`. Hard rules: no `ui.domain`; the CSP stays closed; no network from the panel (data arrives in the tool result); bind with visibility `['model']` and `openai/widgetAccessible: false` (a panel calls no tools; answers go back through `ui/message`); light and dark through CSS custom properties with `prefers-color-scheme`; usable at 390px; keyboard accessible; a plain JSON / text fallback in the tool result for hosts without UI. For Python, ship the panel as a **prebuilt** HTML file in the repo (the sandbox only pip-installs, there is no node step).

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
- **Never submit or publish.** Do not call FindAgent submit tools. Report the repo URL and sha; you submits through the platform (web `/submit` or the MCP create / submit tools). An admin's self-submission auto-approves on a clean scan, which is a live listing, so that step is you's.
- Report concisely: repo, sha, file summary, the real output of every gate, the live runs, `findagent.json`, the panel screenshots, and every deferral or doubt — a skipped or failing step is stated plainly.

## Manifest gate (run before you report)

Validate the manifest with the same validator the marketplace runs at submit: `npx --yes @findagent/cli lint <path-to-manifest>` (pure local, no network, no account). Paste its output verbatim; every error must be fixed at the source. Then run the live checks this file lists. Background skills: `agent-plugins-format`, `code-agent-contract`, `submit-new-agent`.
