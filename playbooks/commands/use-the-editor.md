# Command: /use-the-editor

> Walk the user through the FindAgent Editor (https://findagent.cloud/editor), the browser door that writes an Agent Plugins package with instructions, actions, skills, commands and sub-agents and submits it for review. Nothing is published for them.

# /use-the-editor

Follow this to tell the user, step by step, how to build and submit a package in the Editor. You cannot click for them: prepare the text with the matching creator first (`package-agent-creator` for instructions and skills, `actions-agent-creator` for actions), then they paste it in. The request: <what the user wants to write in the Editor>

1. **Open it signed in.** Go to https://findagent.cloud/editor. The page needs a FindAgent session, so a signed-out visitor is sent to sign in first. `https://findagent.cloud/editor?from=custom-gpt` opens the Custom GPT import over a blank draft (see the dated note in `package-agent-creator`, section 2e).
2. **Know the layout.** The left tree lists the parts: Listing, Package (`plugin.json`), Instructions, Actions, one entry per skill (with its reference files), commands, sub-agents, and `mcp.json` (generated for you). The right panel has three tabs: Preview, Files (the exact files that will be uploaded) and Checks.
3. **Fill the Listing.** Title, web address (3 to 60 characters: lowercase letters, digits and hyphens; it is permanent once the agent is published), tagline, description, up to 5 example prompts, and a Discipline with a sub-discipline. Add Instructions, then skills, commands, sub-agents and Actions as the agent needs.
4. **Read the Checks tab.** Every check that blocks shows a count beside the Submit button ("N checks block submit"). A package larger than 4 MB is refused here; the GitHub door carries up to 8 MB (see `package-agent-creator`, section 2).
5. **Submit.** Tick the own-work box, press **Submit for review**, and confirm the permanent web address when asked. The Editor never publishes: the package is scanned and a person reviews it.

Notes to give the user: the draft is saved in this browser only (a different browser or device starts empty), and the Editor does not take code. A code agent comes in through the GitHub door; see `/connect-github`.
