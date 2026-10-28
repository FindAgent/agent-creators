#!/usr/bin/env node
// Validates the four MCP client configs by their KEYS, not only as JSON (CI runs this).
//   mcp.json          Agent Plugins 1.0: exactly `$schema` + `mcpServers`, `type` "streamable-http", the schema
//                     version equal to plugin.json's (https://agent-plugins.org/specification, sections 7 and 10.1)
//   .mcp.json         Claude Code: `mcpServers`, `type` "http"
//   .cursor/mcp.json  Cursor: `mcpServers`, an https `url`
//   .vscode/mcp.json  VS Code: `servers`, `type` "http"
// Exit 1 with one line per problem.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const problems = []
const read = (rel) => JSON.parse(readFileSync(join(root, rel), 'utf8'))
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const SCHEMA = /^https:\/\/agent-plugins\.org\/schemas\/(\d+\.\d+\.\d+)\/(plugin|mcp)\.schema\.json$/

function servers(rel, doc, key) {
  if (!isObject(doc) || !isObject(doc[key]) || Object.keys(doc[key]).length === 0) {
    problems.push(`${rel}: "${key}" must be a non-empty object`)

    return []
  }

  return Object.entries(doc[key])
}

function remote(rel, name, server, type) {
  if (!isObject(server)) {
    problems.push(`${rel}: server "${name}" must be an object`)

    return
  }

  if (type && server.type !== type) {
    problems.push(`${rel}: server "${name}" needs type "${type}", found ${JSON.stringify(server.type)}`)
  }

  if (typeof server.url !== 'string' || !server.url.startsWith('https://')) {
    problems.push(`${rel}: server "${name}" needs an https url`)
  }
}

const plugin = read('plugin.json')
const pluginVersion = SCHEMA.exec(plugin.$schema ?? '')

if (!pluginVersion || pluginVersion[2] !== 'plugin') {
  problems.push('plugin.json: $schema must be the Agent Plugins plugin schema')
}

const spec = read('mcp.json')
const extra = Object.keys(spec).filter((k) => k !== '$schema' && k !== 'mcpServers')
const specSchema = SCHEMA.exec(spec.$schema ?? '')

if (extra.length > 0) {
  problems.push(`mcp.json: no top-level fields besides $schema and mcpServers, found ${extra.join(', ')}`)
}

if (!specSchema || specSchema[2] !== 'mcp') {
  problems.push('mcp.json: $schema must be the Agent Plugins mcp schema')
} else if (pluginVersion && specSchema[1] !== pluginVersion[1]) {
  problems.push(`mcp.json: $schema version ${specSchema[1]} must equal plugin.json's ${pluginVersion[1]}`)
}

for (const [name, s] of servers('mcp.json', spec, 'mcpServers')) {
  remote('mcp.json', name, s, 'streamable-http')
}

for (const [name, s] of servers('.mcp.json', read('.mcp.json'), 'mcpServers')) {
  remote('.mcp.json', name, s, 'http')
}

for (const [name, s] of servers('.cursor/mcp.json', read('.cursor/mcp.json'), 'mcpServers')) {
  remote('.cursor/mcp.json', name, s, null)
}

for (const [name, s] of servers('.vscode/mcp.json', read('.vscode/mcp.json'), 'servers')) {
  remote('.vscode/mcp.json', name, s, 'http')
}

if (problems.length > 0) {
  console.error(problems.join('\n'))
  process.exit(1)
}

console.log('MCP client configs are valid')
