#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const SKILL_TEMPLATE = `---
name: {skill_name}
description: [TODO: Complete and informative explanation of what the skill does and when to use it. Include WHEN to use this skill - specific scenarios, file types, or tasks that trigger it.]
---

# {skill_title}

## Overview

[TODO: 1-2 sentences explaining what this skill enables]

## When to Use

[TODO: Describe the specific scenarios, file types, or tasks that should trigger this skill]

## Instructions

[TODO: Step-by-step instructions for the agent to follow]

## Resources (Optional)

This skill can include optional resource directories:

- **scripts/**: Executable code (Python/Bash/etc.) for automation
- **references/**: Documentation to be loaded into context as needed
- **assets/**: Files used in output (templates, images, fonts, etc.)

Delete this section and any unneeded directories when done.
`;

function getSkillsDir(): string {
  return process.env.AUTOSKILLS_DIR || path.join(os.homedir(), ".autoskills", "personal-skills");
}

function getAgentsSkillsDir(): string {
  return process.env.AGENTS_SKILLS_DIR || path.join(os.homedir(), ".agents", "skills");
}

function titleCase(name: string): string {
  return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function initSkill(skillName: string): void {
  const skillsDir = getSkillsDir();
  const skillDir = path.join(skillsDir, skillName);

  if (fs.existsSync(skillDir)) {
    console.error(`❌ Error: Skill directory already exists: ${skillDir}`);
    process.exit(1);
  }

  fs.mkdirSync(skillDir, { recursive: true });
  console.log(`✅ Created skill directory: ${skillDir}`);

  const content = SKILL_TEMPLATE
    .replace(/{skill_name}/g, skillName)
    .replace(/{skill_title}/g, titleCase(skillName));
  
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), content, "utf-8");
  console.log("✅ Created SKILL.md");

  fs.mkdirSync(path.join(skillDir, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(skillDir, "references"), { recursive: true });
  fs.mkdirSync(path.join(skillDir, "assets"), { recursive: true });
  console.log("✅ Created resource directories (scripts/, references/, assets/)");

  console.log(`\n✅ Skill "${skillName}" initialized at ${skillDir}`);
  console.log("\nNext steps:");
  console.log("1. Edit SKILL.md to complete the TODO items");
  console.log("2. Delete unused resource directories");
  console.log(`3. Run: npx autoskill add ${skillDir} -y`);
}

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createSymlink(target: string, linkPath: string): void {
  const linkDir = path.dirname(linkPath);
  if (!fs.existsSync(linkDir)) {
    fs.mkdirSync(linkDir, { recursive: true });
  }

  if (fs.existsSync(linkPath)) {
    fs.rmSync(linkPath, { recursive: true });
  }

  try {
    fs.symlinkSync(target, linkPath, "junction");
    return;
  } catch {
  }

  try {
    fs.symlinkSync(target, linkPath, "dir");
  } catch (err) {
    console.log(`⚠️  Failed to create symlink: ${(err as Error).message}`);
  }
}

function addSkill(skillPath: string, autoConfirm: boolean): void {
  const resolvedPath = path.resolve(skillPath);
  const skillMdPath = path.join(resolvedPath, "SKILL.md");

  if (!fs.existsSync(skillMdPath)) {
    console.error(`❌ Error: SKILL.md not found at ${skillMdPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(skillMdPath, "utf-8");
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  const skillName = nameMatch ? nameMatch[1].trim() : path.basename(resolvedPath);

  const skillsDir = getSkillsDir();
  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
  }

  const targetDir = path.join(skillsDir, skillName);
  const isNewSkill = !fs.existsSync(targetDir);

  if (resolvedPath !== targetDir) {
    if (fs.existsSync(targetDir)) {
      if (!autoConfirm) {
        console.log(`⚠️  Skill "${skillName}" already exists at ${targetDir}`);
        console.log("Use -y flag to overwrite.");
        process.exit(1);
      }
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
    copyDir(resolvedPath, targetDir);
    console.log(`✅ Copied skill to ${targetDir}`);
  }

  if (isNewSkill) {
    const agentsSkillsDir = getAgentsSkillsDir();
    const linkPath = path.join(agentsSkillsDir, skillName);
    createSymlink(targetDir, linkPath);
    console.log(`✅ Created symlink: ${linkPath}`);
  }

  console.log(`\n✅ Skill "${skillName}" added successfully!`);
  console.log(`Location: ${targetDir}`);
}

function listSkills(): void {
  const skillsDir = getSkillsDir();
  
  if (!fs.existsSync(skillsDir)) {
    console.log("No personal skills found.");
    console.log(`Skills directory: ${skillsDir}`);
    return;
  }

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const skills: Array<{ name: string; description: string }> = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMd = path.join(skillsDir, entry.name, "SKILL.md");
    if (!fs.existsSync(skillMd)) continue;

    const content = fs.readFileSync(skillMd, "utf-8");
    const nameMatch = content.match(/^name:\s*(.+)$/m);
    const descMatch = content.match(/^description:\s*(.+)$/m);
    
    skills.push({
      name: nameMatch ? nameMatch[1].trim() : entry.name,
      description: descMatch ? descMatch[1].trim().slice(0, 60) + "..." : "(no description)",
    });
  }

  if (skills.length === 0) {
    console.log("No personal skills found.");
  } else {
    console.log(`\n📚 Personal Skills (${skills.length}):\n`);
    for (const skill of skills) {
      console.log(`  • ${skill.name}`);
      console.log(`    ${skill.description}\n`);
    }
  }
  console.log(`Skills directory: ${skillsDir}`);
}

function showHelp(): void {
  console.log(`
Autoskills CLI - Manage personal AI agent skills

Usage:
  npx autoskills-cli <command> [options]

Commands:
  init <name> [--path <dir>]   Create a new skill template
  add <path> [-y]              Add a skill (copies to personal-skills, creates symlink)
  list                         List all personal skills
  help                         Show this help message

Environment Variables:
  AUTOSKILLS_DIR               Personal skills storage (default: ~/.autoskills/personal-skills)
  AGENTS_SKILLS_DIR            Agent skills symlink directory (default: ~/.agents/skills)

Examples:
  npx autoskills-cli init my-skill
  npx autoskills-cli init my-skill --path ./skills
  npx autoskills-cli add ./my-skill -y
  npx autoskills-cli list

Options:
  -y, --yes    Auto-confirm overwrites
  --path       Specify output directory for init command
`);
}

// Main CLI entry
function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "init": {
      const skillName = args[1];
      if (!skillName) {
        console.error("❌ Error: Skill name is required");
        console.log("Usage: npx autoskill init <skill-name>");
        process.exit(1);
      }
      initSkill(skillName);
      break;
    }
    case "add": {
      const skillPath = args[1];
      if (!skillPath) {
        console.error("❌ Error: Skill path is required");
        console.log("Usage: npx autoskill add <path> [-y]");
        process.exit(1);
      }
      const autoConfirm = args.includes("-y") || args.includes("--yes");
      addSkill(skillPath, autoConfirm);
      break;
    }
    case "list":
      listSkills();
      break;
    case "help":
    case "--help":
    case "-h":
      showHelp();
      break;
    default:
      if (command) {
        console.error(`❌ Unknown command: ${command}`);
      }
      showHelp();
      process.exit(command ? 1 : 0);
  }
}

main();
