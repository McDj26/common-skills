# Design

## Tool Isolation

The Playwright tool lives under `tools/playwright` and owns its runtime dependencies, scripts, docs, and OpenSpec artifacts. This keeps future tools independent and easier to evolve.

## CLI Design

The first CLI entrypoint is `scripts/dom-dump.mjs`. It accepts explicit flags for navigation, waiting, output mode, and file emission. The interface is intentionally narrow so future commands can be added without breaking the initial contract.

A companion bootstrap entrypoint, `scripts/bootstrap.mjs`, prepares the local runtime in a platform-neutral way. It checks dependencies, detects browsers, optionally installs Playwright Chromium, and runs a self-test against a data URL.

## Browser Strategy

The tool uses Playwright's Chromium launcher and supports three browser selection modes: managed Playwright browser, explicit `--browser-path` or environment variable override, and automatic fallback to common local Chrome, Edge, and Chromium install paths across major desktop platforms.
