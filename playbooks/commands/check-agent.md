# Command: /check-agent

> Lint an agent manifest (findagent.json or a department manifest; not a package's plugin.json) with the same validator the FindAgent marketplace runs at submit. Local, read-only.

# /check-agent

Run `npx --yes @findagent/cli@0.4.0 lint <path to the manifest>` and report its output verbatim. It needs no account and submits nothing; the first run downloads the CLI package, so it needs network once. Fix every error at the source file and run it again. The CLI validates `findagent.json` and department manifests only; a package's `plugin.json` is checked by uploading the folder on https://findagent.cloud/submit and reading the "We found" card. A clean lint is the schema gate only; it does not replace the live run, the build on https://findagent.cloud/submit, or the human review.
