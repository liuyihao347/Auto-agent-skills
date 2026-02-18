<div align="center">

# ⚡ Auto-agent-skills

**为你的 AI Agent 自动构建可复用的个人技能库。**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-8A2BE2)](https://modelcontextprotocol.io/)

*一个 MCP 服务器，用于回顾已完成的任务并帮助 AI Agent 将解决方案打包为可移植、可复用的技能。*

</div>

---

## 工作原理

```
Agent 完成一个任务
        │
        ▼
  Autoskills MCP 回顾解决方案
        │
        ├── 未使用技能 ──► 可复用? ──► 是 ──► 建议创建新技能
        │                              否  ──► 什么都不做
        │
        └── 使用了技能 ──► 效果好吗? ──► 是 ──► 什么都不做
                                           否  ──► 建议改进技能
```

当任务完成后，Agent 会调用 Autoskills 来评估解决方案是否值得打包成可复用的技能。技能以 Markdown 文件形式存储在**个人技能文件夹**中，便于版本控制、分享和跨项目复用。

## ✨ 功能特性

| | 特性 | 描述 |
|---|---|---|
| 🔍 | **自动回顾** | 评估已完成任务中值得封装为技能的模式 |
| 💡 | **智能建议** | 仅在新技能或改进真正有用时才会提示 |
| 📚 | **个人技能库** | 维护一个用户创建、可更新的专用技能文件夹 |
| 🤖 | **多 Agent 支持** | 支持 Windsurf、Cursor、Claude Code、Kilo Code 及任何 MCP 兼容的 Agent |
| 📦 | **便携性** | 技能是纯 Markdown — 可同步、分享或开源 |
| 🛠️ | **内置指南** | 包含 skill-creator 和 skill-updater 指南，帮助 Agent 制作高质量技能 |
| ⚡ | **快捷命令** | `/autoskill` — 跳过 Agent 判断，直接创建或改进技能 |

## 🚀 快速开始

### 1. 安装

```bash
git clone https://github.com/YOUR_USERNAME/Autoskills.git
cd Autoskills
npm install
npm run build
```

### CLI 命令

```bash
# 在 personal-skills 库中创建新技能模板
npx autoskill init <skill-name>

# 添加技能（复制到 personal-skills，创建软链接到 .agents/skills）
npx autoskill add <path> -y

# 列出所有个人技能
npx autoskill list
```

### 2. 配置你的 Agent

将 Autoskills MCP 服务器添加到你的 Agent 配置中：

<details>
<summary><b>Windsurf</b></summary>

编辑 `~/.codeium/windsurf/mcp_config.json`：

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

编辑 `~/.cursor/mcp.json`：

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

编辑 `~/.claude/claude_desktop_config.json`：

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

通过 Kilo Code 的 MCP 设置界面添加，或编辑其配置：

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

> 💡 **`AUTOSKILLS_DIR`** 环境变量可覆盖默认技能位置（`~/.autoskills/personal-skills`）。

### 3. 开始使用

完成任务后，Agent 调用 Autoskills MCP 工具：

| 工具 | 描述 |
|:-----|:------------|
| `review_task` | 回顾已完成任务 — 建议创建或改进技能 |
| `autoskill_quick` | **快捷命令** — 跳过 Agent 判断，直接创建或改进技能 |
| `create_skill` | 从解决方案创建新的个人技能 |
| `update_skill` | 改进现有的个人技能 |
| `list_skills` | 列出所有个人技能 |
| `get_skill` | 读取特定技能的完整内容 |
| `delete_skill` | 删除个人技能 |

## ⚡ 快捷命令：`/autoskill`

`/autoskill` 命令让你**跳过 Agent 的上下文判断**，直接触发技能创建或改进。

### 使用模式

| 模式 | 描述 | 示例 |
|---------|-------------|---------|
| `/autoskill [描述]` | 根据你的描述直接创建技能 | `/autoskill 创建一个带重试逻辑的 Python 网页爬虫` |
| `/autoskill`（使用了技能） | 改进当前任务中使用的技能 | 使用 `web-scraper` 技能后，输入 `/autoskill` 来改进它 |
| `/autoskill`（未使用技能） | 从当前任务上下文自动创建技能 | 完成任务后，输入 `/autoskill` 将其打包为技能 |

### 工作原理

1. **`/autoskill [描述]`** — Agent 根据你的描述立即创建新技能，无需确认。

2. **`/autoskill` + 使用了技能** — 如果对话中使用了技能，Agent 会改进它们。如果执行有问题，自动进行改进；如果执行顺利，Agent 会询问是否仍然要改进。

3. **`/autoskill` + 未使用技能** — Agent 自动将当前任务上下文打包成新的可复用技能。

## 🛠️ 内置技能指南

当 `review_task` 或 `autoskill_quick` 建议创建或改进技能时，它会自动包含指南：

- **skill-creator**：创建高效、可复用技能的指南
- **skill-updater**：根据执行反馈改进技能的指南
- **autoskill-handler**：Agent 处理 `/autoskill` 快捷命令的指南

## 个人技能库

```bash
npx autoskill init <skill-name>    # 在 personal-skills 中创建新技能模板
npx autoskill add <path> -y        # 添加技能（复制到 personal-skills，创建软链接）
npx autoskill list                 # 列出所有个人技能
```

### 技能链接机制

添加新技能时：
1. **复制**到 `~/.autoskills/personal-skills/<skill-name>/`（真实来源）
2. **软链接**到 `~/.agents/skills/<skill-name>/`（供 Agent 发现）

对于现有技能（改进），仅更新源文件 — 软链接自动指向改进后的版本。

## 📚 个人技能库结构

技能采用简单、可移植的结构：

```
~/.autoskills/personal-skills/
├── web-scraping-with-playwright/
│   └── SKILL.md
├── docker-compose-setup/
│   └── SKILL.md
└── react-ts-setup/
    ├── SKILL.md
    ├── scripts/
    ├── references/
    └── assets/
```

**Agent 技能目录**（软链接）：

```
~/.agents/skills/  (或 AGENTS_SKILLS_DIR)
├── web-scraping-with-playwright -> ~/.autoskills/personal-skills/web-scraping-with-playwright
├── docker-compose-setup -> ~/.autoskills/personal-skills/docker-compose-setup
└── react-ts-setup -> ~/.autoskills/personal-skills/react-ts-setup
```

每个 `SKILL.md` 包含：

```markdown
---
name: skill-name
description: 用于匹配和触发的简短描述
---

# 技能标题

## 何时使用
触发条件和适用场景。

## 指令
Agent 遵循的逐步工作流程。
```

### 内置技能指南

当 `review_task` 建议创建或改进技能时，Autoskills 通过内置技能自动提供指南：

| 指南 | 用途 |
|:------|:--------|
| **skill-creator** | 引导 Agent 创建结构良好、有效的技能 |
| **skill-updater** | 引导 Agent 诊断问题并应用有针对性的改进 |

## 🧭 设计理念

- **内置 vs 个人** — 内置技能保持冻结；只有个人技能被创建和更新
- **用户掌控** — Agent 在创建或修改技能之前总是会询问
- **最小噪音** — 如果技能运行良好，不会触发提示；仅在真正有价值时才出现建议

## 📄 许可证

[MIT](./LICENSE)
