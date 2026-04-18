import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import {
  getBrowserPathFromEnv,
  getFallbackBrowserPath,
} from "./browser-resolution.mjs";

const HELP_TEXT = `
Playwright DOM inspection tool

Usage:
  node ./scripts/dom-dump.mjs --url <url> [options]

Options:
  --url <url>                    Page URL to open. Required.
  --selector <css>               Optional CSS selector to inspect.
  --mode <full|outerHTML|text|json>
                                 Output mode. Default: full.
  --wait-until <state>           Playwright waitUntil state. Default: networkidle.
  --wait-for-selector <css>      Wait for a selector after navigation.
  --timeout <ms>                 Timeout in milliseconds. Default: 30000.
  --headless <true|false>        Run browser headless. Default: true.
  --browser-path <path>          Use a local Chrome or Edge executable.
  --browser-channel <channel>    Use a branded browser channel such as chrome or msedge.
  --output <path>                Write output to a file.
  --screenshot <path>            Save a screenshot after the page is ready.
  --help                         Show this help.
`;

function parseArgs(argv) {
  const args = {
    mode: "full",
    waitUntil: "networkidle",
    timeout: 30_000,
    headless: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === "--help") {
      args.help = true;
      continue;
    }

    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const value = argv[i + 1];

    if (value == null || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    i += 1;

    switch (key) {
      case "url":
        args.url = value;
        break;
      case "selector":
        args.selector = value;
        break;
      case "mode":
        args.mode = value;
        break;
      case "wait-until":
        args.waitUntil = value;
        break;
      case "wait-for-selector":
        args.waitForSelector = value;
        break;
      case "timeout":
        args.timeout = Number.parseInt(value, 10);
        break;
      case "headless":
        args.headless = value !== "false";
        break;
      case "browser-path":
        args.browserPath = value;
        break;
      case "browser-channel":
        args.browserChannel = value;
        break;
      case "output":
        args.output = value;
        break;
      case "screenshot":
        args.screenshot = value;
        break;
      default:
        throw new Error(`Unknown option: --${key}`);
    }
  }

  return args;
}

function ensureParentDir(filePath) {
  const parentDir = path.dirname(filePath);
  fs.mkdirSync(parentDir, { recursive: true });
}

function serializeElementData(data) {
  return JSON.stringify(data, null, 2);
}

async function launchBrowser(args) {
  const executablePath = args.browserPath ?? getBrowserPathFromEnv();

  try {
    return await chromium.launch({
      headless: args.headless,
      executablePath,
      channel: args.browserChannel,
    });
  } catch (error) {
    if (args.browserPath || executablePath || args.browserChannel) {
      throw error;
    }

    const fallbackBrowserPath = getFallbackBrowserPath();
    if (!fallbackBrowserPath) {
      throw error;
    }

    return chromium.launch({
      headless: args.headless,
      executablePath: fallbackBrowserPath,
    });
  }
}

async function collectOutput(page, args) {
  if (!args.selector) {
    return page.content();
  }

  const locator = page.locator(args.selector).first();
  await locator.waitFor({ state: "visible", timeout: args.timeout });

  switch (args.mode) {
    case "full":
    case "outerHTML":
      return locator.evaluate((element) => element.outerHTML);
    case "text":
      return locator.textContent();
    case "json":
      return locator.evaluate((element) => {
        const attrs = {};
        for (const attr of element.attributes) {
          attrs[attr.name] = attr.value;
        }
        return {
          tagName: element.tagName,
          id: element.id || null,
          className: element.className || null,
          textContent: element.textContent,
          attributes: attrs,
          outerHTML: element.outerHTML,
        };
      }).then(serializeElementData);
    default:
      throw new Error(`Unsupported mode: ${args.mode}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    process.stdout.write(HELP_TEXT.trimStart());
    process.stdout.write("\n");
    process.exit(0);
  }

  if (!args.url) {
    process.stdout.write(HELP_TEXT.trimStart());
    process.stdout.write("\n");
    process.exit(1);
  }

  if (!Number.isFinite(args.timeout) || args.timeout <= 0) {
    throw new Error("Timeout must be a positive integer.");
  }

  const browser = await launchBrowser(args);

  try {
    const page = await browser.newPage();
    await page.goto(args.url, {
      waitUntil: args.waitUntil,
      timeout: args.timeout,
    });

    if (args.waitForSelector) {
      await page.waitForSelector(args.waitForSelector, {
        timeout: args.timeout,
      });
    }

    const output = await collectOutput(page, args);

    if (args.screenshot) {
      ensureParentDir(args.screenshot);
      await page.screenshot({
        path: args.screenshot,
        fullPage: true,
      });
    }

    if (args.output) {
      ensureParentDir(args.output);
      fs.writeFileSync(args.output, output ?? "", "utf8");
    } else {
      process.stdout.write(output ?? "");
      process.stdout.write("\n");
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
