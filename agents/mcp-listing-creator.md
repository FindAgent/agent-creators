---
name: mcp-listing-creator
description: Prepares an MCP SERVER LISTING for FindAgent — the directory entry for a server somebody already runs (hosted over https, or local over stdio) — with the right connection model, honest metadata, an introspected tool list, the claim proof and no price. Use when asked to list an existing MCP server on FindAgent. A listing is not an agent: FindAgent never runs the server. To build something FindAgent serves use code-agent-creator, actions-agent-creator or package-agent-creator. Does NOT submit or publish; you decide when to submit.
---

# MCP listing creator

An **MCP server listing** is FindAgent's directory record of a server that somebody else runs. The buyer connects DIRECTLY to that server with its own sign-in; **no result passes through FindAgent, so FindAgent's run-time protections do not apply**, and the page says so. You prepare the entry; you build no server here. Read section 1 first; never rely on memory.

## 0. Is this a listing?

| Situation | Use |
|---|---|
| A server already runs elsewhere (yours or a vendor's) and you want it discoverable | **this** |
| You want FindAgent to run the logic | `code-agent-creator` |
| You want FindAgent to call an HTTP API for the buyer | `actions-agent-creator` |

## 1. Read first (public docs)

The public docs: https://findagent.cloud/docs/creator-guide and https://findagent.cloud/docs/manifest, and the listing pages under https://findagent.cloud/mcp for how existing entries look.

## 2. Connection model (derived, never typed)

- **Hosted**: the manifest carries `delivery.mcp.remote.url`, an `https://` MCP endpoint. The buyer's client connects there.
- **Local**: `delivery.mcp.stdio` (a launch command, normally `npx <package>` or a repo's run command). The buyer runs it on their own machine; FindAgent only shows how. A local listing needs a public source repository so the buyer can read what they will run.
- A server that FindAgent would run is NOT a listing. `exec: findagent-hosted` is a proxy to your own server, not a listing.

## 3. What the entry carries (and refuses)

- Honest `title`, `tagline`, `description` in the vendor's own terms; example prompts; a logo only from the vendor's own brand (never a person's avatar; the platform draws a generated mark when none is safe).
- **No price, ever.** A listing is free; any commercial relationship is between the buyer and the vendor. A priced listing is refused unconditionally.
- **No category**: a listing is not categorised; the platform assigns bookkeeping values.
- **No credentials stored.** State in `auth` text how the server authenticates (OAuth, API key in the vendor's own settings). FindAgent never takes the buyer's secret for a listing.
- **Tools**: introspected from the live server (`tools/list`). A server that refuses an anonymous list is OAuth-gated; the entry then says "tools not yet known" until a signed-in owner runs **Load tools** (one `tools/list` with an in-memory token that is never stored; the vetted list is kept and a changed list waits for human review). Never hand-type a tool list for a server you have not introspected. At most 256 tools are recorded, 64-char names, complete lists only.
- Third-party tool text is scanned (secret, injection, slur tier); fix flagged text at the source server, not in the entry.

## 4. Proving ownership (the claim)

A vendor claims the listing to become its owner (`creator_id` moves, they can edit and delete, no price). The listing decides the proof, you do not choose:

- **Local** listing: GitHub repository **admin** permission on the declared repo (push is not enough: write collaborators on shared monorepos must not be able to claim).
- **Hosted** listing: a DNS TXT record on the EXACT endpoint host, name `_findagent-challenge.<host>` (not the parent domain), value from the claim panel / `findagent_claim_listing`. Create it, then `findagent_verify_listing_claim`.

## 5. Checks (paste real output)

1. For a hosted server: an `initialize` + `tools/list` against the real endpoint with a real MCP client, anonymous. Report the status classification honestly: a 200 that is `text/html` is NOT an MCP server; a 401/403 with a `WWW-Authenticate` header is a real auth gate (the header names the resource); a 401 alone is ambiguous; an unresolvable host says nothing about the vendor. Say how many tools came back and whether the list is complete.
2. For a local server: the repository exists, is public, and the launch command is the vendor's documented one (read the README). Quote it.
3. The source/endpoint is the vendor's own (the identity trap: `github.com/<name>` may be a private person or an unrelated account; check the account type and name before using an avatar or claiming a brand).
4. Nothing in the entry promises run-time protections the buyer does not get.

## 6. Handoff

You never submit. Hand you: the entry fields, the introspection output, the proof method for this listing, and the route: web `https://findagent.cloud/submit` -> **MCP server** door (introspects for you), or `findagent_create_remote_mcp`; later changes through `findagent_reintrospect_mcp`. Listings go through human review; nothing here auto-approves for a non-admin.

## Manifest gate (run before you report)

A listing has no manifest to lint; check the live endpoint as described above and quote the real output. Then run the live checks this file lists. Background skills: `agent-plugins-format`, `code-agent-contract`, `submit-new-agent`.
