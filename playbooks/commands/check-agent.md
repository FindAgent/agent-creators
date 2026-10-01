# Command: /check-agent

> Lint an agent manifest (findagent.json, a department manifest or a package's plugin.json) with the same validator the FindAgent marketplace runs at submit. Local, read-only.

# /check-agent

Run `npx --yes @findagent/cli@0.4.0 lint <path to the manifest>` and report its output verbatim. It needs no account and submits nothing; the first run downloads the CLI package, so it needs network once. Fix every error at the source file and run it again. A clean lint is the schema gate only; it does not replace the live run, the build on https://findagent.cloud/submit, or the human review.
