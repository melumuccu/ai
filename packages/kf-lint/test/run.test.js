import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { loadRecommendedConfig } from "../src/config.js";
import { runEslint } from "../src/eslint/runner.js";
import { runStylelint } from "../src/stylelint/runner.js";
import {
  runCommitLint,
  runDockerLint,
  runMarkdownLint,
  runSkillLint,
} from "../src/rules/runners.js";
import { exitCodeFor } from "../src/diagnostics.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const config = loadRecommendedConfig();

test("phase1 bad css reports deterministic violations", async () => {
  const file = join(ROOT, "fixtures/css/phase1-bad.css");
  const diagnostics = await runStylelint(config, [file]);
  const rules = new Set(diagnostics.map((d) => d.ruleId));
  assert.ok(rules.has("css/no-vw-vh"));
  assert.ok(rules.has("css/no-flex-column"));
  assert.ok(rules.has("css/no-transition-all"));
  assert.ok(rules.has("css/keyframes-dashed-ident"));
});

test("phase1 good css passes", async () => {
  const file = join(ROOT, "fixtures/css/phase1-good.css");
  const diagnostics = await runStylelint(config, [file]);
  assert.equal(diagnostics.length, 0);
});

test("phase1 bad svelte import is blocked", async () => {
  const file = join(ROOT, "fixtures/svelte/phase1-bad/+page.svelte");
  const diagnostics = await runEslint(config, [file]);
  assert.ok(diagnostics.some((d) => d.ruleId === "sveltekit/no-server-import-in-browser"));
});

test("phase1 good svelte import passes", async () => {
  const file = join(ROOT, "fixtures/svelte/phase1-good/+page.svelte");
  const diagnostics = await runEslint(config, [file]);
  assert.equal(diagnostics.filter((d) => d.ruleId.startsWith("sveltekit/")).length, 0);
});

test("skill metadata validation", () => {
  const good = join(ROOT, "fixtures/skill/kf-g-example-skill/SKILL.md");
  const bad = join(ROOT, "fixtures/skill/bad-name/SKILL.md");
  assert.equal(runSkillLint(config, [good]).length, 0);
  assert.ok(runSkillLint(config, [bad]).length > 0);
});

test("docker layer headings", () => {
  const good = join(ROOT, "fixtures/docker/good/Dockerfile");
  const bad = join(ROOT, "fixtures/docker/bad/Dockerfile");
  assert.equal(runDockerLint(config, [good]).length, 0);
  assert.ok(runDockerLint(config, [bad]).length > 0);
});

test("markdown structure warnings", () => {
  const good = join(ROOT, "fixtures/markdown/good.md");
  const bad = join(ROOT, "fixtures/markdown/bad.md");
  const fencedGood = join(ROOT, "fixtures/markdown/fenced-code-block-good.md");
  assert.equal(runMarkdownLint(config, [good]).length, 0);
  assert.equal(runMarkdownLint(config, [fencedGood]).length, 0);
  assert.ok(runMarkdownLint(config, [bad]).length > 0);
});

test("commit message format", () => {
  const goodFix = "fix__: skills_lint導入\n\n- 概要: CLI追加\n- Why: 規約を機械検証\n";
  const goodChore = "chore: deps_依存更新\n\n- 概要: 更新\n- Why: セキュリティ\n";
  const goodStyle = "style: kf-lint_フォーマット\n\n- 概要: 整形\n- Why: 可読性\n";
  const goodCrlf = "fix__: skills_lint導入\r\n\r\n- 概要: CLI追加\n";
  const goodBlankSecondLine = "fix__: skills_lint導入\n \n- 概要: CLI追加\n";
  const badSubject = "fix skills\n\nbody\n";
  const badUnpaddedFix = "fix: skills_lint導入\n\n- 概要: CLI追加\n";
  const badChoreUnderscore = "chore_: deps_依存更新\n\n- 概要: 更新\n";
  const badNoCategory = "chore: 依存更新\n\n- 概要: 更新\n";
  const badNoBlankLine = "fix__: skills_lint導入\n- 概要: CLI追加\n";
  const badSecondLine = "fix__: skills_lint導入\nnot blank\n- 概要: CLI追加\n";

  for (const message of [goodFix, goodChore, goodStyle, goodCrlf, goodBlankSecondLine]) {
    assert.equal(runCommitLint(config, message).length, 0, message);
  }
  for (const message of [
    badSubject,
    badUnpaddedFix,
    badChoreUnderscore,
    badNoCategory,
    badNoBlankLine,
    badSecondLine,
  ]) {
    assert.ok(runCommitLint(config, message).length > 0, message);
  }
});

test("errors produce non-zero exit code", async () => {
  const file = join(ROOT, "fixtures/css/phase1-bad.css");
  const diagnostics = await runStylelint(config, [file]);
  assert.equal(exitCodeFor(diagnostics), 1);
});

test("recommended config includes phase rules", () => {
  const json = readFileSync(join(ROOT, "configs/recommended.json"), "utf8");
  assert.match(json, /css\/no-vw-vh/);
  assert.match(json, /sveltekit\/no-server-import-in-browser/);
  assert.match(json, /commit\/japanese-prefix-format/);
});

test("phase2 css extended rules", async () => {
  const file = join(ROOT, "fixtures/css/phase2-bad.css");
  const diagnostics = await runStylelint(config, [file]);
  const rules = new Set(diagnostics.map((d) => d.ruleId));
  assert.ok(rules.has("css/no-line-height-one"));
  assert.ok(rules.has("css/no-text-justify"));
  assert.ok(rules.has("css/no-adjacent-sibling-margin"));
  assert.ok(rules.has("css/no-legacy-media-range"));
});

test("phase2 legacy svelte syntax", async () => {
  const file = join(ROOT, "fixtures/svelte/phase2-bad/+page.svelte");
  const diagnostics = await runEslint(config, [file]);
  assert.ok(diagnostics.some((d) => d.ruleId === "svelte/no-legacy-syntax"));
});
