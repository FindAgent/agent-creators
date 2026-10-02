#!/usr/bin/env node
// Check a FindAgent agent locally with the marketplace's own CLI, offline apart from the first download.
//   node scripts/check-agent.mjs <repository folder>            whole-repo check (`findagent check`)
//   node scripts/check-agent.mjs <findagent.json | plugin.json>  one manifest (`findagent lint`)
// Read-only: no account, nothing submitted. Exit code 1 on any failure.

import { existsSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const target = process.argv[2]

if (!target || !existsSync(target)) {
  console.error('usage: node scripts/check-agent.mjs <repository folder | path to a manifest>')
  process.exit(2)
}

// Pinned so a result is reproducible; bump together with the playbooks.
const CLI = '@findagent/cli@0.4.1'
const verb = statSync(target).isDirectory() ? 'check' : 'lint'
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const run = spawnSync(npx, ['--yes', CLI, verb, target], { stdio: 'inherit', shell: process.platform === 'win32' })

process.exit(run.status ?? 1)
