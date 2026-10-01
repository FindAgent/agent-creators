---
description: Build a new ACTIONS agent (declarative HTTP tools that use the buyer's own credentials, exact allowed hosts, guardrails) with the actions-agent-creator subagent. Never submits.
argument-hint: <which API and which operations>
---

# /new-actions-agent

Follow the `actions-agent-creator` creator for this request: $ARGUMENTS

Settle first: the API's real base host(s) from its docs (they become `allowed_hosts`); the operations to expose (verb_noun names, each with a typed `input_schema`); the auth scheme (bearer, basic, raw, header or oauth) and whether the host belongs to the buyer (`install_host`); which tools change data (annotate truthfully; destructive tools get human approval).

Hold the creator to the above: "no code ships", "lint the manifest with `npx --yes @findagent/cli@0.4.0 lint`", "live-check read tools only with a credential you supply through an environment variable, never print it", "never submit or publish".
