---
name: skill-creator
description: Guide for creating effective AI agent skills. Use this skill when creating a new personal skill from a completed task solution. Triggers when the user agrees to create a skill after task review, or explicitly asks to create a new skill.
---

# Skill Creator

This skill guides you through creating effective, reusable AI agent skills.

## Core Principles

1. **Concise is Key**: Only add context the agent doesn't already have. Challenge each piece: "Does this justify its token cost?"
2. **Appropriate Freedom**: Match specificity to task fragility - use guardrails for fragile operations, flexibility for adaptable tasks.
3. **Progressive Disclosure**: Keep SKILL.md lean (<500 lines), split detailed content into references/.

## Skill Structure

```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description)
│   └── Markdown instructions
└── Optional Resources
    ├── scripts/      - Executable code
    ├── references/   - Documentation for context
    └── assets/       - Files for output (templates, etc.)
```

## Creation Workflow

### Step 1: Analyze the Task Solution

Before creating, identify:
- **Core workflow**: What steps solved the problem?
- **Reusable patterns**: What would help in similar tasks?
- **Trigger conditions**: When should this skill activate?

### Step 2: Initialize the Skill

Run the init command to create the template:

```bash
npx skills init <skill-name>
```

This creates a skill directory with SKILL.md template and resource directories.

### Step 3: Write the SKILL.md

#### Frontmatter (Required)

```yaml
---
name: skill-name
description: What the skill does AND when to use it. Include specific triggers.
---
```

**Critical**: The description is the primary trigger mechanism. Include:
- What the skill does
- Specific scenarios that trigger it
- File types or task patterns it handles

#### Body Structure

Choose a structure based on skill type:

**Workflow-Based** (sequential processes):
```markdown
# Skill Title
## Overview
## Workflow Decision Tree
## Step 1: [Action]
## Step 2: [Action]
```

**Task-Based** (tool collections):
```markdown
# Skill Title
## Overview
## Quick Start
## Task: [Operation 1]
## Task: [Operation 2]
```

### Step 4: Add Resources (If Needed)

- **scripts/**: For code that's rewritten repeatedly or needs deterministic reliability
- **references/**: For detailed docs that should load only when needed
- **assets/**: For templates, images, or files used in output

### Step 5: Install the Skill

```bash
npx skills add ./<skill-name> -y
```

This copies the skill to personal-skills and configures all detected agent applications.

## Quality Checklist

Before finishing, verify:

- [ ] Description clearly states WHEN to use the skill
- [ ] Instructions are actionable and specific
- [ ] No redundant explanations (trust agent intelligence)
- [ ] Examples are concrete and realistic
- [ ] Resource files are referenced from SKILL.md
- [ ] Unused resource directories are deleted

## Example: Creating a Skill from Task

**Task completed**: Set up a React project with TypeScript, ESLint, and Tailwind CSS

**Skill creation**:

```yaml
---
name: react-ts-setup
description: Initialize React projects with TypeScript, ESLint, and Tailwind CSS. Use when creating new React applications, setting up frontend projects, or when user asks for React + TypeScript + Tailwind setup.
---
```

```markdown
# React TypeScript Setup

## Overview
Quickly scaffold a React project with TypeScript, ESLint, and Tailwind CSS configured.

## Instructions

1. Create project with Vite:
   ```bash
   npm create vite@latest {project-name} -- --template react-ts
   cd {project-name}
   ```

2. Install Tailwind:
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. Configure tailwind.config.js:
   ```js
   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
   ```

4. Add Tailwind directives to src/index.css:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

5. Install ESLint plugins:
   ```bash
   npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```
```
