<div align="center">

# ⚡ Auto-agent-skills

**Automatically build a reusable personal skills library for your AI agents.**

[中文版](./README_zh.md) | English

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-8A2BE2)](https://modelcontextprotocol.io/)

*An MCP server that reviews completed tasks and helps AI agents package solutions into portable, reusable skills.*

</div>

---

## ✨ Features

| Feature | Description |
|:---|:---|
| **Auto-review** | Evaluates completed tasks for skill-worthy patterns |
| **Smart suggestion** | Only prompts when a new skill or improvement is genuinely useful |
| **Personal skills library** | Maintains a dedicated folder of user-created, updatable skills |
| **Multi-agent support** | Works with Windsurf, Cursor, Claude Code, and any MCP-compatible agent |
| **Quick command** | `/autoskill` — Skip agent judgment and directly create or improve skills |

---

## 🚀 Quick Start

### 1. Install

```bash
git clone https://github.com/YOUR_USERNAME/Autoskills.git
cd Autoskills
npm install
npm run build
```

### 2. Configure your agent

Add the Autoskills MCP server to your agent's config:

<details>
<summary><b>Windsurf</b></summary>

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "autoskills": {
      "command": "node",
      "args": ["<path-to-autoskills>/dist/index.js"]
    }
  }
}
```
</details>

<details>
<summary><b>Cursor</b></summary>

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "autoskills": {
      "command": "node",
      "args": ["<path-to-autoskills>/dist/index.js"]
    }
  }
}
```
</details>

<details>
<summary><b>Claude Desktop</b></summary>

Edit `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "autoskills": {
      "command": "node",
      "args": ["<path-to-autoskills>/dist/index.js"]
    }
  }
}
```
</details>

<details>
<summary><b>Kilo Code</b></summary>

Add via Kilo Code's MCP settings UI, or edit its config:

```json
{
  "mcpServers": {
    "autoskills": {
      "command": "node",
      "args": ["<path-to-autoskills>/dist/index.js"]
    }
  }
}
```
</details>

> 💡 **`AUTOSKILLS_DIR`** env var overrides the default skills location (`~/.autoskills/personal-skills`).

### 3. Start Using It

After completing a task, your agent will automatically call Autoskills to review the solution.

Use the `/autoskill` command to skip review and directly create or improve skills:

| Command | Description | Example |
|:---|:---|:---|
| `/autoskill [description]` | Create skill from description | `/autoskill Create a Python web scraper` |
| `/autoskill` | Improve used skills, or create from context | Just type `/autoskill` |

---

## 📚 Personal Skills Library

Skills are stored as Markdown files in `~/.autoskills/personal-skills/`:

```bash
~/.autoskills/personal-skills/
├── web-scraping/
│   └── SKILL.md
├── docker-setup/
│   └── SKILL.md
└── react-component/
    ├── SKILL.md
    ├── scripts/
    └── references/
```

Each `SKILL.md` contains:

```markdown
---
name: skill-name
description: Short description for matching and triggering
---

# Skill Title

## When to Use
Trigger conditions and applicable scenarios.

## Instructions
Step-by-step workflow for the agent to follow.
```

---

## 🛠️ CLI (Optional)

A small CLI for managing skills without an agent:

```bash
npx autoskill init <skill-name>    # Create a skill template
npx autoskill add <path> -y        # Add skill and create symlink
npx autoskill list                 # List all skills
```

---

## 📄 License

[MIT](./LICENSE)
