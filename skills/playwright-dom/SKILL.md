---
name: playwright-dom
description: Inspect runtime DOM, screenshots, and element output for live web pages by using the shared Playwright tool in this repository. Use when Codex needs to debug browser-rendered pages, capture full-page HTML, inspect a specific selector, or run the same DOM workflow across Windows, macOS, and Linux.
---

# Playwright DOM

Use the shared Playwright tool path referenced in this document instead of creating ad hoc browser scripts.

## Quick Start

1. Work from the target repository root that contains the installed skill and tool directories.
2. Use the Playwright tool path shown in this skill.
3. Run `npm run bootstrap` inside that tool directory before first use on a new machine.
4. Run `npm run dom -- --url <url>` for a full DOM dump.

## Workflow

1. Confirm the target page and whether full-page DOM, a selector dump, or a screenshot is needed.
2. Read `tools/playwright/README.md` for the current CLI contract if flags may have changed.
3. Prefer `npm run bootstrap` over ad hoc setup steps when the environment may not be ready.
4. Use `npm run dom -- --url <url>` for full DOM output.
5. Add `--selector <css>` with `--mode outerHTML|text|json` when a single element is needed.
6. Add `--output <path>` and `--screenshot <path>` when artifacts should be persisted.

## Browser Selection

- Prefer the Playwright-managed browser when available.
- Use `--browser-channel chrome` or `--browser-channel msedge` when a branded local browser should be used.
- Use `--browser-path <path>` when the browser location is known or non-standard.
- If no browser flag is given, rely on the tool's built-in fallback logic.

## References

- Read `references/tool-layout.md` for install paths, browser resolution order, and portability notes.
