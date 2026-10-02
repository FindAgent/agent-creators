---
name: submit-new-agent
description: How a new FindAgent agent actually gets submitted and what runs on it (doors, attestation, preflight, build wait, scan, human review, admin auto-approve), including the order of steps in the /submit wizard. Use before submitting any agent, or when a submission is stuck on preflight, a build or review.
---

# Submitting a new agent

## Doors and order

**Doors** (https://findagent.cloud/submit): Agent -> GitHub (a repo), Upload (zip, folder or one manifest), Editor (write it in the browser); MCP server (a listing). Over MCP: `findagent_create_code_draft` / `findagent_create_package_draft` / `findagent_create_draft`, `findagent_preflight`, then `findagent_submit_for_review`; later versions through `findagent_new_version` (re-pull for code and skills agents, patch bump by default) or `findagent_reupload` (uploaded packages). A code agent comes from a GitHub repository (the GitHub door, or the MCP code-draft tools); Upload and the Editor take instructions, skills and actions.

**GitHub-door order:** pick the repo (a repo that already has a draft says "Continue draft" and resumes without a second pull) -> We found -> Basics (title, tagline, description, example prompts, Discipline + sub-discipline, optional Industry; pre-selected categories are strong matches only and preflight judges what is on screen) -> Credentials -> Manifest -> Review. On Review: **Run preflight** (manifest, categories, credentials, and a build dry-run in the sandbox). The build takes minutes; the panel re-checks itself and **Submit for review** unlocks only when the build PASSED; advisories (missing form tools, a panel that calls tools, no typed `input_schema`) never block it. Then tick the two confirmations (your own work; no prohibited category) and submit. Reloading the page restores the step and the draft.

**After submit:** scan (automated), then human review. Only an admin's own submission auto-approves on a clean scan, which is a live listing; anyone else waits for review. A rejected or needs-changes draft returns with the reason.

**Rules of thumb:** pick the Discipline and a sub-discipline yourself (a top level with no sub is refused); keep example prompts real; never put a secret in any file; a discarded draft gives its slug back.

## Checking

Check the repository first with `npx --yes @findagent/cli@0.4.1 check <dir>`.
