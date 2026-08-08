import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { loadRecommendedConfig } from "../src/config.js";
import {
  RULE_ID,
  cleanRawUrl,
  extractUrlMatches,
  normalizeProbeUrl,
  runUrlReachableLint,
  shouldProbeUrl,
} from "../src/rules/url-reachable.js";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const config = loadRecommendedConfig();

test("shouldProbeUrl excludes non-http schemes and relative paths", () => {
  assert.equal(shouldProbeUrl("mailto:a@b.com"), null);
  assert.equal(shouldProbeUrl("javascript:void(0)"), null);
  assert.equal(shouldProbeUrl("data:text/plain,hi"), null);
  assert.equal(shouldProbeUrl("#section"), null);
  assert.equal(shouldProbeUrl("/relative/path"), null);
  assert.equal(shouldProbeUrl("https://example.com"), "https://example.com");
});

test("cleanRawUrl strips trailing markdown punctuation", () => {
  assert.equal(cleanRawUrl("https://example.com)."), "https://example.com");
});

test("normalizeProbeUrl removes fragment", () => {
  assert.equal(
    normalizeProbeUrl("https://example.com/path#frag"),
    "https://example.com/path",
  );
});

test("extractUrlMatches finds urls in markdown and html", () => {
  const content = [
    "[doc](https://a.example/doc)",
    "bare https://b.example/page",
    '<a href="https://c.example/html">link</a>',
    "```",
    "https://d.example/fenced",
    "```",
  ].join("\n");

  const urls = extractUrlMatches(content).map((m) => cleanRawUrl(m.raw));
  assert.deepEqual(urls, [
    "https://a.example/doc",
    "https://b.example/page",
    "https://c.example/html",
    "https://d.example/fenced",
  ]);
});

test("runUrlReachableLint warns on unreachable urls with mock probe", async () => {
  const dir = mkdtempSync(join(tmpdir(), "kf-lint-url-"));
  const file = join(dir, "bad.md");
  writeFileSync(
    file,
    "# test\n\nhttps://dead.example/unreachable\nhttps://dead.example/unreachable#frag\n",
    "utf8",
  );

  const probe = async (url) => {
    if (url === "https://dead.example/unreachable") {
      return { ok: false, reason: "HTTP 404" };
    }
    return { ok: true };
  };

  const diagnostics = await runUrlReachableLint(config, [file], { probe });
  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].ruleId, RULE_ID);
  assert.equal(diagnostics[0].severity, "warn");
});

test("runUrlReachableLint skips non-content files", async () => {
  const dir = mkdtempSync(join(tmpdir(), "kf-lint-url-ts-"));
  const file = join(dir, "code.ts");
  writeFileSync(file, 'const u = "https://dead.example/unreachable";\n', "utf8");

  const probe = async () => ({ ok: false, reason: "HTTP 404" });
  const diagnostics = await runUrlReachableLint(config, [file], { probe });
  assert.equal(diagnostics.length, 0);
});

test("recommended config includes content/url-reachable as warn", () => {
  assert.equal(config.rules?.[RULE_ID], "warn");
});

test("cli verify emits warn for unreachable url in markdown", () => {
  const dir = mkdtempSync(join(tmpdir(), "kf-lint-cli-url-"));
  const md = join(dir, "dead.md");
  const ts = join(dir, "code.ts");
  const deadUrl = "https://kf-lint-dead-url.invalid/unreachable";
  writeFileSync(md, `${deadUrl}\n`, "utf8");
  writeFileSync(ts, `const u = "${deadUrl}";\n`, "utf8");

  const mdResult = spawnSync("node", [join(ROOT, "bin/kf-lint.js"), "verify", md, "--format", "json"], {
    cwd: dir,
    encoding: "utf8",
  });
  assert.equal(mdResult.status, 0, mdResult.stderr);
  const mdDiagnostics = JSON.parse(mdResult.stdout.trim());
  assert.ok(mdDiagnostics.some((d) => d.ruleId === RULE_ID && d.severity === "warn"));

  const tsResult = spawnSync("node", [join(ROOT, "bin/kf-lint.js"), "verify", ts, "--format", "json"], {
    cwd: dir,
    encoding: "utf8",
  });
  assert.equal(tsResult.status, 0, tsResult.stderr);
  const tsDiagnostics = JSON.parse(tsResult.stdout.trim());
  assert.equal(
    tsDiagnostics.filter((d) => d.ruleId === RULE_ID).length,
    0,
  );
});
