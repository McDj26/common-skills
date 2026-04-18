# Maintenance

Use this guide when iterating on `@e.yen/common-skills`.

## Change Types

### Skill-only change

Examples:

- Edit `SKILL.md`
- Update `agents/openai.yaml`
- Update reference files under `skills/<skill-name>/references`

Required updates:

1. Update the files under `skills/<skill-name>/`
2. If install behavior or package-facing metadata changes, update `catalog/skills.json`
3. If consumer usage changes, update `README.md` and `docs/CONSUMER_SETUP.md`

### Tool-only change

Examples:

- Edit scripts under `tools/<tool-name>/scripts`
- Update tool CLI flags
- Change bootstrap or runtime behavior

Required updates:

1. Update the files under `tools/<tool-name>/`
2. Update `tools/<tool-name>/README.md`
3. Update `tools/<tool-name>/AGENTS.md` if workflow or assumptions changed
4. Update the corresponding skill docs if the skill references changed commands or paths
5. Keep `tools/<tool-name>/package-lock.json` in sync if dependencies changed

### Install or distribution change

Examples:

- Add or rename installable skills
- Add or rename required tools
- Change `eyen-skills` install, update, or status behavior
- Change what gets published to npm

Required updates:

1. Update `bin/eyen-skills.mjs`
2. Update `catalog/skills.json`
3. Update `catalog/README.md` if the catalog contract changed
4. Update root `package.json` if published files, metadata, or scripts changed
5. Update `README.md`
6. Update `docs/CONSUMER_SETUP.md`
7. Update `docs/PUBLISHING.md`

## Repository-level Files To Review

When shipping changes, review these root or package-level files:

- `package.json`: package metadata, publish allowlist, CLI bin, scripts
- `README.md`: root entrypoint and package usage
- `AGENTS.md`: repository-wide maintenance rules
- `catalog/skills.json`: installable skill and tool registry
- `catalog/README.md`: catalog maintenance contract
- `docs/CONSUMER_SETUP.md`: consumer onboarding flow
- `docs/PUBLISHING.md`: release workflow
- `.npmignore`: publish exclusions

## Required Update Checklist

Run this checklist before publishing a new version:

1. Confirm the changed skills and tools have updated local docs.
2. Confirm `catalog/skills.json` still matches the installable directories.
3. Confirm `package.json` `files` still matches what should be published.
4. Confirm root docs still describe the current CLI behavior.
5. Bump `package.json` version when preparing a release.
6. Run `node ./bin/eyen-skills.mjs list`.
7. Run `npm pack --json` and inspect the packaged file list.
8. Run a consumer smoke test:

```bash
node ./bin/eyen-skills.mjs install playwright-dom --target <temp-dir>
cd <temp-dir>/.eyen-skills/tools/playwright
npm run bootstrap
```

## Adding A New Skill

1. Create `skills/<skill-name>/`
2. Add or update any required `tools/<tool-name>/`
3. Add the new skill and required tool metadata to `catalog/skills.json`
4. Update consumer-facing docs if the new skill should be discoverable from the root
5. Re-run package and consumer smoke tests

## Release Notes Guidance

When preparing a release, summarize changes by:

- New or changed skills
- New or changed tools
- CLI behavior changes
- Consumer workflow changes
- Packaging or publishing changes

