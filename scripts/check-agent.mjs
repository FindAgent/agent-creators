#!/usr/bin/env node
// Lint a FindAgent manifest locally with the marketplace's own validator.
//   node scripts/check-agent.mjs <path to findagent.json | department manifest>
// Read-only: no account, nothing submitted. Exit code 1 on any error.
// A package's plugin.json is NOT validated by the CLI (it would be read as an agent manifest and fail on
// fields it never carries): upload the folder on https://findagent.cloud/submit and read the "We found" card.

import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const target = process.argv[2]

if (!target || !existsSync(target)) {
  console.error('usage: node scripts/check-agent.mjs <path to the manifest>')
  process.exit(2)
}

if (/(^|[\\/])plugin\.json$/.test(target)) {
  console.error(
    'plugin.json is an Agent Plugins manifest, not a FindAgent agent manifest: the CLI lint cannot check it.\n' +
      'Upload the package folder on https://findagent.cloud/submit (Upload door) and read the "We found" card.'
  )
  process.exit(2)
}

// Pinned so a lint result is reproducible; bump together with the playbooks.
const CLI = '@findagent/cli@0.4.0'
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const run = spawnSync(npx, ['--yes', CLI, 'lint', target], { stdio: 'inherit', shell: process.platform === 'win32' })

process.exit(run.status ?? 1)
