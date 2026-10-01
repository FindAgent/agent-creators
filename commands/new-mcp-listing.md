---
description: Prepare an MCP SERVER LISTING (a hosted https or local stdio server that somebody already runs) with an introspected tool list and the right ownership proof, with the mcp-listing-creator subagent. Never submits.
argument-hint: <server URL or repository>
---

# /new-mcp-listing

Dispatch the `mcp-listing-creator` subagent for: `$ARGUMENTS`.

Settle first: hosted (an https MCP endpoint) or local (a stdio launch command plus a public repository); whose server it is (the vendor's own identity, not a lookalike account); whether the server answers `tools/list` anonymously (otherwise it is OAuth-gated and tools load later). A listing carries no price and no category.

Give the subagent the above, "introspect the real endpoint and classify on the response body, not the status code", "never submit or publish". Submit at https://findagent.cloud/submit (MCP server door) when you are ready.
