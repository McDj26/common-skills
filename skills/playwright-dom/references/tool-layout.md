# Playwright DOM Tool Reference

## Tool Location

- Repository root: `common-skills`
- Tool directory: `tools/playwright`
- Skill directory: `skills/playwright-dom`

## Install And Run

From the repository root:

```text
cd tools/playwright
npm run bootstrap
npm run dom -- --url https://example.com
```

Health check only:

```text
cd tools/playwright
npm run doctor
```

## Browser Resolution Order

1. Explicit CLI flags such as `--browser-path` or `--browser-channel`
2. Environment variables: `PLAYWRIGHT_BROWSER_PATH`, `BROWSER_PATH`, `CHROME_PATH`, `EDGE_PATH`
3. Playwright-managed browser
4. Common local browser install paths for the current platform

## Bootstrap Notes

- `npm run bootstrap` is the preferred first-run command on a new device.
- Add `-- --install-browser` if neither a local browser nor a Playwright-managed browser is available.
- `npm run doctor` performs the same checks without installing dependencies.

## Cross-platform Notes

- Prefer relative paths inside the tool directory when writing artifacts.
- Do not assume PowerShell-only invocation; shell syntax varies by platform.
- If browser startup fails, retry with an explicit `--browser-path`.
