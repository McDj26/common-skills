import fs from "node:fs";
import process from "node:process";

const BROWSER_CANDIDATES = {
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ],
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/microsoft-edge",
    "/usr/bin/microsoft-edge-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ],
};

export function getBrowserPathFromEnv(env = process.env) {
  const candidates = [
    env.PLAYWRIGHT_BROWSER_PATH,
    env.BROWSER_PATH,
    env.CHROME_PATH,
    env.EDGE_PATH,
  ];

  return candidates.find((candidate) => candidate && fs.existsSync(candidate));
}

export function getFallbackBrowserPath(platform = process.platform) {
  const platformCandidates = BROWSER_CANDIDATES[platform];
  if (!platformCandidates) {
    return undefined;
  }

  return platformCandidates.find((candidate) => fs.existsSync(candidate));
}

export function getManagedBrowserPath(playwrightModule) {
  const executablePath = playwrightModule?.chromium?.executablePath?.();
  if (!executablePath) {
    return undefined;
  }

  return fs.existsSync(executablePath) ? executablePath : undefined;
}

