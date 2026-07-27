import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_NAMES = [
  ".kf-lintrc.json",
  ".kf-lintrc.js",
  "kf-lint.config.json",
  "kf-lint.config.js",
];

/** @typedef {"error" | "warn" | "off"} RuleSeverity */

/**
 * @typedef {Object} KfLintConfig
 * @property {boolean} [extendsRecommended]
 * @property {string[]} [ignore]
 * @property {Record<string, RuleSeverity>} [rules]
 * @property {Record<string, unknown>} [overrides]
 */

/** @returns {KfLintConfig} */
export function loadRecommendedConfig() {
  const path = join(PACKAGE_ROOT, "configs", "recommended.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

/** @param {string} cwd */
export function loadConfig(cwd) {
  for (const name of CONFIG_NAMES) {
    const path = join(cwd, name);
    if (!existsSync(path)) continue;
    const raw = readFileSync(path, "utf8");
    const userConfig = name.endsWith(".js")
      ? import(path).then((m) => m.default)
      : JSON.parse(raw);
    if (userConfig instanceof Promise) {
      throw new Error("Async config loading is not supported in sync path");
    }
    return mergeConfig(loadRecommendedConfig(), userConfig);
  }
  return loadRecommendedConfig();
}

/** @param {KfLintConfig} base @param {KfLintConfig} user */
export function mergeConfig(base, user) {
  return {
    ...base,
    ...user,
    ignore: [...(base.ignore ?? []), ...(user.ignore ?? [])],
    rules: { ...(base.rules ?? {}), ...(user.rules ?? {}) },
  };
}

/** @param {KfLintConfig} config @param {string} ruleId */
export function ruleSeverity(config, ruleId) {
  const severity = config.rules?.[ruleId];
  if (severity === "off") return null;
  return severity ?? "error";
}

/** @param {string} path */
export function inferEngine(path) {
  if (/SKILL\.md$/i.test(path) || path.endsWith(".md")) return "markdown";
  if (/\.svelte$/i.test(path)) return "eslint";
  if (/\.(css|scss)$/i.test(path)) return "stylelint";
  if (/Dockerfile(?:\..*)?$/i.test(path) || path.endsWith(".dockerfile")) return "docker";
  if (/\.(ts|js|mts|cts|mjs|cjs)$/i.test(path)) return "eslint";
  return null;
}

/** @param {string} content */
export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { data: null, body: content };
  return { data: parseYaml(match[1]), body: content.slice(match[0].length) };
}

export { PACKAGE_ROOT };
