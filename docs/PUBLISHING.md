# Publishing

Use this guide to publish `@e.yen/common-skills`.

## Pre-publish Checklist

- Confirm `package.json` version is correct.
- Confirm `catalog/skills.json` matches the shipped skills and tools.
- Confirm root `README.md` and tool/skill docs reflect the current CLI behavior.
- Run a local CLI smoke test:

```bash
node ./bin/eyen-skills.mjs list
```

- Run a consumer-install smoke test in a temporary directory:

```bash
node ./bin/eyen-skills.mjs install playwright-dom --target <temp-dir>
cd <temp-dir>/.eyen-skills/tools/playwright
npm run bootstrap
```

## First Release

For the first package release, publish manually from a trusted local machine. This creates the npm package entry so Trusted Publishing can be configured afterward.

```bash
npm publish --access public
```

## GitHub Actions Release Flow

After the first manual publish, this repository is configured for tag-driven npm publishing with npm Trusted Publishing.

### npm package configuration

After `0.1.0` is published manually, configure Trusted Publishing in the npm package settings:

- Provider: `GitHub Actions`
- Owner/User: `McDj26`
- Repository: `common-skills`
- Workflow file: `publish.yml`

### Workflows

- `.github/workflows/release-check.yml`
  Runs on `main` pushes and pull requests. It verifies the CLI entrypoint and runs `npm pack --json`.
- `.github/workflows/publish.yml`
  Runs on tag pushes matching `v*`. It verifies the package and publishes it to npm through Trusted Publishing.

### First release sequence

1. Keep `package.json` at `0.1.0`
2. Publish `0.1.0` manually with `npm publish --access public`
3. Configure Trusted Publishing in the npm package settings

### Subsequent release steps

1. Update `package.json` version
2. Commit the version bump
3. Create a tag such as `v0.1.1`
4. Push `main` and the tag

Example:

```bash
git add package.json
git commit -m "chore: release v0.1.1"
git tag v0.1.1
git push origin main --tags
```

## Upgrade Consumer Repositories

In the consuming repository:

```bash
npm install --save-dev @e.yen/common-skills@latest
npx eyen-skills update
```

## Notes

- The package `files` allowlist controls what gets published.
- Installed tools are copied into the consumer repository by `eyen-skills`; they are not executed directly from `node_modules`.
- When adding new skills, update both the `skills/` directory and `catalog/skills.json`.
