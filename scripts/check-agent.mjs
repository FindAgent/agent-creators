#!/usr/bin/env node
// Check a FindAgent agent locally with the marketplace's own CLI, offline apart from the first download.
//   node scripts/check-agent.mjs <repository folder>            whole-repo check (`findagent check`)
//   node scripts/check-agent.mjs <findagent.json | plugin.json>  one manifest (`findagent lint`)
// Read-only: no account, nothing submitted. Exit code 1 on any failure.

import { existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'

const target = process.argv[2]

if (!target || !existsSync(target)) {
  console.error('usage: node scripts/check-agent.mjs <repository folder | path to a manifest>')
  process.exit(2)
}

// Always the latest published CLI: the checks follow the platform, so there is no version to keep in step.
const CLI = '@findagent/cli@latest'
const verb = statSync(target).isDirectory() ? 'check' : 'lint'
const args = ['--yes', CLI, verb, target]

// No shell, so a path with a space (or a quote, or an ampersand) reaches the CLI as ONE argument. On Windows npx
// is a .cmd file, which Node refuses to start without a shell, so run npm's own npx-cli.js with this node instead.
function command() {
  if (process.platform !== 'win32') {
    return { file: 'npx', argv: args }
  }

  const cli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js')

  if (!existsSync(cli)) {
    console.error(`npx not found next to this node (looked for ${cli}). Run: npx --yes ${CLI} ${verb} <path>`)
    process.exit(2)
  }

  return { file: process.execPath, argv: [cli, ...args] }
}

const { file, argv } = command()
const run = spawnSync(file, argv, { stdio: 'inherit' })

if (run.error) {
  console.error(`could not start ${file}: ${run.error.message}`)
  process.exit(2)
}

process.exit(run.status ?? 1)
