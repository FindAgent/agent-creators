---
name: submit-new-agent
description: How a new FindAgent agent actually gets submitted and what runs on it (doors, attestation, preflight, build wait, scan, human review, admin auto-approve), including the order of steps in the /submit wizard. Use before submitting any agent, or when a submission is stuck on preflight, a build or review.
---

# Submitting a new agent

**Doors** (https://findagent.cloud/submit): Agent -> GitHub (a repo), Upload (zip, folder or one manifest), Editor (write it in the browser); MCP server (a listing). Over MCP: `findagent_create_code_draft` / `findagent_create_package_draft` / `findagent_create_draft`, then `findagent_submit_for_review`.

**GitHub-door order:** pick the repo -> We found -> Basics (title, tagline, description, example prompts, Discipline + sub-discipline, optional Industry) -> Credentials -> Manifest -> Review. On Review: **Run preflight** (manifest, categories, credentials, build dry-run). A code agent builds in the sandbox for minutes; the panel re-checks itself and **Submit for review** unlocks only when the build PASSED. Then tick the two confirmations (your own work; no prohibited category) and submit.

**After submit:** scan (automated), then human review. Only an admin's own submission auto-approves on a clean scan, which is a live listing; anyone else waits for review. A rejected or needs-changes draft returns with the reason.

**Rules of thumb:** pick the Discipline and a sub-discipline yourself (a top level with no sub is refused); keep example prompts real; never put a secret in any file; lint the manifest with `npx --yes @findagent/cli lint` first.
