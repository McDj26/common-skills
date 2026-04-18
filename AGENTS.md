# Agent Guide

## Repository Purpose

This repository stores reusable tools that can be copied, referenced, or executed from multiple projects.

## Working Rules

- Prefer adding new functionality as a new tool under `tools/` instead of mixing unrelated concerns.
- Keep each tool self-contained, including its own runtime files, docs, and OpenSpec artifacts.
- Avoid introducing cross-tool coupling unless a shared contract is explicitly documented.
- Update the tool-local `README.md` and `openspec` artifacts when behavior changes.
- Review `docs/MAINTENANCE.md` when changing package distribution, catalog entries, or consumer workflow.

## Structure

- Root files describe repository-wide conventions.
- `tools/<tool-name>/` contains everything for one tool.
- Tool-level `AGENTS.md` should document local commands, assumptions, and editing rules.

## Verification

- Run validation commands from the tool directory.
- Prefer small, scriptable CLIs that can be reused by agents and humans.
- Before publishing, run the package and consumer checks described in `docs/MAINTENANCE.md`.
