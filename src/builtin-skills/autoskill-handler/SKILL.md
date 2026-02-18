---
name: autoskill-handler
description: Guide for handling the \/autoskill quick command - skip agent's context judgment and directly create or improve skills
---

# Autoskill Quick Command Handler

## Overview

When the user types `/autoskill` in chat, this is a **shortcut command** that bypasses the normal agent context judgment. The agent should:

1. Immediately call `autoskill_quick` MCP tool
2. Pass relevant context: `skills_used`, `task_context`, and optionally `skill_hint` if user provided text after `/autoskill`

## Important: Skill Creation Flow

When creating skills via `/autoskill`:
- Use `create_skill` MCP tool directly - it will automatically install to the personal skills library
- `create_skill` internally runs `npx skills add` which:
  - Copies skill to `~/.autoskills/personal-skills/` (the library)
  - Configures all detected agent applications (Windsurf, Cursor, etc.)
- **Do NOT** manually create directories or call `npx skills add` - this is handled automatically

## Command Patterns

### Pattern 1: `/autoskill [description]`
**Purpose**: Create a new skill directly from the provided description

**Action**:
- Call `autoskill_quick` with `skill_hint` = user's description text
- Use `create_skill` tool to create the skill (it auto-installs via npx skills add)
- Do NOT ask for confirmation - proceed directly

**Example**:
```
User: /autoskill Create a Python script to scrape web pages with BeautifulSoup
Agent: Calls autoskill_quick(skill_hint="Create a Python script to scrape web pages with BeautifulSoup")
        Then uses create_skill with appropriate fields
```

### Pattern 2: `/autoskill` (no additional text, skills were used)
**Purpose**: Improve the skills that were used in the current task

**Action**:
- Call `autoskill_quick` with `skills_used` = list of skill names used
- Include `task_context` describing what was done
- If `skill_execution_smooth` was false, directly improve the skills using `update_skill`
- If execution was smooth, ask if user wants to improve anyway

**Example**:
```
User: /autoskill
Agent: Calls autoskill_quick(skills_used=["web-scraper"], task_context="Scraped product data from e-commerce site")
        Then uses update_skill to improve the skill
```

### Pattern 3: `/autoskill` (no additional text, no skills used)
**Purpose**: Auto-create a new skill from the current task context

**Action**:
- Call `autoskill_quick` with `task_context` describing the completed task
- Use `create_skill` to create a skill (it auto-installs via npx skills add)
- Do NOT ask for confirmation - proceed directly

**Example**:
```
User: /autoskill
Agent: Calls autoskill_quick(task_context="Set up a React project with TypeScript, ESLint, and Prettier")
        Then uses create_skill with auto-generated fields
```

## Implementation Flow

1. **Detect** `/autoskill` command in user input
2. **Parse** the command:
   - Extract text after `/autoskill` → `skill_hint`
   - Check what skills were used in this conversation → `skills_used`
   - Summarize the current task → `task_context`
3. **Call** `autoskill_quick` tool with parsed parameters
4. **Act** based on the response:
   - `action: "direct_create"` → Immediately call `create_skill` (auto-installs)
   - `action: "direct_improve"` → Immediately call `update_skill`
   - `action: "suggest_improve"` → Ask user, then call `update_skill` if confirmed
   - `action: "auto_create"` → Immediately call `create_skill` (auto-installs)

## Important Rules

- **Do NOT ask for confirmation** when `skill_hint` is provided - create immediately
- **Do NOT ask for confirmation** when auto-creating from context (Pattern 3)
- **DO ask for confirmation** only when skills executed smoothly (Pattern 2 with `suggest_improve`)
- `create_skill` automatically handles installation via `npx skills add` - do NOT manually run it
- Always include the `guide` field from the response to help craft high-quality skills
- Generate meaningful `name`, `description`, `title`, `when_to_use`, and `instructions` fields

## Skill Naming

Generate skill names that are:
- Lowercase with hyphens
- Descriptive but concise
- Based on the task/pattern

Examples:
- `python-web-scraping` for web scraping tasks
- `react-ts-setup` for React + TypeScript setup
- `docker-compose-setup` for Docker configurations
