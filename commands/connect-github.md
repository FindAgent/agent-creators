---
description: Walk the user through connecting GitHub to FindAgent, which the GitHub door of the submit page and the MCP tools findagent_import_repo, findagent_create_code_draft and findagent_create_package_draft with a repo all need.
argument-hint: <web or MCP, and which repository>
---

# /connect-github

Follow this to get the user's GitHub connected, then stop: connecting grants nothing by itself and submits nothing. The request: $ARGUMENTS

**Why it is needed.** A code agent can only come in from a repository (the GitHub door, or `findagent_create_code_draft` over MCP), and a package can come from a repository you own. FindAgent reads a snapshot of the repository you choose with your stored GitHub connection; nothing is pushed back to GitHub.

**On the web**
1. Go to https://findagent.cloud/submit, choose **Agent**, then the **GitHub** door.
2. Press **Connect GitHub**. You are sent to GitHub to authorize; when you return you land on `/submit?github=connected`. A failed round trip returns to `/submit?github=error&reason=...` instead.
3. If the page shows **Install & choose repositories**, the FindAgent GitHub app is not installed on the repository yet: install it, grant access to only the repositories you want FindAgent to see, then press the refresh button beside the list.
4. Pick the repository. A repository that already has a draft says "Continue draft".

**Over MCP** (the FindAgent platform MCP must be connected; see the README)
1. Call `findagent_connect_github`. It returns whether GitHub is already connected and a browser connect URL. Open that URL in the browser signed in to the SAME FindAgent account and authorize. The tool itself grants nothing.
2. Call `findagent_list_repos`. `connected: false` means step 1 is not finished; `needs_install` comes with an install URL for the GitHub app.
3. Optionally read the repository with `findagent_import_repo`; then `findagent_create_code_draft` for a code agent (it re-pulls the repository itself and does not need a prior import), or `findagent_create_package_draft` with `repo` (and optionally `ref` and `path`) for a package. A package draft from a repository proves you have push access first, so the repository must be yours.
4. To use a different GitHub account, call `findagent_disconnect_github` first (it is safe to call when nothing is connected), then start again at step 1.

If the connect endpoint answers `github_connect_not_configured`, that deployment has no GitHub connection set up and there is nothing to fix on your side.
