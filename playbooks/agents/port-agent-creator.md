# Playbook: port-agent-creator

> Maps an EXISTING repository in another format (a SKILL.md collection, a Claude, Codex, Cursor or Gemini plugin, a rules-only repo, an OpenAPI wrapper, an MCP server, a framework agent) onto the right FindAgent creator, and says what the platform will keep, leave out or refuse. Use before porting something that already exists. Works only on the owner's own repository. Does NOT port, submit or publish by itself; it hands the work to the matching creator.

Follow this playbook as the working instructions for the task. It is plain Markdown and works in any assistant that can read files and run shell commands. See "Requirements" in `AGENTS.md` for what it expects the assistant to have.

# Port agent creator

You decide **how an existing repository becomes a FindAgent agent**, and you tell the owner what survives. You build nothing here: you classify, check what the platform will do with the files, and hand the work to one creator. Read section 1 first; never rely on memory.

## 0. Ownership and licence first

FindAgent accepts only the **owner's own repository**. At submit the owner attests the files are their own, and a repository somebody else owns cannot be brought in, however popular it is. Before anything else:

1. Confirm the person you work for owns the repository (or the organization does and they act for it).
2. Read its `LICENSE`. Permissive (MIT, Apache-2.0, BSD): keep the notice. Copyleft (GPL, AGPL, CC-BY-SA): the derived package inherits the terms, so the owner must decide that on purpose. No licence: all rights reserved; stop and ask the owner to choose one.
3. Check the tree for third-party text or code copied in (vendored skills, bundled prompts); each needs its own licence to allow the move.

If any answer is "no" or "not sure", report it and stop. Do not work around it.

## 1. Read first

The public docs: https://findagent.cloud/docs/creator-guide and https://findagent.cloud/docs/manifest, the Agent Plugins format at https://agent-plugins.org and the Agent Skills specification at https://agentskills.io/specification. Then run the platform's own offline check on the repository to see what it detects: `npx --yes @findagent/cli@latest check <repo-dir>` (read-only, no account; it needs network once to download the CLI). Paste the output.

## 2. Decision table

| What the repository is | Port to | Creator |
|---|---|---|
| A collection of `SKILL.md` folders | An Agent Plugins package. More than 40 skills: split into several agents | `package-agent-creator` (section 2c) |
| A Claude, Codex, Cursor or Gemini plugin | The same package: the plugin manifest is read as it is | `package-agent-creator` (section 2a) |
| Only rules files (`AGENTS.md`, `.cursorrules`, `.windsurfrules`, `.cursor/rules`, and so on) | A package; recognised rule files become skills, standing instructions move to `skills/instructions/SKILL.md` | `package-agent-creator` (section 2b) |
| A Custom GPT or a Gem (instructions plus an OpenAPI schema; see the dated retirement note in `package-agent-creator` section 2e) | The Editor at `https://findagent.cloud/editor?from=custom-gpt` | `package-agent-creator` (section 2e), `actions-agent-creator` |
| An OpenAPI spec or a thin wrapper that only calls one HTTP API | Actions: declarative tools using the buyer's own key. Select at most 40 operations | `actions-agent-creator` (section 2a) |
| An MCP server in Node or Python whose logic needs code | A code agent (hosted in the sandbox, or local run) | `code-agent-creator` |
| An MCP server in Go, Rust, Java or another runtime | Not a code agent (only `node22`, `node24`, `python3.13` exist). List the server you already run as a local stdio listing, or port it to Node or Python first | `mcp-listing-creator` or `code-agent-creator` |
| An MCP server somebody already runs and you want discoverable | A listing: FindAgent never runs it | `mcp-listing-creator` |
| A framework agent (LangChain, LlamaIndex, OpenAI Agents SDK, CrewAI and similar) | A Python code agent that wraps the agent loop as an MCP server with the six entry tools; see the `framework` variant of https://github.com/FindAgent/agent-template | `code-agent-creator` |
| A multi-agent crew or workflow | Several published agents, composed as a Department | `department-creator` after the members exist |
| Prompts plus scripts the buyer runs on their own machine | A package for the instructions; the scripts reach no buyer today (section 3) | `package-agent-creator` |

A repository can fall in two rows (for example skills plus an API). Pick the lightest honest kind for each part and split the repository into one agent per part when they do not belong together.

## 3. What the platform keeps, leaves out or refuses

| Outcome | What |
|---|---|
| **Kept** | Text of `plugin.json` (or the vendor plugin manifest), every `SKILL.md` and its text siblings, `commands/`, `agents/`, recognised rule files, the vendor block of the plugin format |
| **Left out, and reported** | Binary files (fonts, PDFs, images, executables). The import says which |
| **Stored but reaching no buyer today** | `hooks/`, `scripts/`, `bin/`, launchers with a `command`, shell expansion in commands, `allowed-tools` granting `Bash`. They are scanned, off the Connect path, and the public plugin catalog exports every agent without them. Do not rely on them |
| **Read as a skill (root only)** | `AGENTS.md`, `.clinerules` and `.clinerules/*.md`, GitHub Copilot's path-scoped `*.instructions.md` files; they describe how to work IN a repo, so check each reads right for the buyer's model |
| **Not recognised as parts** | `CLAUDE.md`, `GEMINI.md`, `CONVENTIONS.md`, `.github/copilot-instructions.md` (the agent template writes them into every repository), and rule file names inside a subfolder |
| **Refused** | More than 40 skills (`too_many_skills`); an invalid skill `name` (`invalid_skill_name`); an unreadable manifest; more than 40 tools; an action on a plain `http://` URL; actions declared in both `findagent.json` and `plugin.json`; a secret anywhere in the tree |

## 4. What you produce

A written port plan, not code: the repository and its licence verdict; the row of the decision table; the creator that takes it over and the parts it will build; the list of what is kept, left out, refused or not to be relied on (section 3) with file names; what stays behind and why. Show it to the owner and wait for their go before any creator starts.

## 5. Gates

1. The offline check output from section 1, pasted verbatim.
2. The licence verdict, with the file you read.
3. Every item in the plan traces to a file you opened. A claim you did not check is written "not checked: <reason>".

## 6. Handoff

Never port, submit or publish yourself. Hand the plan to the owner and name the creator. The owner submits at https://findagent.cloud/submit (Upload, GitHub or Editor door) or over MCP; the submission is scanned and a person reviews it.

## Manifest gate (run before you report)

Check the whole repository with the platform's own offline check: `npx --yes @findagent/cli@latest check <repo-dir>` (read-only; the first run downloads the CLI package, so it needs network once). Paste the output verbatim. Background skills: `skills/agent-plugins-format/SKILL.md`, `skills/code-agent-contract/SKILL.md`, `skills/submit-new-agent/SKILL.md`.
