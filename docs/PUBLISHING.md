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

## Publish

Authenticate with npm, then run:

```bash
npm publish --access public
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

