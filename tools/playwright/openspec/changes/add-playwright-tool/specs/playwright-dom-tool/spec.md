# Playwright DOM Tool Specification

## ADDED Requirements

### Requirement: Tool-local ownership

The Playwright tool MUST keep its executable files, documentation, and OpenSpec artifacts inside `tools/playwright`.

#### Scenario: Agent updates Playwright behavior

- **WHEN** an agent changes the Playwright tool
- **THEN** the corresponding documentation and OpenSpec artifacts are updated inside `tools/playwright`
- **AND** the change does not require editing another tool's specification

### Requirement: DOM inspection CLI

The Playwright tool MUST provide a CLI that can open a URL and emit runtime DOM data.

#### Scenario: Dump full page DOM

- **WHEN** the user runs the CLI with `--url <url>` and no selector
- **THEN** the tool navigates to the page
- **AND** emits the page runtime HTML

#### Scenario: Dump a selected node

- **WHEN** the user runs the CLI with `--url <url> --selector <css>`
- **THEN** the tool waits for the selector
- **AND** emits data for the first matched element

### Requirement: File outputs

The Playwright tool MUST support optional artifact output for automation workflows.

#### Scenario: Persist DOM and screenshot artifacts

- **WHEN** the user passes `--output` and `--screenshot`
- **THEN** the tool creates parent directories when needed
- **AND** writes the DOM output and screenshot to the requested paths

### Requirement: Cross-platform browser resolution

The Playwright tool MUST work across major desktop platforms without requiring Windows-only browser discovery.

#### Scenario: Managed browser is unavailable

- **WHEN** the Playwright-managed browser is not installed
- **THEN** the tool may use an explicit browser path or channel when provided
- **AND** otherwise falls back to common local browser install paths for the current platform

### Requirement: Bootstrap entrypoint

The Playwright tool MUST provide a cross-platform bootstrap command for setup and readiness checks.

#### Scenario: New machine setup

- **WHEN** the user runs the bootstrap command in the tool directory
- **THEN** the tool verifies or installs runtime dependencies
- **AND** checks whether a usable browser is available
- **AND** runs a self-test unless the user explicitly skips it
