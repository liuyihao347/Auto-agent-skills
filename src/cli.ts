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

interface AgentConfig {
  name: string;
  configPath: string;
  skillsKey: string;
  format: "json" | "jsonc";
}

function getAgentConfigs(): AgentConfig[] {
  const home = os.homedir();
  const configs: AgentConfig[] = [];

  // Windsurf
  const windsurfPath = path.join(home, ".codeium", "windsurf", "mcp_settings.json");
  if (fs.existsSync(windsurfPath)) {
    configs.push({ name: "Windsurf", configPath: windsurfPath, skillsKey: "skills", format: "json" });
  }

  // Cursor
  const cursorPath = path.join(home, ".cursor", "mcp.json");
  if (fs.existsSync(cursorPath)) {
    configs.push({ name: "Cursor", configPath: cursorPath, skillsKey: "skills", format: "json" });
  }

  // Claude Desktop (Windows)
  const claudeWinPath = path.join(home, "AppData", "Roaming", "Claude", "claude_desktop_config.json");
  if (fs.existsSync(claudeWinPath)) {
    configs.push({ name: "Claude Desktop", configPath: claudeWinPath, skillsKey: "skills", format: "json" });
  }

  // Claude Desktop (macOS)
  const claudeMacPath = path.join(home, "Library", "Application Support", "Claude", "claude_desktop_config.json");
  if (fs.existsSync(claudeMacPath)) {
    configs.push({ name: "Claude Desktop", configPath: claudeMacPath, skillsKey: "skills", format: "json" });
  }

  // VS Code / Kilo Code
  const vscodePaths = [
    path.join(home, ".vscode", "mcp.json"),
    path.join(home, "AppData", "Roaming", "Code", "User", "globalStorage", "anthropic.claude-code", "settings.json"),
  ];
  for (const p of vscodePaths) {
    if (fs.existsSync(p)) {
      configs.push({ name: "VS Code/Kilo", configPath: p, skillsKey: "skills", format: "json" });
    }
  }

  return configs;
}

function titleCase(name: string): string {
  return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function initSkill(skillName: string, targetPath?: string): void {
  const outputDir = targetPath || process.cwd();
  const skillDir = path.join(outputDir, skillName);

  if (fs.existsSync(skillDir)) {
    console.error(`❌ Error: Skill directory already exists: ${skillDir}`);
    process.exit(1);
  }

  // Create skill directory
  fs.mkdirSync(skillDir, { recursive: true });
  console.log(`✅ Created skill directory: ${skillDir}`);

  // Create SKILL.md
  const content = SKILL_TEMPLATE
    .replace(/{skill_name}/g, skillName)
    .replace(/{skill_title}/g, titleCase(skillName));
  
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), content, "utf-8");
  console.log("✅ Created SKILL.md");

  // Create optional resource directories
  fs.mkdirSync(path.join(skillDir, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(skillDir, "references"), { recursive: true });
  fs.mkdirSync(path.join(skillDir, "assets"), { recursive: true });
  console.log("✅ Created resource directories (scripts/, references/, assets/)");

  console.log(`\n✅ Skill "${skillName}" initialized at ${skillDir}`);
  console.log("\nNext steps:");
  console.log("1. Edit SKILL.md to complete the TODO items");
  console.log("2. Delete unused resource directories");
  console.log(`3. Run: npx skills add ${skillDir} -y`);
}

function addSkill(skillPath: string, autoConfirm: boolean): void {
  const resolvedPath = path.resolve(skillPath);
  const skillMdPath = path.join(resolvedPath, "SKILL.md");

  if (!fs.existsSync(skillMdPath)) {
    console.error(`❌ Error: SKILL.md not found at ${skillMdPath}`);
    process.exit(1);
  }

  // Parse skill name from SKILL.md
  const content = fs.readFileSync(skillMdPath, "utf-8");
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  const skillName = nameMatch ? nameMatch[1].trim() : path.basename(resolvedPath);

  // Get default skills directory
  const defaultSkillsDir = process.env.AUTOSKILLS_DIR || path.join(os.homedir(), ".autoskills", "personal-skills");
  
  // Ensure skills directory exists
  if (!fs.existsSync(defaultSkillsDir)) {
    fs.mkdirSync(defaultSkillsDir, { recursive: true });
  }

  const targetDir = path.join(defaultSkillsDir, skillName);

  // Copy skill to personal-skills directory
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

  // Configure agent applications
  const agents = getAgentConfigs();
  
  if (agents.length === 0) {
    console.log("\n⚠️  No agent configuration files found.");
    console.log("Skill has been added to personal-skills directory.");
    console.log(`Location: ${targetDir}`);
    return;
  }

  console.log(`\n📦 Configuring skill for ${agents.length} agent(s)...`);

  for (const agent of agents) {
    try {
      configureAgent(agent, skillName, targetDir);
      console.log(`✅ Configured ${agent.name}`);
    } catch (err) {
      console.log(`⚠️  Failed to configure ${agent.name}: ${(err as Error).message}`);
    }
  }

  console.log(`\n✅ Skill "${skillName}" added successfully!`);
  console.log(`Location: ${targetDir}`);
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

function configureAgent(agent: AgentConfig, skillName: string, skillPath: string): void {
  let config: Record<string, unknown> = {};
  
  if (fs.existsSync(agent.configPath)) {
    const content = fs.readFileSync(agent.configPath, "utf-8");
    try {
      // Remove comments for JSONC
      const jsonContent = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      config = JSON.parse(jsonContent);
    } catch {
      config = {};
    }
  }

  // Ensure skills array exists
  if (!Array.isArray(config[agent.skillsKey])) {
    config[agent.skillsKey] = [];
  }

  const skills = config[agent.skillsKey] as Array<{ name: string; path: string }>;
  
  // Check if skill already exists
  const existingIndex = skills.findIndex(s => s.name === skillName);
  if (existingIndex >= 0) {
    skills[existingIndex] = { name: skillName, path: skillPath };
  } else {
    skills.push({ name: skillName, path: skillPath });
  }

  // Write config back
  const dir = path.dirname(agent.configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(agent.configPath, JSON.stringify(config, null, 2), "utf-8");
}

function listSkills(): void {
  const skillsDir = process.env.AUTOSKILLS_DIR || path.join(os.homedir(), ".autoskills", "personal-skills");
  
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
  npx skills <command> [options]

Commands:
  init <name> [--path <dir>]   Create a new skill template
  add <path> [-y]              Add a skill to all agent applications
  list                         List all personal skills
  help                         Show this help message

Examples:
  npx skills init my-skill
  npx skills init my-skill --path ./skills
  npx skills add ./my-skill -y
  npx skills list

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
        console.log("Usage: npx skills init <skill-name> [--path <dir>]");
        process.exit(1);
      }
      const pathIndex = args.indexOf("--path");
      const targetPath = pathIndex >= 0 ? args[pathIndex + 1] : undefined;
      initSkill(skillName, targetPath);
      break;
    }
    case "add": {
      const skillPath = args[1];
      if (!skillPath) {
        console.error("❌ Error: Skill path is required");
        console.log("Usage: npx skills add <path> [-y]");
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
