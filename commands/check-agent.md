---
description: Check a local agent repository (code agent, skills or plugin package, actions agent or department manifest) the way FindAgent reads it, before you submit. Local, read-only.
argument-hint: <path to the repository or manifest>
---

# /check-agent

For a repository folder run `npx --yes @findagent/cli@0.4.1 check $ARGUMENTS`: it is the platform's own whole-repo check (manifest schema, the six entry tools, example prompts, egress hosts, lockfile, package parts, actions and secret shapes). For one manifest file (`findagent.json`, a department manifest or a package's `plugin.json`) run `npx --yes @findagent/cli@0.4.1 lint $ARGUMENTS`. Report the output verbatim. Neither needs an account, both are read-only, and the first run downloads the CLI package, so it needs network once. Fix every FAIL at the source file and run it again, and explain each WARN. A clean check is the schema gate only; it does not replace the live run, the build on https://findagent.cloud/submit, or the human review.
