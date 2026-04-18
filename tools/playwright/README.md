# Playwright Tool

Browser automation helper focused on DOM inspection, page debugging, and lightweight page interaction.

## Capabilities

- Open a page in Chromium, Chrome, or Edge.
- Wait for page load and optional selectors.
- Dump the full runtime DOM as HTML.
- Dump a target node's `outerHTML`, text, or attributes.
- Save screenshots for debugging.

## Requirements

- Node.js 20 or newer recommended.
- Prefer `npm run bootstrap` in this directory instead of manual setup.
- Playwright's managed Chromium works by default after dependency install.
- A local browser is also supported through `--browser-path`.
- The CLI can also use `--browser-channel chrome|msedge` or environment variables `PLAYWRIGHT_BROWSER_PATH`, `BROWSER_PATH`, `CHROME_PATH`, or `EDGE_PATH`.
- If Playwright's managed browser is unavailable, the CLI automatically falls back to common Chrome, Edge, and Chromium install paths on Windows, macOS, and Linux.

## Quick Start

```powershell
cd tools/playwright
npm run bootstrap
npm run help
```

Dump the full page DOM:

```powershell
npm run dom -- --url https://example.com
```

Dump one element:

```powershell
npm run dom -- --url https://example.com --selector "h1" --mode outerHTML
```

Use local Chrome:

```powershell
npm run dom -- --url https://example.com --browser-path "C:\Program Files\Google\Chrome\Application\chrome.exe"
```

Use a branded browser channel:

```powershell
npm run dom -- --url https://example.com --browser-channel chrome
```

Save output to files:

```powershell
npm run dom -- --url https://example.com --output .\artifacts\page.html --screenshot .\artifacts\page.png
```

Verify the local environment without changing dependencies:

```powershell
npm run doctor
```

`npm run doctor` still runs the built-in browser self-test. It only avoids dependency installation or browser download.

Install a Playwright-managed Chromium browser if no local browser is available:

```powershell
npm run bootstrap -- --install-browser
```

## Notes

- The tool captures the runtime DOM after scripts execute.
- When a page requires login or custom waits, pass `--wait-for-selector`.
- `npm run bootstrap` is the preferred cross-platform setup entrypoint.
- Tool requirements and behavior are tracked in the local `openspec` directory.
