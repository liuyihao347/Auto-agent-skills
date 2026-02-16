---
name: skill-updater
description: Guide for improving existing AI agent skills based on execution feedback. Use this skill when a skill didn't execute smoothly, when the user wants to improve a skill after using it, or when iterating on skill quality based on real usage.
---

# Skill Updater

This skill guides you through improving existing skills based on execution feedback and real-world usage.

## When to Update a Skill

Update a skill when:
- Execution wasn't smooth (errors, workarounds needed)
- Instructions were unclear or incomplete
- Edge cases weren't handled
- Better patterns were discovered during use
- User explicitly requests improvements

## Update Workflow

### Step 1: Diagnose the Issue

Analyze what went wrong:

| Issue Type | Symptoms | Solution |
|------------|----------|----------|
| **Missing steps** | Had to improvise mid-task | Add the missing instructions |
| **Unclear instructions** | Misinterpreted what to do | Rewrite with concrete examples |
| **Edge case** | Failed on specific input | Add conditional handling |
| **Outdated info** | Commands/APIs changed | Update to current versions |
| **Over-specified** | Too rigid for variations | Add flexibility guidance |
| **Under-specified** | Too vague, inconsistent results | Add specific constraints |

### Step 2: Locate the Skill

Find the skill file:
```
~/.autoskills/personal-skills/<skill-name>/SKILL.md
```

Or use the MCP tool:
```
get_skill(name: "<skill-name>")
```

### Step 3: Apply Targeted Fixes

**Principle**: Make minimal, focused changes. Don't rewrite the entire skill.

#### For Missing Steps

Add the step in the correct sequence:
```markdown
## Instructions
1. Existing step
2. **NEW: Handle edge case X**
3. Existing step
```

#### For Unclear Instructions

Replace vague guidance with concrete examples:

Before:
```markdown
Configure the settings appropriately.
```

After:
```markdown
Configure settings in config.json:
```json
{
  "timeout": 30000,
  "retries": 3
}
```
```

#### For Edge Cases

Add conditional handling:
```markdown
## Instructions
1. Check input type:
   - **If JSON file**: Parse with `JSON.parse()`
   - **If YAML file**: Use `yaml.safe_load()`
   - **If unknown**: Detect format from content
```

#### For Outdated Information

Update commands/APIs to current versions:
```markdown
<!-- Updated 2024-01: API v2 now requires auth header -->
```

### Step 4: Update Metadata

If the skill's scope changed, update the frontmatter:

```yaml
---
name: skill-name
description: Updated description reflecting new capabilities or triggers
---
```

### Step 5: Verify the Update

After updating, mentally trace through the skill with the original failing scenario:
- Would the new instructions handle it correctly?
- Are there other similar edge cases to consider?

### Step 6: Save the Update

Use the MCP tool to persist changes:
```
update_skill(
  name: "<skill-name>",
  description: "...",  // if changed
  instructions: "..."  // updated content
)
```

## Update Patterns

### Pattern: Add Error Handling

```markdown
## Instructions
1. Run the command:
   ```bash
   npm install package
   ```
   
   **If installation fails**:
   - Check Node.js version: `node --version` (requires v18+)
   - Clear cache: `npm cache clean --force`
   - Try with legacy peer deps: `npm install --legacy-peer-deps`
```

### Pattern: Add Alternatives

```markdown
## Instructions
1. Create the component:
   
   **Option A (Recommended)**: Use the CLI
   ```bash
   npx create-component MyComponent
   ```
   
   **Option B (Manual)**: Create files directly
   - Create `MyComponent.tsx`
   - Create `MyComponent.css`
```

### Pattern: Add Validation

```markdown
## Instructions
1. Before proceeding, verify:
   - [ ] Input file exists and is readable
   - [ ] Output directory has write permissions
   - [ ] Required dependencies are installed

2. If any check fails, report the specific issue before continuing.
```

## Quality Checklist for Updates

- [ ] Fix addresses the root cause, not symptoms
- [ ] Change is minimal and focused
- [ ] No existing functionality broken
- [ ] Edge case is now handled
- [ ] Instructions remain clear and actionable
- [ ] Version/date noted if significant change
