# Catalog

`catalog/skills.json` is the package-level registry consumed by `eyen-skills`.

## Rules

- Every installable skill must have an entry under `skills`.
- Every referenced tool must have an entry under `tools`.
- `requiredTools` lists the tool directories that should be copied into the target repository when a skill is installed.
- Keep names aligned with directory names under `skills/` and `tools/`.

## Update Workflow

When adding a new skill:

1. Create the skill under `skills/<skill-name>`
2. Create or update any required tool under `tools/<tool-name>`
3. Add the skill and tool metadata to `catalog/skills.json`
4. Verify `node ./bin/eyen-skills.mjs list`

For broader package maintenance, also review `docs/MAINTENANCE.md`.
