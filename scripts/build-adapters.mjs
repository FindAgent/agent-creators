#!/usr/bin/env node
// Builds the provider-neutral layer from the single source of truth (agents/ and commands/).
//   node scripts/build-adapters.mjs          write the generated files
//   node scripts/build-adapters.mjs --check  fail when a generated file is stale (used by CI)
// Generated: playbooks/**, AGENTS.md, GEMINI.md, CONVENTIONS.md, .github/copilot-instructions.md,
// .cursor/rules/findagent-creators.mdc. Edit agents/ and commands/, never the generated files.

import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const out = new Map()

function parse(file) {
  const raw = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`${file}: missing frontmatter`)
  const meta = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { meta, body: m[2].trim() }
}

const list = (dir) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith('.md'))
    .sort()

const neutral = (t) => t.replace(/ with the ([a-z-]+) subagent/g, ' with the $1 playbook')

const agents = list('agents').map((f) => {
  const { meta, body } = parse(join(root, 'agents', f))
  const name = f.replace(/\.md$/, '')
  out.set(
    `playbooks/agents/${f}`,
    `# Playbook: ${name}\n\n> ${meta.description}\n\nFollow this playbook as the working instructions for the task. It is plain Markdown and works in any assistant that can read files, run shell commands and browse public pages.\n\n${body}\n`
  )
  return { name, description: meta.description }
})

const commands = list('commands').map((f) => {
  const { meta, body } = parse(join(root, 'commands', f))
  const name = f.replace(/\.md$/, '')
  const text = body
    .replace(/`\$ARGUMENTS`/g, "the user's request")
    .replace(/\$ARGUMENTS/g, "the user's request")
    .replace(/Dispatch the `([a-z-]+)` subagent/g, 'Follow `playbooks/agents/$1.md`')
    .replace(/Give the subagent:/g, 'Keep to:')
    .replace(/the subagent/g, 'the playbook')
  out.set(
    `playbooks/commands/${f}`,
    `# Command: /${name}\n\n> ${neutral(meta.description)}\n\n${text}\n`
  )
  return { name, description: neutral(meta.description) }
})

const skills = readdirSync(join(root, 'skills')).sort()

const index = [
  '# FindAgent agent creators: instructions for any AI assistant',
  '',
  'This repository teaches an AI assistant to build a [FindAgent](https://findagent.cloud) agent. It is plain Markdown plus two Node scripts, so it works the same in Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, Aider or any assistant that can read files and run commands.',
  '',
  '**How to use a playbook:** read the playbook named below in full, then do what it says in the user\'s own repository. Playbooks are the working instructions; skills are shared reference.',
  '',
  '## Creators',
  '',
  '| Build | Playbook |',
  '|---|---|',
  ...agents.map((a) => `| ${a.description.split(' — ')[0].split('. ')[0].split(' (')[0].split(' as a valid')[0]} | \`playbooks/agents/${a.name}.md\` |`),
  '',
  '## Commands',
  '',
  ...commands.map((c) => `- \`playbooks/commands/${c.name}.md\`: ${c.description}`),
  '',
  '## Shared reference (skills)',
  '',
  ...skills.map((s) => `- \`skills/${s}/SKILL.md\``),
  '',
  '## Scripts',
  '',
  '- `node scripts/check-agent.mjs <path>`: lint a manifest with the same validator the marketplace runs (needs Node 20+; fetches `@findagent/cli` through npx).',
  '- `node scripts/build-adapters.mjs`: regenerate this file and the per-assistant adapters after editing `agents/` or `commands/`.',
  '',
  '## Rules every playbook shares',
  '',
  '- Never put a secret or key in any file, and never ask the user for one.',
  '- No mock mode, demo data or unfinished-work markers in shipped code.',
  '- Declare only the egress hosts the code really calls, and a credential only together with its host.',
  '- Never submit or publish for the user. They submit at https://findagent.cloud/submit and a person reviews it.',
  '',
  'Reference template for code agents: https://github.com/FindAgent/agent-template',
  '',
].join('\n')

out.set('AGENTS.md', index)

const pointer = (what) =>
  `# FindAgent agent creators\n\nThis repository builds FindAgent agents. ${what}\n\nStart from \`AGENTS.md\`: it lists the playbooks (\`playbooks/agents/*.md\`) and commands (\`playbooks/commands/*.md\`). Read the playbook that matches the request in full and follow it. Never submit or publish for the user.\n`

out.set('GEMINI.md', '@AGENTS.md\n')
out.set('CONVENTIONS.md', pointer('Aider reads this file as its conventions.'))
out.set('.github/copilot-instructions.md', pointer('GitHub Copilot reads this file as repository instructions.'))
out.set(
  '.cursor/rules/findagent-creators.mdc',
  `---\ndescription: Build a FindAgent agent (code agent, skills package, actions, department or MCP listing)\nalwaysApply: false\n---\n\n${pointer('Cursor loads this rule when the request is about building a FindAgent agent.')}`
)

let stale = 0

for (const [rel, content] of out) {
  const file = join(root, rel)
  const current = existsSync(file) ? readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null

  if (current === content) continue

  if (check) {
    console.error(`stale: ${rel}`)
    stale += 1
  } else {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content)
    console.log(`wrote ${rel}`)
  }
}

if (check && stale > 0) {
  console.error(`${stale} generated file(s) out of date: run node scripts/build-adapters.mjs`)
  process.exit(1)
}

console.log(check ? 'adapters up to date' : 'done')
