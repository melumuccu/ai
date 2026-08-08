import { readFileSync } from "node:fs";
import { resolveSeverity } from "../diagnostics.js";

export const RULE_ID = "content/url-reachable";

const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/gi;

const EXCLUDED_SCHEME = /^(?:mailto|javascript|data):/i;

/** @param {string} raw */
export function cleanRawUrl(raw) {
  return raw.replace(/[.,;:!?)>\]]+$/, "");
}

/** @param {string} raw */
export function shouldProbeUrl(raw) {
  const url = cleanRawUrl(raw);
  if (!url || url.startsWith("#") || EXCLUDED_SCHEME.test(url)) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  return url;
}

/** @param {string} url */
export function normalizeProbeUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.href;
  } catch {
    return null;
  }
}

/** @param {string} content */
export function extractUrlMatches(content) {
  /** @type {{ raw: string; index: number }[]} */
  const matches = [];
  for (const match of content.matchAll(URL_PATTERN)) {
    if (match.index === undefined) continue;
    matches.push({ raw: match[0], index: match.index });
  }
  return matches;
}

/** @param {string} content @param {number} index */
export function lineFromIndex(content, index) {
  return content.slice(0, index).split("\n").length;
}

/**
 * @param {string} url
 * @param {number} [timeoutMs]
 * @returns {Promise<{ ok: true } | { ok: false; reason: string }>}
 */
export async function probeUrl(url, timeoutMs = 3000) {
  const head = await requestStatus(url, "HEAD", timeoutMs);
  if (head.ok) return { ok: true };

  const get = await requestStatus(url, "GET", timeoutMs, { Range: "bytes=0-0" });
  if (get.ok) return { ok: true };

  return { ok: false, reason: get.reason ?? head.reason ?? "unreachable" };
}

/**
 * @param {string} url
 * @param {"HEAD" | "GET"} method
 * @param {number} timeoutMs
 * @param {Record<string, string>} [headers]
 */
async function requestStatus(url, method, timeoutMs, headers) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      headers,
      signal: controller.signal,
      redirect: "follow",
    });
    if (response.status >= 200 && response.status < 300) {
      return { ok: true };
    }
    return { ok: false, reason: `HTTP ${response.status}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("abort")) {
      return { ok: false, reason: "timeout" };
    }
    return { ok: false, reason: message };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {import("../config.js").KfLintConfig} config
 * @param {string[]} files
 * @param {{ probe?: (url: string) => Promise<{ ok: true } | { ok: false; reason: string }> }} [options]
 */
export async function runUrlReachableLint(config, files, options = {}) {
  const severity = resolveSeverity(RULE_ID, config, "warn");
  if (!severity) return [];

  const probe = options.probe ?? probeUrl;
  /** @type {import("../diagnostics.js").Diagnostic[]} */
  const diagnostics = [];

  for (const filePath of files) {
    if (!/\.(?:md|html?)$/i.test(filePath)) continue;

    const content = readFileSync(filePath, "utf8");
    /** @type {Map<string, number>} */
    const seen = new Map();

    for (const { raw, index } of extractUrlMatches(content)) {
      const candidate = shouldProbeUrl(raw);
      if (!candidate) continue;

      const normalized = normalizeProbeUrl(candidate);
      if (!normalized) continue;

      if (seen.has(normalized)) continue;
      seen.set(normalized, index);

      const result = await probe(normalized);
      if (result.ok) continue;

      diagnostics.push({
        ruleId: RULE_ID,
        message: `Problem: URL is not reachable (${result.reason}). Why: broken links reduce document trust and break navigation. Fix: update or remove the URL: ${normalized}`,
        severity,
        filePath,
        line: lineFromIndex(content, index),
        engine: "content",
      });
    }
  }

  return diagnostics;
}
