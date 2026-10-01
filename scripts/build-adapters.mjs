#!/usr/bin/env node
// Builds the provider-neutral layer from the single source of truth (agents/, commands/, skills/).
//   node scripts/build-adapters.mjs          write the generated files
//   node scripts/build-adapters.mjs --check  fail when a generated file is stale or orphaned (CI)
// Generated: playbooks/**, AGENTS.md, CLAUDE.md, GEMINI.md, CONVENTIONS.md, .aider.conf.yml,
// .github/copilot-instructions.md, .cursor/rules/*.mdc and the MCP client configs
// (mcp.json, .mcp.json, .cursor/mcp.json, .vscode/mcp.json). Edit agents/, commands/ and skills/,
// never the generated files.

import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const out = new Map()

const PLATFORM_MCP_URL = 'https://mcp.findagent.cloud/mcp'
const SKILL_NAMES = ['agent-plugins-format', 'code-agent-contract', 'submit-new-agent']

function parse(file) {
  const raw = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`${file}: missing frontmatter`)
  const meta = {}
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue
    const i = line.indexOf(':')
    if (i <= 0) throw new Error(`${file}: frontmatter line has no key (multi-line values are not supported): ${line}`)
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { meta, body: m[2].trim() }
}

const list = (dir) =>
  readdirSync(join(root, dir))
    .filter((f) => f.endsWith('.md'))
    .sort()

// A skill is reference text a neutral assistant cannot load by name: point at its file.
const skillPaths = (t) =>
  t.replace(new RegExp('`(' + SKILL_NAMES.join('|') + ')`', 'g'), '`skills/$1/SKILL.md`')

const neutral = (t) => t.replace(/ with the ([a-z-]+) subagent/g, ' with the $1 playbook')

const agents = list('agents').map((f) => {
  const { meta, body } = parse(join(root, 'agents', f))
  const name = f.replace(/\.md$/, '')
  out.set(
    `playbooks/agents/${f}`,
    `# Playbook: ${name}\n\n> ${meta.description}\n\nFollow this playbook as the working instructions for the task. It is plain Markdown and works in any assistant that can read files and run shell commands. See "Requirements" in \`AGENTS.md\` for what it expects the assistant to have.\n\n${skillPaths(body)}\n`
  )
  return { name, description: meta.description }
})

const commands = list('commands').map((f) => {
  const { meta, body } = parse(join(root, 'commands', f))
  const name = f.replace(/\.md$/, '')
  const arg = (meta['argument-hint'] || '<the request>').replace(/\s*\[.*?\]/g, '').trim() || '<the request>'
  const text = skillPaths(body).replace(/\$ARGUMENTS/g, arg)
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
  "**How to use a playbook:** read the playbook named below in full, then do what it says in the user's own repository. Playbooks are the working instructions; skills are shared reference (`skills/<name>/SKILL.md`).",
  '',
  '## Creators',
  '',
  '| Build | Playbook |',
  '|---|---|',
  ...agents.map(
    (a) =>
      `| ${a.description.split(' — ')[0].split('. ')[0].split(' (')[0].split(' as a valid')[0]} | \`playbooks/agents/${a.name}.md\` |`
  ),
  '',
  '## Commands',
  '',
  ...commands.map((c) => `- \`playbooks/commands/${c.name}.md\`: ${c.description}`),
  '',
  '## Shared reference (skills)',
  '',
  ...skills.map((s) => `- \`skills/${s}/SKILL.md\``),
  '',
  '## Requirements',
  '',
  'Playbooks assume an assistant that can read and write files, run shell commands and read public web pages. Some steps also use the following, and must say "not checked: <tool> unavailable" when it is missing:',
  '',
  '- network access once, to download the CLI the lint step runs (`npx @findagent/cli`), or a local clone of it;',
  '- a connected FindAgent MCP server (`mcp.json`) for the catalogue and submission steps;',
  '- Node 20+ for the scripts, plus `pnpm` and headless Chromium for code-agent panel checks, or Python 3.13 for Python agents;',
  '- an MCP client to run the finished agent live.',
  '',
  '## Scripts',
  '',
  '- `node scripts/check-agent.mjs <path>`: lint a manifest with the same validator the marketplace runs (Node 20+; downloads the pinned `@findagent/cli` through npx).',
  '- `node scripts/build-adapters.mjs`: regenerate this file and the per-assistant files after editing `agents/`, `commands/` or `skills/`.',
  '',
  '## Submitting over MCP',
  '',
  `Connect the FindAgent platform MCP (\`${PLATFORM_MCP_URL}\`; ready-made configs: \`mcp.json\`, \`.mcp.json\`, \`.cursor/mcp.json\`, \`.vscode/mcp.json\`). Create drafts with \`findagent_create_code_draft\` (code), \`findagent_create_package_draft\` (instructions and skills) or \`findagent_create_draft\` (actions), then \`findagent_submit_for_review\`. Use these repositories as the reference: https://github.com/FindAgent/agent-template for code and these playbooks for every part. A person reviews every submission.`,
  '',
  '## Rules every playbook shares',
  '',
  '- Never put a secret or key in any file, and never ask the user for one.',
  '- No mock mode, demo data or unfinished-work markers in shipped code.',
  '- Declare only the egress hosts the code really calls, and a credential only together with its host.',
  '- Never submit or publish for the user. They submit at https://findagent.cloud/submit (or over MCP) and a person reviews it.',
  '',
  'Reference template for code agents: https://github.com/FindAgent/agent-template',
  '',
].join('\n')

out.set('AGENTS.md', index)

const pointer = (what) =>
  `# FindAgent agent creators\n\nThis repository builds FindAgent agents. ${what}\n\nStart from \`AGENTS.md\`: it lists the playbooks (\`playbooks/agents/*.md\`), commands (\`playbooks/commands/*.md\`) and requirements. Read the playbook that matches the request in full and follow it. Never submit or publish for the user.\n`

out.set('CLAUDE.md', '@AGENTS.md\n')
out.set('GEMINI.md', '@AGENTS.md\n')
out.set('CONVENTIONS.md', pointer('Aider reads this file when started with `--read CONVENTIONS.md` (see `.aider.conf.yml`).'))
out.set('.aider.conf.yml', 'read:\n  - AGENTS.md\n')
out.set('.github/copilot-instructions.md', pointer('GitHub Copilot reads this file as repository instructions.'))
out.set(
  '.cursor/rules/findagent-creators.mdc',
  `---\ndescription: Build a FindAgent agent (code agent, skills package, actions, department or MCP listing)\nalwaysApply: false\n---\n\n${pointer('Cursor loads this rule when the request is about building a FindAgent agent.')}`
)

const json = (o) => `${JSON.stringify(o, null, 2)}\n`
const httpServer = { type: 'http', url: PLATFORM_MCP_URL }
out.set('mcp.json', json({ mcpServers: { findagent: httpServer } }))
out.set('.mcp.json', json({ mcpServers: { findagent: httpServer } }))
out.set('.cursor/mcp.json', json({ mcpServers: { findagent: { url: PLATFORM_MCP_URL } } }))
out.set('.vscode/mcp.json', json({ servers: { findagent: httpServer } }))

function walk(dir) {
  const acc = []
  if (!existsSync(dir)) return acc
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) acc.push(...walk(p))
    else acc.push(relative(root, p).split(sep).join('/'))
  }
  return acc
}

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

// A playbook whose source was deleted must not linger.
for (const rel of walk(join(root, 'playbooks'))) {
  if (!out.has(rel)) {
    if (check) {
      console.error(`orphan: ${rel}`)
      stale += 1
    } else {
      console.error(`orphan (delete it): ${rel}`)
    }
  }
}

if (check && stale > 0) {
  console.error(`${stale} generated file(s) out of date: run node scripts/build-adapters.mjs`)
  process.exit(1)
}

console.log(check ? 'adapters up to date' : 'done')
