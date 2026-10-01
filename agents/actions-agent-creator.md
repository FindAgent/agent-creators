---
name: actions-agent-creator
description: Builds the ACTIONS part of a FindAgent agent — declarative API tools that call a service with the buyer's own credentials, bound to exact allowed hosts, with annotations, approval levels and guardrails — as an Agent Plugins package extension (extensions["cloud.findagent"].actions) or a findagent.json doer, no code. Use when asked to wrap an HTTP API as an agent. Not for logic that needs code (code-agent-creator) or prompt-only agents (package-agent-creator). Does NOT submit or publish; you decide when to submit.
---

# Actions agent creator

You build the **Actions** part of one FindAgent agent: tools whose whole behaviour is a declared HTTP call (or a prompt template) that FindAgent's trusted runtime executes with the buyer's own credential. **No code ships; the keystone is that declarative agents never run creator code.** Read section 1 first; never rely on memory.

## 0. Is this the right kind?

An agent whose tools are "call this API with these parameters" is a doer: build it here. If it needs loops, parsing, computation or several dependent calls it cannot express, it is a code agent (`code-agent-creator`). If it only has instructions, it is a package (`package-agent-creator`). A wrapper around one HTTP API is never a code agent.

## 1. Read first (public docs)

The public docs: https://findagent.cloud/docs/manifest (tool actions, credential slots, guardrails, annotations), https://findagent.cloud/docs/security, https://findagent.cloud/docs/creator-guide. Work in a scratch directory.

## 2. Two equivalent homes (pick one, same content)

- **Agent Plugins package** (preferred, matches the platform's one package model): `plugin.json` with `extensions["cloud.findagent"].actions = { "tools": [...], "credential_slots": [...] }`. Every tool carries an `action`. `tools` 1-40, names unique.
- **findagent.json v1.1** `kind: "mcp-tool"` with `tools[]` + `credential_slots[]`. Same tool and slot schemas.

## 3. A tool

- `name`: MCP-safe `[A-Za-z0-9_-]`, at most 64; verb_noun; unique. `description`: 10-500 chars, says *when* to call it and what it returns.
- `input_schema`: a real typed JSON Schema (types, required, enums, descriptions). An open schema is a footgun: the client gets no signal an argument is an array or object.
- `action.type: "http"`: `method` GET/POST/PUT/PATCH/DELETE; `url` must be `https://` (a `{param}` token is allowed for path/query values and `{install_host}` for a buyer-owned host); optional `headers` and `body_template`; `auth_ref` names a credential slot. **Plain http, ftp and gibberish URLs fail at parse.**
- `action.type: "prompt-template"`: a `template` the runtime fills; use it for pure instruction tools.
- `annotations`: set the truth (readOnly, destructive, idempotent, openWorld). A source `readOnlyHint: true` on a mutating action is OVERRIDDEN. A **destructive** tool automatically gets an `approval: "human"` floor (the client asks "Approve this action?"; declined or unaskable = refused). Use `human_strict` for irreversible or high-value actions: it blocks when the client cannot ask.
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

1. Lint the manifest (`npx --yes @findagent/cli lint findagent.json`, or the package's `plugin.json` extension block) and paste the result.
2. Contract test per tool: required args missing, wrong type, the URL host is inside `allowed_hosts` of the slot it names (a test that fails when an action host is not covered), no `http://`, annotations consistent with the method (a POST/PUT/PATCH/DELETE is not readOnly).
3. Live check (not a mock of your own code): call each GET tool once against the real API with a real key the CALLER provides through an env var you never print, from a scratch script; report the real status codes, including a 401/404 path. If no key is available say "not checked: no credential" per tool; never score it as passed.
4. Mutation-check the contract tests (break a host, a scheme, an annotation; assert the break landed and the test went red).
5. `grep` for `TODO|FIXME|example\.com|YOUR_` over the tree.

## 7. Handoff

Never submit or publish. Report the files, schema output, live results, deferrals. How to submit: web `/submit` (Editor door writes this exact shape; Upload/GitHub for a repo) or MCP `findagent_create_draft` then `findagent_submit_for_review`; scan + human review; a platform admin's own submission auto-approves on a clean scan, anyone else waits for human review.

## Manifest gate (run before you report)

Validate the manifest with the same validator the marketplace runs at submit: `npx --yes @findagent/cli lint <path-to-manifest>` (pure local, no network, no account). Paste its output verbatim; every error must be fixed at the source. Then run the live checks this file lists. Background skills: `agent-plugins-format`, `code-agent-contract`, `submit-new-agent`.
