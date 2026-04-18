# common-skills

A shared repository for reusable automation tools and agent-friendly skills.

## Repository Goals

- Keep common tools in one place for reuse across projects.
- Let each tool evolve independently.
- Store documentation and OpenSpec artifacts beside the tool they describe.

## Directory Layout

```text
common-skills/
  AGENTS.md
  skills/
    <skill-name>/
      SKILL.md
      agents/
      references/
  tools/
    <tool-name>/
      AGENTS.md
      README.md
      package.json
      scripts/
      openspec/
```

## Getting Started

If you want to use the shared Playwright DOM tool:

1. `cd tools/playwright`
2. `npm run bootstrap`
3. `npm run help`
4. `npm run dom -- --url https://example.com`

If you want to invoke the same workflow through an agent:

1. Use the skill at `skills/playwright-dom`
2. Ask the agent to use `$playwright-dom`

## Package Usage

This repository can also be consumed as an npm package.

Install it into another repository:

```bash
npm install --save-dev @e.yen/common-skills
```

Then use the CLI:

```bash
npx eyen-skills list
npx eyen-skills init
npx eyen-skills status
```

Installed layout in the target repository:

```text
<target>/
  .codex/
    skills/
      <skill-name>/
  .eyen-skills/
    manifest.json
    tools/
      <tool-name>/
```

Management commands:

- `npx eyen-skills list`: show available skills from the installed package
- `npx eyen-skills init`: interactive skill selection
- `npx eyen-skills install <skill...>`: install specific skills
- `npx eyen-skills update`: refresh installed skills from the current package version
- `npx eyen-skills status`: show installed skills and tools for the current repository

Example consumer flow:

```bash
npm install --save-dev @e.yen/common-skills
npx eyen-skills init
cd .eyen-skills/tools/playwright
npm run bootstrap
```

Additional guides:

- [Consumer Setup](./docs/CONSUMER_SETUP.md)
- [Maintenance](./docs/MAINTENANCE.md)
- [Publishing](./docs/PUBLISHING.md)

## Tool Conventions

- Every tool lives in `tools/<tool-name>`.
- Every tool maintains its own `openspec` directory.
- Tool-specific scripts, examples, and runtime dependencies stay inside the tool directory.
- Shared conventions are documented in the root `AGENTS.md`.

## Current Tools

- `playwright`: Browser automation and DOM inspection helpers.

## Skills

- `skills/playwright-dom`: Agent skill for invoking the shared Playwright DOM tool consistently across devices and platforms.

## Adding a New Tool

1. Create `tools/<tool-name>`.
2. Add a tool-level `README.md` and `AGENTS.md`.
3. Initialize the tool runtime files such as `package.json` and scripts.
4. Add `openspec/config.yaml`.
5. Record new capabilities under `openspec/changes/<change-name>/`.
