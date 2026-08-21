#!/usr/bin/env node
// 公式ドキュメント: https://github.com/vercel-labs/skills/blob/v1.5.23/src/skills.ts
// `.agents/skills` 配下かつ skills-lock.json に載る skill は add 発見時に捨てられる。
// 配信用コピーをそのパスへ置くと latest CLI で一覧から消えるため、別ディレクトリへ実体を置く。

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cp,
  lstat,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const LOCK_RELATIVE_PATH = "skills-lock.json";
export const MARKETPLACE_RELATIVE_PATH = ".claude-plugin/marketplace.json";
export const SOURCE_SKILLS_RELATIVE_DIR = ".agents/skills";
export const PUBLISH_SKILLS_RELATIVE_DIR = ".agents-external-skills";
export const EXTERNAL_PLUGIN_NAME = "external";
export const EXTERNAL_PLUGIN_SOURCE = "./.agents-external-skills";

/**
 * @typedef {object} SyncOptions
 * @property {string} cwd
 * @property {boolean} apply
 * @property {boolean} stage
 */

/**
 * @param {string} cwd
 * @returns {Promise<string[]>}
 */
export async function readLockSkillNames(cwd) {
  const lockPath = path.join(cwd, LOCK_RELATIVE_PATH);
  const lock = JSON.parse(await readFile(lockPath, "utf8"));
  const skills = lock.skills;
  if (skills === null || typeof skills !== "object" || Array.isArray(skills)) {
    throw new Error(`${LOCK_RELATIVE_PATH} の skills が object ではない`);
  }
  return Object.keys(skills).sort();
}

/**
 * @param {string} cwd
 * @returns {Promise<{ marketplace: object, pluginIndex: number }>}
 */
export async function readMarketplaceExternalPlugin(cwd) {
  const marketplacePath = path.join(cwd, MARKETPLACE_RELATIVE_PATH);
  const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
  if (!Array.isArray(marketplace.plugins)) {
    throw new Error(`${MARKETPLACE_RELATIVE_PATH} の plugins が array ではない`);
  }
  const pluginIndex = marketplace.plugins.findIndex(
    (plugin) => plugin?.name === EXTERNAL_PLUGIN_NAME,
  );
  if (pluginIndex === -1) {
    throw new Error(
      `${MARKETPLACE_RELATIVE_PATH} に name=${EXTERNAL_PLUGIN_NAME} の plugin が無い`,
    );
  }
  return { marketplace, pluginIndex };
}

/**
 * @param {string[]} lockNames
 * @returns {string[]}
 */
export function marketplaceSkillPathsFromLockNames(lockNames) {
  return [...lockNames].sort().map((name) => `./${name}`);
}

/**
 * @param {unknown} skills
 * @returns {string[]}
 */
export function normalizeMarketplaceSkillNames(skills) {
  if (!Array.isArray(skills)) {
    return [];
  }
  return skills
    .filter((entry) => typeof entry === "string")
    .map((entry) => entry.replace(/^\.\//, ""))
    .sort();
}

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
export async function listSkillDirNames(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

/**
 * @param {string} root
 * @returns {Promise<Map<string, string>>}
 */
async function hashTree(root) {
  /** @type {Map<string, string>} */
  const hashes = new Map();
  try {
    await stat(root);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return hashes;
    }
    throw error;
  }

  const walk = async (current) => {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      const rel = path.relative(root, abs).split(path.sep).join("/");
      if (entry.isDirectory()) {
        await walk(abs);
        continue;
      }
      if (entry.isSymbolicLink()) {
        const target = await lstat(abs);
        hashes.set(`${rel}\0symlink`, String(target.size));
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      const bytes = await readFile(abs);
      hashes.set(rel, createHash("sha256").update(bytes).digest("hex"));
    }
  };

  await walk(root);
  return hashes;
}

/**
 * @param {string} left
 * @param {string} right
 * @returns {Promise<boolean>}
 */
export async function dirsHaveSameFiles(left, right) {
  const leftHashes = await hashTree(left);
  const rightHashes = await hashTree(right);
  if (leftHashes.size !== rightHashes.size) {
    return false;
  }
  for (const [key, value] of leftHashes) {
    if (rightHashes.get(key) !== value) {
      return false;
    }
  }
  return true;
}

/**
 * @param {string[]} left
 * @param {string[]} right
 * @returns {boolean}
 */
export function sameStringSet(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((name, index) => name === right[index]);
}

/**
 * @param {string} cwd
 * @param {string[]} lockNames
 * @returns {Promise<string[]>}
 */
export async function collectCheckFailures(cwd, lockNames) {
  const failures = [];
  const publishRoot = path.join(cwd, PUBLISH_SKILLS_RELATIVE_DIR);
  const sourceRoot = path.join(cwd, SOURCE_SKILLS_RELATIVE_DIR);
  const publishNames = await listSkillDirNames(publishRoot);
  const { marketplace, pluginIndex } = await readMarketplaceExternalPlugin(cwd);
  const plugin = marketplace.plugins[pluginIndex];
  const marketplaceNames = normalizeMarketplaceSkillNames(plugin.skills);

  if (plugin.source !== EXTERNAL_PLUGIN_SOURCE) {
    failures.push(
      `${MARKETPLACE_RELATIVE_PATH} の ${EXTERNAL_PLUGIN_NAME}.source が ${EXTERNAL_PLUGIN_SOURCE} ではない`,
    );
  }
  if (!sameStringSet(lockNames, marketplaceNames)) {
    failures.push("skills-lock.json のキーと marketplace の external skills 配列が一致しない");
  }
  if (!sameStringSet(lockNames, publishNames)) {
    failures.push("skills-lock.json のキーと .agents-external-skills 配下が一致しない");
  }

  for (const name of lockNames) {
    const sourceDir = path.join(sourceRoot, name);
    const publishDir = path.join(publishRoot, name);
    try {
      await stat(sourceDir);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        failures.push(`lock キー ${name} の実体が ${SOURCE_SKILLS_RELATIVE_DIR}/${name} に無い`);
        continue;
      }
      throw error;
    }
    if (!(await dirsHaveSameFiles(sourceDir, publishDir))) {
      failures.push(`${name} の B と A のファイル内容が一致しない`);
    }
  }

  return failures;
}

/**
 * @param {string} cwd
 * @param {string[]} lockNames
 * @returns {Promise<void>}
 */
export async function applySync(cwd, lockNames) {
  const publishRoot = path.join(cwd, PUBLISH_SKILLS_RELATIVE_DIR);
  const sourceRoot = path.join(cwd, SOURCE_SKILLS_RELATIVE_DIR);
  await mkdir(publishRoot, { recursive: true });

  for (const name of lockNames) {
    const sourceDir = path.join(sourceRoot, name);
    const publishDir = path.join(publishRoot, name);
    try {
      await stat(sourceDir);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        await rm(publishDir, { recursive: true, force: true });
        continue;
      }
      throw error;
    }
    await rm(publishDir, { recursive: true, force: true });
    await cp(sourceDir, publishDir, { recursive: true });
  }

  const publishNames = await listSkillDirNames(publishRoot);
  const lockNameSet = new Set(lockNames);
  for (const name of publishNames) {
    if (!lockNameSet.has(name)) {
      await rm(path.join(publishRoot, name), { recursive: true, force: true });
    }
  }

  const { marketplace, pluginIndex } = await readMarketplaceExternalPlugin(cwd);
  const plugin = marketplace.plugins[pluginIndex];
  plugin.source = EXTERNAL_PLUGIN_SOURCE;
  plugin.skills = marketplaceSkillPathsFromLockNames(lockNames);
  const marketplacePath = path.join(cwd, MARKETPLACE_RELATIVE_PATH);
  await mkdir(path.dirname(marketplacePath), { recursive: true });
  await writeFile(marketplacePath, `${JSON.stringify(marketplace, null, 2)}\n`, "utf8");
}

/**
 * @param {string} cwd
 * @returns {void}
 */
export function stagePublishArtifacts(cwd) {
  const result = spawnSync(
    "git",
    ["add", "--", PUBLISH_SKILLS_RELATIVE_DIR, MARKETPLACE_RELATIVE_PATH],
    { cwd, stdio: "inherit" },
  );
  if (result.status !== 0) {
    throw new Error("git add に失敗した");
  }
}

/**
 * @param {string[]} argv
 * @returns {{ apply: boolean, check: boolean, stage: boolean }}
 */
export function parseArgs(argv) {
  return {
    apply: argv.includes("--apply"),
    check: argv.includes("--check"),
    stage: argv.includes("--stage"),
  };
}

/**
 * @param {string[]} argv
 * @param {string} [cwd]
 * @returns {Promise<number>}
 */
export async function main(argv = process.argv.slice(2), cwd = process.cwd()) {
  const args = parseArgs(argv);
  if (args.apply === args.check) {
    console.error("usage: node scripts/sync-external-skills.mjs --apply [--stage] | --check");
    return 2;
  }

  const lockNames = await readLockSkillNames(cwd);
  if (args.check) {
    const failures = await collectCheckFailures(cwd, lockNames);
    if (failures.length > 0) {
      for (const failure of failures) {
        console.error(failure);
      }
      return 1;
    }
    return 0;
  }

  await applySync(cwd, lockNames);
  if (args.stage) {
    stagePublishArtifacts(cwd);
  }
  const failures = await collectCheckFailures(cwd, lockNames);
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }
    return 1;
  }
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const code = await main();
  process.exit(code);
}
