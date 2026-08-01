import { existsSync, readFileSync, statSync } from "node:fs";
import { globSync, escape as escapeGlob } from "glob";
import { relative, resolve } from "node:path";
import { loadConfig, inferEngine } from "./config.js";
import { exitCodeFor, printDiagnostics } from "./diagnostics.js";
import { runEslint } from "./eslint/runner.js";
import { runStylelint } from "./stylelint/runner.js";
import {
  runCommitLint,
  runDockerLint,
  runMarkdownLint,
  runSkillLint,
} from "./rules/runners.js";

/** @param {string[]} args */
export async function runCli(args) {
  const command = args[0] ?? "verify";
  const rest = args.slice(1);

  if (command === "--version" || command === "-v") {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    console.log(pkg.version);
    return;
  }

  if (command === "init") {
    await runInit(process.cwd());
    return;
  }

  if (command === "commit-msg") {
    const file = rest[0];
    if (!file || !existsSync(file)) throw new Error("commit-msg requires a message file path");
    const config = loadConfig(process.cwd());
    const message = readFileSync(file, "utf8");
    const diagnostics = runCommitLint(config, message);
    printDiagnostics(diagnostics, "pretty");
    process.exit(exitCodeFor(diagnostics));
  }

  if (command !== "verify" && command !== "lint") {
    throw new Error(`Unknown command: ${command}`);
  }

  const { paths, format } = parseVerifyArgs(rest);
  const cwd = process.cwd();
  const config = loadConfig(cwd);
  const files = collectFiles(cwd, paths, config.ignore ?? []);

  const eslintFiles = files.filter((f) => inferEngine(f) === "eslint");
  const stylelintFiles = files.filter((f) => inferEngine(f) === "stylelint");
  const markdownFiles = files.filter((f) => inferEngine(f) === "markdown");
  const dockerFiles = files.filter((f) => inferEngine(f) === "docker");

  const diagnostics = [
    ...(await runEslint(config, eslintFiles)),
    ...(await runStylelint(config, stylelintFiles)),
    ...runMarkdownLint(config, markdownFiles),
    ...runSkillLint(config, markdownFiles, cwd),
    ...runDockerLint(config, dockerFiles),
  ];

  printDiagnostics(diagnostics, format);
  process.exit(exitCodeFor(diagnostics));
}

/** @param {string[]} args */
function parseVerifyArgs(args) {
  let format = "pretty";
  /** @type {string[]} */
  const paths = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--format" && args[i + 1]) {
      format = args[i + 1] === "json" ? "json" : "pretty";
      i += 1;
      continue;
    }
    paths.push(args[i]);
  }
  return { paths: paths.length > 0 ? paths : ["."], format };
}

/** @param {string} cwd @param {string[]} paths @param {string[]} ignore */
function collectFiles(cwd, paths, ignore) {
  /** @type {Set<string>} */
  const files = new Set();
  for (const input of paths) {
    const target = resolve(cwd, input);
    if (existsSync(target) && !target.includes("*") && statSync(target).isFile()) {
      // Cursor hook などが staged file を個別 path で渡すため、ignore を尊重する
      const matches = globSync(escapeGlob(relative(cwd, target)), {
        cwd,
        absolute: true,
        nodir: true,
        ignore,
      });
      if (matches.length > 0) files.add(matches[0]);
      continue;
    }
    const pattern = existsSync(target) && statSync(target).isDirectory() ? `${input.replace(/\/$/, "")}/**/*` : input;
    const matches = globSync(pattern, {
      cwd,
      absolute: true,
      nodir: true,
      ignore,
    });
    for (const match of matches) files.add(match);
  }
  return [...files];
}

/** @param {string} cwd */
async function runInit(cwd) {
  const { writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const target = join(cwd, ".kf-lintrc.json");
  if (existsSync(target)) {
    console.log(".kf-lintrc.json already exists");
    return;
  }
  writeFileSync(
    target,
    `${JSON.stringify({ extendsRecommended: true }, null, 2)}\n`,
    "utf8",
  );
  console.log("Created .kf-lintrc.json");
}
