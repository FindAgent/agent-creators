---
name: actions-agent-creator
description: Builds the ACTIONS part of a FindAgent agent — declarative API tools that call a service with the buyer's own credentials, bound to exact allowed hosts, with annotations, approval levels and guardrails — as an Agent Plugins package extension (extensions["cloud.findagent"].actions) or a findagent.json doer, no code. Use when asked to wrap an HTTP API as an agent. Not for logic that needs code (code-agent-creator) or prompt-only agents (package-agent-creator). Does NOT submit or publish; you decide when to submit.
---

# Actions agent creator

You build the **Actions** part of one FindAgent agent: tools whose whole behaviour is a declared HTTP call (or a prompt template) that FindAgent's trusted runtime executes with the buyer's own credential. **No code ships; the keystone is that declarative agents never run creator code.** Read section 1 first; never rely on memory.

## 0. Is this the right kind?

An agent whose tools are "call this API with these parameters" is a doer: build it here. If it needs loops, parsing, computation or several dependent calls it cannot express, it is a code agent (`code-agent-creator`). If it only has instructions, it is a package (`package-agent-creator`). A wrapper around one HTTP API is never a code agent.

## 1. Read first (public docs)

The public docs: https://findagent.cloud/docs/manifest (tool actions, credential slots, guardrails, annotations), https://findagent.cloud/docs/security, https://findagent.cloud/docs/creator-guide. Work in a scratch directory. The reference scaffold is the `actions` variant of https://github.com/FindAgent/agent-template: `python scripts/init_agent.py actions <new-repo-dir> --name "<Agent Name>"` (The scaffold script is a Python 3 script, so Python 3 must be installed even when the agent itself is not Python).

## 2. Two equivalent homes (pick one, same content)

- **Agent Plugins package** (preferred, matches the platform's one package model): `plugin.json` with `extensions["cloud.findagent"].actions = { "tools": [...], "credential_slots": [...] }`. Every tool carries an `action`. `tools` 1-40, names unique. A package that holds only these actions, with no skill, command or sub-agent, is refused today (`nothing_to_package`); add at least one of those, or use the `findagent.json` home below.
- **findagent.json v1.1** `kind: "mcp-tool"` with `tools[]` + `credential_slots[]`. Same tool and slot schemas. The doer manifest also requires `name` (3-80 characters), a `system_prompt` of at least 50 characters and `example_prompts` (1-5). Declare the actions in ONE place: the declared manifest is the first of `findagent.json`, `.findagent/manifest.json`, `.findagent/findagent.json`, `.findagent.json` that exists, and a package that declares actions both there and in `plugin.json` is refused (`declared_manifest_shadowed`).

## 2a. Starting from an OpenAPI spec

The web import accepts an OpenAPI 3.x spec (JSON or YAML) with source `openapi`, and an MCP client has the same mapper as the read-only tool `findagent_import_openapi` (it saves nothing; pass its `tools`, `credential_slots` and `guardrails` to `findagent_create_draft`) and maps each operation (GET, POST, PUT, PATCH, DELETE) to a tool. It needs an `https://` server URL. It stops at 40 operations and says so in a warning ("only the first 40 were imported"), and the first 40 in document order are rarely the right 40. So select the operations before you import: keep the ones a model needs (read and search first), drop the admin and bulk ones, and write the trimmed spec yourself, or build the tool list by hand in the shape of section 3. Then read each imported tool: a generated description is a starting point, and the annotations (read-only, destructive) still need your judgement.

Dated note (checked 2026-10-29 on OpenAI's own FAQ, https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq): OpenAI schedules custom GPTs to retire on Dec 11, 2026 (Feb 11, 2027 for FedRAMP workspaces and approved deferrals) and moves them to ChatGPT plugins. Custom actions do not transfer there, and OpenAI suggests rebuilding them, possibly as an MCP server. None of that changes what FindAgent does: an OpenAPI spec still becomes tools through the OpenAPI import, so treat a Custom GPT's Actions as the OpenAPI source for an actions agent.

## 3. A tool

- `name`: MCP-safe `[A-Za-z0-9_-]`, at most 64; verb_noun; unique. `description`: 10-500 chars, says *when* to call it and what it returns.
- `input_schema`: a real typed JSON Schema (types, required, enums, descriptions). An open schema is a footgun: the client gets no signal an argument is an array or object.
- `action.type: "http"`: `method` GET/POST/PUT/PATCH/DELETE; `url` must be `https://` (a `{param}` token is allowed for path/query values and `{install_host}` for a buyer-owned host); optional `headers` and `body_template`; `auth_ref` names a credential slot. **Plain http, ftp and gibberish URLs fail at parse.**
- `action.type: "prompt-template"`: a `template` the runtime fills; use it for pure instruction tools.
- `annotations`: set the truth (readOnly, destructive, idempotent, openWorld). A source `readOnlyHint: true` on a mutating action is OVERRIDDEN. A **destructive** tool automatically gets an `approval: "human"` floor. `human` asks "Approve this action?" where the client can be asked (a declined answer is a refusal); where it cannot be asked (the stateless hosted gateway), the tool answers with a re-run-with-`__confirm` notice instead of running, which is friction and visibility, not proof of a human. Use `human_strict` for irreversible or high-value actions: it asks where it can and is REFUSED where it cannot. `external` is for an organisation approver and is refused outside an organisation agent.
- `requires[]` can force tool order (a gated tool refuses unless the named tools ran first, same user, 30 minutes).

## 4. Credential slots (declarations, never values)

`ref`, `label`, optional `description`, `env`, `type` (`string|secret|json`), `required`. **A slot declares a key; the buyer's value lives in the vault and is never in the package.** The audience binding is the security core:

- `allowed_hosts`: the EXACT hosts the secret may reach (`api.vendor.com`). Nothing else, no wildcards you do not need. Empty with no `install_host` = a dead credential and a publish refusal.
- `install_host: true` instead (leave `allowed_hosts` empty, both is refused) when the address belongs to the buyer (self-hosted GitLab/Jira/Metabase). Then the action url uses `{install_host}`.
- `auth_scheme`: `bearer` (default), `basic` (the buyer supplies base64 `email:token`, Atlassian), `raw` (verbatim header value), `header` (a custom header; needs `header_name`, optional `prefix`; not Authorization/Cookie/Host).
- `auth_acquisition: "oauth"` + `provider` when the buyer should connect an OAuth provider once instead of pasting a key (the token's audience is the provider's own hosts; leave `allowed_hosts` empty).
- A tool that needs no secret references no slot. Do not add an optional slot "for later".
- Never put a literal key in a header template, example or description: the file scan reads `plugin.json` / `findagent.json` verbatim and blocks it.

## 5. Guardrails

`guardrails` (input / action / output rails) are enforced by the platform on every serve path and a creator may only TIGHTEN them; the mandatory rails (secret-leak scan on results, injection checks) cannot be disabled. Useful: output PII redaction, an input max length, a `max_amount` convention guard (top-level keys `amount|amount_cents|total|value`, tool's own unit; not a semantic check), `requires[]` ordering. Read `guardrailsSchema` for the exact keys; do not invent any.

## 6. Gates (paste real output)

1. Run `npx --yes @findagent/cli@latest check <repo-dir>` (the platform's whole-repo check, offline: it runs the same action, host and credential rules the publish step applies to a package's `plugin.json` or a doer's `findagent.json`, and, in a release that carries those rules, fails an actions-only package with `nothing_to_package`), and lint a lone manifest or `plugin.json` with `npx --yes @findagent/cli@latest lint <path>`. Paste the result.
2. Contract test per tool: required args missing, wrong type, the URL host is inside `allowed_hosts` of the slot it names (a test that fails when an action host is not covered), no `http://`, annotations consistent with the method (a POST/PUT/PATCH/DELETE is not readOnly).
3. Live check (not a mock of your own code): call each GET tool once against the real API with a real key the CALLER provides through an env var you never print, from a scratch script; report the real status codes, including a 401/404 path. If no key is available say "not checked: no credential" per tool; never score it as passed.
4. Mutation-check the contract tests (break a host, a scheme, an annotation; assert the break landed and the test went red).
5. `grep` for `TODO|FIXME|example\.com|YOUR_` over the tree.

## 7. Handoff

Never submit or publish. Report the files, schema output, live results, deferrals. How to submit: web `/submit` (Editor door writes this exact shape; Upload/GitHub for a repo) or MCP `findagent_create_draft` (a `findagent.json` doer) or `findagent_create_package_draft` (a package whose `plugin.json` declares the actions), then `findagent_submit_for_review`; scan + human review; a platform admin's own submission auto-approves on a clean scan, anyone else waits for human review.

## Manifest gate (run before you report)

Check the whole repository first with the platform's own offline check: `npx --yes @findagent/cli@latest check <repo-dir>` (manifest schema, the six entry tools, example prompts, egress hosts, lockfile, package parts, actions and secret shapes; no account or login, read-only; the first run downloads the CLI package, so it needs network once). Then validate a lone manifest or a package's `plugin.json` with `npx --yes @findagent/cli@latest lint <path>`. Paste both outputs verbatim; every FAIL must be fixed at the source and every WARN explained. Then run the live checks this file lists. Background skills: `agent-plugins-format`, `code-agent-contract`, `submit-new-agent`.
