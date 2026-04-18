import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  getBrowserPathFromEnv,
  getFallbackBrowserPath,
  getManagedBrowserPath,
} from "./browser-resolution.mjs";

const HELP_TEXT = `
Playwright bootstrap

Usage:
  node ./scripts/bootstrap.mjs [options]

Options:
  --verify-only                 Skip dependency installation and only run checks.
  --install-browser             Install Playwright Chromium if no browser is available.
  --skip-self-test              Skip the DOM self-test.
  --help                        Show this help.
`;

function parseArgs(argv) {
  const args = {
    verifyOnly: false,
    installBrowser: false,
    skipSelfTest: false,
  };

  for (const token of argv) {
    switch (token) {
      case "--verify-only":
        args.verifyOnly = true;
        break;
      case "--install-browser":
        args.installBrowser = true;
        break;
      case "--skip-self-test":
        args.skipSelfTest = true;
        break;
      case "--help":
        args.help = true;
        break;
      default:
        throw new Error(`Unknown option: ${token}`);
    }
  }

  return args;
}

function log(message) {
  process.stdout.write(`${message}\n`);
}

function runCommand(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd,
    stdio: "inherit",
    shell: false,
    env: options.env ?? process.env,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(" ")} failed with exit code ${result.status}.`);
  }
}

function findExecutableOnPath(executableName) {
  const pathEntries = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
  for (const entry of pathEntries) {
    const candidate = path.join(entry, executableName);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return executableName;
}

function getNpmCommand() {
  return process.platform === "win32" ? findExecutableOnPath("npm.cmd") : findExecutableOnPath("npm");
}

function getNodeCommand() {
  return process.execPath;
}

function hasPlaywrightPackage(toolDir) {
  const packagePath = path.join(toolDir, "node_modules", "playwright", "package.json");
  return fs.existsSync(packagePath);
}

function ensureDependencies(toolDir, args) {
  if (hasPlaywrightPackage(toolDir)) {
    log("Dependencies: installed");
    return;
  }

  if (args.verifyOnly) {
    throw new Error("Dependencies are missing. Run npm run bootstrap or npm install in tools/playwright.");
  }

  log("Dependencies: installing with npm install");
  runCommand(getNpmCommand(), ["install"], { cwd: toolDir });
}

async function loadPlaywright(toolDir) {
  const playwrightPackage = path.join(toolDir, "node_modules", "playwright", "index.mjs");
  return import(pathToFileURL(playwrightPackage).href);
}

function resolveBrowser(playwrightModule) {
  const envBrowserPath = getBrowserPathFromEnv();
  if (envBrowserPath) {
    return { type: "env", path: envBrowserPath };
  }

  const managedBrowserPath = getManagedBrowserPath(playwrightModule);
  if (managedBrowserPath) {
    return { type: "managed", path: managedBrowserPath };
  }

  const fallbackBrowserPath = getFallbackBrowserPath();
  if (fallbackBrowserPath) {
    return { type: "fallback", path: fallbackBrowserPath };
  }

  return { type: "none", path: undefined };
}

function ensureBrowser(toolDir, args, browserInfo) {
  if (browserInfo.type !== "none") {
    log(`Browser: ${browserInfo.type}${browserInfo.path ? ` (${browserInfo.path})` : ""}`);
    return browserInfo;
  }

  if (!args.installBrowser) {
    throw new Error(
      "No Playwright-managed or local browser was found. Re-run with --install-browser or set PLAYWRIGHT_BROWSER_PATH.",
    );
  }

  log("Browser: installing Playwright Chromium");
  runCommand(getNpmCommand(), ["exec", "playwright", "install", "chromium"], { cwd: toolDir });
  return { type: "installed", path: undefined };
}

function runSelfTest(toolDir, browserInfo) {
  const domScriptPath = path.join(toolDir, "scripts", "dom-dump.mjs");
  const testArgs = [
    domScriptPath,
    "--url",
    'data:text/html,<html><body><h1 id="title">Bootstrap OK</h1></body></html>',
    "--selector",
    "#title",
    "--mode",
    "text",
  ];

  if (browserInfo.path) {
    testArgs.push("--browser-path", browserInfo.path);
  }

  const result = spawnSync(getNodeCommand(), testArgs, {
    cwd: toolDir,
    shell: false,
    env: process.env,
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const errorText = result.stderr?.trim() || "DOM self-test failed.";
    throw new Error(errorText);
  }

  const output = result.stdout?.trim();
  if (output !== "Bootstrap OK") {
    throw new Error(`Unexpected self-test output: ${output}`);
  }

  log("Self-test: passed");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    log(HELP_TEXT.trimStart());
    return;
  }

  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const toolDir = path.resolve(scriptDir, "..");
  log(`Tool directory: ${toolDir}`);
  log(`Node: ${process.version}`);

  ensureDependencies(toolDir, args);

  const playwrightModule = await loadPlaywright(toolDir);
  const browserInfo = ensureBrowser(toolDir, args, resolveBrowser(playwrightModule));

  if (!args.skipSelfTest) {
    runSelfTest(toolDir, browserInfo);
  } else {
    log("Self-test: skipped");
  }

  log("Bootstrap complete");
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
