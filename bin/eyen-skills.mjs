#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const HELP_TEXT = `
eyen-skills

Usage:
  eyen-skills list
  eyen-skills init [--target <dir>]
  eyen-skills install <skill...> [--target <dir>]
  eyen-skills update [skill...] [--target <dir>]
  eyen-skills status [--target <dir>]
  eyen-skills --help

Behavior:
  - Installs skills into <target>/.codex/skills
  - Installs shared tools into <target>/.eyen-skills/tools
  - Tracks installed state in <target>/.eyen-skills/manifest.json
`;

const scriptPath = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(scriptPath), "..");
const catalogPath = path.join(packageRoot, "catalog", "skills.json");
const packageInfo = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

function parseArgs(argv) {
  const args = {
    command: undefined,
    positionals: [],
    target: process.cwd(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }
    if (token === "--target") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --target");
      }
      args.target = path.resolve(value);
      index += 1;
      continue;
    }
    if (!args.command) {
      args.command = token;
      continue;
    }
    args.positionals.push(token);
  }

  return args;
}

function log(message = "") {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeDir(dirPath) {
  fs.rmSync(dirPath, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 200,
  });
}

function copyDir(source, destination, filter) {
  fs.cpSync(source, destination, {
    recursive: true,
    filter: filter ?? (() => true),
  });
}

function readManifest(targetRoot) {
  const manifestPath = path.join(targetRoot, ".eyen-skills", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    return {
      packageName: packageInfo.name,
      packageVersion: packageInfo.version,
      installedSkills: [],
      installedTools: [],
    };
  }

  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function writeManifest(targetRoot, manifest) {
  const manifestDir = path.join(targetRoot, ".eyen-skills");
  ensureDir(manifestDir);
  const nextManifest = {
    ...manifest,
    packageName: packageInfo.name,
    packageVersion: packageInfo.version,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(manifestDir, "manifest.json"), JSON.stringify(nextManifest, null, 2));
}

function getSkillDefinition(skillName) {
  return catalog.skills.find((skill) => skill.name === skillName);
}

function getToolDefinition(toolName) {
  return catalog.tools.find((tool) => tool.name === toolName);
}

function ensureKnownSkills(skillNames) {
  for (const skillName of skillNames) {
    if (!getSkillDefinition(skillName)) {
      throw new Error(`Unknown skill: ${skillName}`);
    }
  }
}

function transformSkillContent(filePath, targetRoot, content) {
  const repoRelativeToolPath = path.relative(
    path.dirname(filePath),
    path.join(targetRoot, ".eyen-skills", "tools", "playwright"),
  ).replace(/\\/g, "/");

  return content
    .replaceAll("tools/playwright", repoRelativeToolPath)
    .replaceAll("`npm install`", "`npm run bootstrap`");
}

function installTool(targetRoot, toolName) {
  const sourceDir = path.join(packageRoot, "tools", toolName);
  const destinationDir = path.join(targetRoot, ".eyen-skills", "tools", toolName);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Missing tool source: ${sourceDir}`);
  }

  ensureDir(path.dirname(destinationDir));
  ensureDir(destinationDir);
  copyDir(sourceDir, destinationDir, (sourcePath) => {
    const normalized = sourcePath.replace(/\\/g, "/");
    return !normalized.includes("/node_modules");
  });
}

function installSkill(targetRoot, skillName) {
  const sourceDir = path.join(packageRoot, "skills", skillName);
  const destinationDir = path.join(targetRoot, ".codex", "skills", skillName);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Missing skill source: ${sourceDir}`);
  }

  removeDir(destinationDir);
  ensureDir(path.dirname(destinationDir));
  copyDir(sourceDir, destinationDir);

  const filesToRewrite = [
    path.join(destinationDir, "SKILL.md"),
    path.join(destinationDir, "references", "tool-layout.md"),
  ];

  for (const filePath of filesToRewrite) {
    if (!fs.existsSync(filePath)) {
      continue;
    }
    const content = fs.readFileSync(filePath, "utf8");
    fs.writeFileSync(filePath, transformSkillContent(filePath, targetRoot, content), "utf8");
  }
}

function installSkills(targetRoot, skillNames) {
  ensureKnownSkills(skillNames);
  const manifest = readManifest(targetRoot);
  const requiredTools = new Set(manifest.installedTools);

  for (const skillName of skillNames) {
    const skillDef = getSkillDefinition(skillName);
    installSkill(targetRoot, skillName);
    for (const toolName of skillDef.requiredTools) {
      requiredTools.add(toolName);
      installTool(targetRoot, toolName);
    }
  }

  manifest.installedSkills = Array.from(new Set([...manifest.installedSkills, ...skillNames])).sort();
  manifest.installedTools = Array.from(requiredTools).sort();
  writeManifest(targetRoot, manifest);
}

function updateSkills(targetRoot, requestedSkillNames) {
  const manifest = readManifest(targetRoot);
  const skillNames = requestedSkillNames.length > 0 ? requestedSkillNames : manifest.installedSkills;
  if (!skillNames || skillNames.length === 0) {
    throw new Error("No installed skills found for update.");
  }
  installSkills(targetRoot, skillNames);
}

function printAvailableSkills() {
  log(`Package: ${packageInfo.name}@${packageInfo.version}`);
  log("");
  for (const skill of catalog.skills) {
    log(`- ${skill.name}: ${skill.description}`);
  }
}

function printStatus(targetRoot) {
  const manifest = readManifest(targetRoot);
  log(`Target: ${targetRoot}`);
  log(`Package: ${manifest.packageName}@${manifest.packageVersion}`);
  log(`Installed skills: ${manifest.installedSkills.length > 0 ? manifest.installedSkills.join(", ") : "(none)"}`);
  log(`Installed tools: ${manifest.installedTools.length > 0 ? manifest.installedTools.join(", ") : "(none)"}`);
}

async function runInit(targetRoot) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Interactive init requires a TTY. Use 'eyen-skills install <skill...>' instead.");
  }

  log(`Target repository: ${targetRoot}`);
  log("Available skills:");
  catalog.skills.forEach((skill, index) => {
    log(`  ${index + 1}. ${skill.name} - ${skill.description}`);
  });
  log("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await rl.question("Select skills by number or name (comma-separated, or 'all'): ");
    const rawSelection = answer.trim();
    if (!rawSelection) {
      throw new Error("No skills selected.");
    }

    let skillNames;
    if (rawSelection.toLowerCase() === "all") {
      skillNames = catalog.skills.map((skill) => skill.name);
    } else {
      const tokens = rawSelection.split(",").map((item) => item.trim()).filter(Boolean);
      skillNames = tokens.map((token) => {
        const index = Number.parseInt(token, 10);
        if (Number.isInteger(index) && index >= 1 && index <= catalog.skills.length) {
          return catalog.skills[index - 1].name;
        }
        return token;
      });
    }

    installSkills(targetRoot, skillNames);
    log("");
    log(`Installed skills: ${skillNames.join(", ")}`);
    log(`Manifest: ${path.join(targetRoot, ".eyen-skills", "manifest.json")}`);
  } finally {
    rl.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.command) {
    log(HELP_TEXT.trimStart());
    return;
  }

  switch (args.command) {
    case "list":
      printAvailableSkills();
      return;
    case "status":
      printStatus(args.target);
      return;
    case "install":
      if (args.positionals.length === 0) {
        throw new Error("Specify at least one skill name for install.");
      }
      installSkills(args.target, args.positionals);
      log(`Installed skills into ${args.target}`);
      return;
    case "update":
      updateSkills(args.target, args.positionals);
      log(`Updated skills in ${args.target}`);
      return;
    case "init":
      await runInit(args.target);
      return;
    default:
      throw new Error(`Unknown command: ${args.command}`);
  }
}

main().catch((error) => {
  fail(error.message);
});
