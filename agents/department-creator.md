---
name: department-creator
description: Designs a FindAgent Department — a team of 2-16 published agents with a hub, pipeline or peer-to-peer topology (or a workflow / orchestrator), per-member roles, report instructions and flow hints — as a valid findagent/department/v1 manifest, checked against the real schema and member eligibility. Use when asked to compose agents into a team or to port an existing multi-agent setup. A department is built from agents that already exist and are published; for those use the other creators first. Does NOT create or publish anything; you decide when to submit.
---

# Department creator

You design one **Department**: several existing FindAgent agents working as a team on one goal through ONE connection. A department is not a plugin and ships no code of its own; it is a composition manifest (`findagent/department/v1`) over members that are themselves agents. Read section 1 first; never rely on memory.

## 0. Is a department the right shape?

Use one when the goal needs several distinct roles whose outputs feed each other (research -> angle -> copy -> plan -> test). Do NOT use one for a single capability (that is one agent) or for parallel copies of the same role. Prefer fewer members: a team of 3-8 with sharp roles beats 16 overlapping ones.

## 1. Read first (public docs)

The public docs: https://findagent.cloud/docs/departments and https://findagent.cloud/docs/manifest. Read each member agent's own page on https://findagent.cloud before assigning roles.

## 2. Who may be a member

| Member | In a department | Note |
|---|---|---|
| Agent with Actions (declarative doer) | yes | uses the buyer's key, only to its allowed hosts |
| Agent with Code (code-bundle) | yes, hosted only | runs in FindAgent's sandbox; a local-only agent cannot join |
| Agent with only Instructions | yes | |
| Agent with Skills (package) | yes | served only when its files passed review for the served version |
| MCP server listing | **no** | somebody else's server; FindAgent never runs it |

Members must be PUBLISHED agents (referenced by `agent_slug`, optionally pinning `agent_version`). A department's every member stays usable alone.

## 3. The manifest

```
schema_version: "findagent/department/v1"
name (3-80), description (10-2000, optional, discovery only)
members[2..16]: { agent_slug, agent_version?, role (<=60), alias (unique, the addressable name),
                  call_timeout_ms? (5s-600s), generative? , web_fetch? }
topology: { pattern: "pipeline" | "hub-orchestrator" | "p2p", hub?, entry?, edges? }
orchestration?: { mode: "topology" | "workflow" | "orchestrator", ... }   // absent = topology
report_instructions? : department-wide owner instruction prepended to EVERY member's prompt
flows? : { "<flow-name>": [aliases] }   // a surfacing HINT, never forced routing
+ shared discovery fields (category, example_prompts, tags, industry, discipline, version, ...)
```

Decisions, with the platform's reasons:

- **pipeline**: declared order is the plan, each output feeds the next (up to 16). **hub-orchestrator**: a `hub` member (required, must be a member) delegates and synthesises (up to 16). **p2p**: any member may message any (full mesh, O(n^2) cost), **at most 8**; `entry` names the first member, else `members[0]`.
- `edges` are authorable but not always honoured: pipeline ignores them (order is the plan) and workflow mode discards them. Only declare edges where the chosen mode uses them; the builder's `edgesAreHonoured(pattern, coordination)` is the one answer.
- **workflow** mode: a declarative DAG (`steps`, `order`, `depends_on`, `when` conditions, data mapping) run deterministically at $0. **orchestrator** mode: a declared member routes (`style: static|dynamic`; dynamic plans with an LLM, `max_replan_depth` 1-16, optional `history_mode: sliding_window` for long runs). Everything routes to DECLARED members only; no field carries code.
- `generative: true` on ONE member only when its job is to produce an artifact (otherwise every report must be backed by a tool result; an answer with no tool behind it is refused).
- `web_fetch: true` per member lets it read public web pages on a hosted run; it is withheld from any run that also reads private data (a repo, a knowledge base, a member holding credentials, or a code member).
- `report_instructions` is scanned for secrets and injection on write because it reaches every member's system prompt. Keep it to reporting style and standing rules.
- Alias: lowercase slug of the role, unique. Two members with the same alias draw ONE node on the canvas; the builder disambiguates, so never hand-write duplicates.

## 4. How it runs (state this in the description you give the owner)

- **In chat**: the buyer's own assistant does the thinking and calls the members' tools; no extra cost, no key needed. If the server cannot run the department itself, `run_department` returns a guided plan the assistant follows; the platform enforces order and completion.
- **In the background** (unattended or scheduled): the department uses the buyer's OWN LLM key from the vault; FindAgent supplies none. A required member that did not run blocks the report.
- A department is always `draft` status; there is no publish flow. Gate nothing on `published`.

## 5. Gates (paste real output)

1. Build the manifest and lint it with `npx --yes @findagent/cli lint <department-manifest>`. Paste the result, including the per-topology member cap (p2p 8, others 16).
2. Prove each member exists, is published and is eligible (section 2) by reading the catalogue (`findagent_get_agent` / the DB read you allows). A member that is a listing, a local-only code agent or unpublished fails the design.
3. Check role overlap: list each member's tools and say which goal step each serves; a member with no step is removed.
4. For `workflow` / `orchestrator`, show the path a sample goal takes member by member and which `when` conditions fire.

## 6. Handoff

You never create the department. Hand you: the manifest JSON, the validation output, the member table, and the creation route: the web builder `https://findagent.cloud/departments/new` (behind the `departments` flag, admin-open) or `POST /api/departments`; afterwards `findagent_edit_department` can change only `report_instructions`, and composition changes go through the builder. Report every doubt (a member whose tools do not fit the role, an undeclared dependency).

## Manifest gate (run before you report)

Validate the manifest with the same validator the marketplace runs at submit: `npx --yes @findagent/cli lint <path-to-manifest>` (pure local, no network, no account). Paste its output verbatim; every error must be fixed at the source. Then run the live checks this file lists. Background skills: `agent-plugins-format`, `code-agent-contract`, `submit-new-agent`.
