# Consumer Setup

Use this guide when another repository wants to consume `@e.yen/common-skills`.

## Install The Package

From the target repository root:

```bash
npm install --save-dev @e.yen/common-skills
```

## Install Skills Into The Repository

Choose one of the following:

```bash
npx eyen-skills init
```

or:

```bash
npx eyen-skills install playwright-dom
```

This creates:

```text
<target>/
  .codex/
    skills/
      playwright-dom/
  .eyen-skills/
    manifest.json
    tools/
      playwright/
```

## Prepare The Installed Tool

For the Playwright tool:

```bash
cd .eyen-skills/tools/playwright
npm run bootstrap
```

## Use The Installed Skill

- Ask the agent to use `$playwright-dom`
- The installed skill points to the local tool copy under `.eyen-skills/tools/playwright`

## Update Installed Skills

After upgrading the package version in the target repository:

```bash
npx eyen-skills update
```

## Inspect Current State

```bash
npx eyen-skills status
```

## Notes

- Prefer `npx eyen-skills ...` for local devDependency installs.
- The current CLI does not yet provide a `remove` command.
- Tool dependencies are installed inside the target repository, not in the package source repository.

