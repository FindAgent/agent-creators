---
description: Lint an agent manifest (findagent.json, a department manifest or a package's plugin.json) with the same validator the FindAgent marketplace runs at submit. Local, read-only.
argument-hint: <path to the manifest>
---

# /check-agent

Run `npx --yes @findagent/cli lint $ARGUMENTS` and report its output verbatim. It is pure local validation: no network, no account, nothing submitted. Fix every error at the source file and run it again. A clean lint is the schema gate only; it does not replace the live run, the build on https://findagent.cloud/submit, or the human review.
