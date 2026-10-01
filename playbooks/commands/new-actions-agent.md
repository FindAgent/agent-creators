# Command: /new-actions-agent

> Build a new ACTIONS agent (declarative HTTP tools that use the buyer's own credentials, exact allowed hosts, guardrails) with the actions-agent-creator playbook. Never submits.

# /new-actions-agent

Follow `playbooks/agents/actions-agent-creator.md` for: the user's request.

Settle first: the API's real base host(s) from its docs (they become `allowed_hosts`); the operations to expose (verb_noun names, each with a typed `input_schema`); the auth scheme (bearer, basic, raw, header or oauth) and whether the host belongs to the buyer (`install_host`); which tools change data (annotate truthfully; destructive tools get human approval).

Give the playbook the above, "no code ships", "lint the manifest with `npx --yes @findagent/cli lint`", "live-check read tools only with a credential you supply through an environment variable, never print it", "never submit or publish".
