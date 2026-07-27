import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: "pipe", ...options });
  if (result.status !== 0) {
    const detail = result.stderr || result.stdout || `${command} ${args.join(" ")}`;
    throw new Error(detail.trim());
  }
  return result;
}

mkdirSync("tmp", { recursive: true });
run("pnpm", ["pack", "--pack-destination", "tmp"], { cwd: process.cwd() });

const version = JSON.parse(readFileSync("package.json", "utf8")).version;
const tarball = resolve("tmp", `kf-lint-${version}.tgz`);
const pnpmHome = process.env.PNPM_HOME ?? join(homedir(), process.platform === "darwin" ? "Library/pnpm" : ".local/share/pnpm");
const path = `${join(pnpmHome, "bin")}:${process.env.PATH ?? ""}`;

run("pnpm", ["add", "-g", tarball], { env: { ...process.env, PNPM_HOME: pnpmHome, PATH: path } });
const versionResult = run("kf-lint", ["--version"], { env: { ...process.env, PNPM_HOME: pnpmHome, PATH: path } });
process.stdout.write(versionResult.stdout);
