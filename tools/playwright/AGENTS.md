# Playwright Tool Guide

## Purpose

Use this tool to inspect page DOM, capture screenshots, and debug browser-rendered content.

## Commands

- Bootstrap and self-test: `npm run bootstrap`
- Verify local readiness: `npm run doctor`
- Show help: `npm run help`
- Dump page DOM: `npm run dom -- --url <url>`

## Assumptions

- The default browser engine is Chromium via Playwright.
- Use `npm run bootstrap` before first use on a new machine.
- If local Chrome or Edge should be used, pass `--browser-path`.
- Output files should stay inside this tool directory unless the user asks otherwise.

## Editing Rules

- Keep the CLI script in `scripts/`.
- Add new behavior behind explicit flags.
- Update `README.md` and local OpenSpec artifacts when the CLI contract changes.
