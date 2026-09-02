import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { resolveSeverity } from "../diagnostics.js";
import { parseFrontmatter } from "../config.js";
import { formatCommitDiagnosticMessage } from "./commit-hints.js";

/** 許可された commit prefix（コロン前5文字固定）。 */
const ALLOWED_COMMIT_PREFIXES = [
  "feat_",
  "fix__",
  "docs_",
  "style",
  "refa_",
  "perf_",
  "test_",
  "chore",
];

const COMMIT_SUBJECT_PATTERN = new RegExp(
  `^(${ALLOWED_COMMIT_PREFIXES.join("|")}):\\s\\S+ > \\S+`,
);

/** @param {string} cwd */
function loadExternalSkillNames(cwd) {
  const lockPath = join(cwd, "skills-lock.json");
  if (!existsSync(lockPath)) return new Set();
  try {
    const lock = JSON.parse(readFileSync(lockPath, "utf8"));
    return new Set(Object.keys(lock.skills ?? {}));
  } catch {
    return new Set();
  }
}

/** @param {import("../config.js").KfLintConfig} config @param {string[]} files */
export function runMarkdownLint(config, files) {
  /** @type {import("../diagnostics.js").Diagnostic[]} */
  const diagnostics = [];

  for (const filePath of files) {
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    if (resolveSeverity("markdown/no-numbered-heading", config, "warn")) {
      let inCodeBlock = false;
      lines.forEach((line, index) => {
        if (/^```/.test(line.trim())) {
          inCodeBlock = !inCodeBlock;
          return;
        }
        if (inCodeBlock) return;
        // 見出しに項番を付けると Markdown 構造と手順番号が混在し、目次・アンカー運用が崩れやすい。
        if (/^#{1,6}\s+\d+\.\s/.test(line)) {
          diagnostics.push({
            ruleId: "markdown/no-numbered-heading",
            message:
              "Problem: heading uses numeric prefix like '# 1.'. Why: mixing Markdown structure with procedure numbering destabilizes TOC and anchors. Fix: remove heading prefix; use an ordered list for sequence.",
            severity: resolveSeverity("markdown/no-numbered-heading", config, "warn") ?? "warn",
            filePath,
            line: index + 1,
            engine: "markdownlint",
          });
        }
      });
    }

    if (resolveSeverity("markdown/ordered-list-one", config, "warn")) {
      let inCodeBlock = false;
      lines.forEach((line, index) => {
        if (/^```/.test(line.trim())) {
          inCodeBlock = !inCodeBlock;
          return;
        }
        if (inCodeBlock) return;
        const match = line.match(/^(\s*)\d+\.\s+/);
        if (!match) return;
        if (match[0].trim() === "1.") return;
        // ソース上 1. 統一にすると項目追加・並替時の diff が小さく、レビューしやすい。
        diagnostics.push({
          ruleId: "markdown/ordered-list-one",
          message:
            "Problem: ordered list source uses explicit numbers such as 2./3. Why: using 1. for every item keeps diffs small when items are inserted/reordered. Fix: write every source item as 1.; renderer supplies numbering.",
          severity: resolveSeverity("markdown/ordered-list-one", config, "warn") ?? "warn",
          filePath,
          line: index + 1,
          engine: "markdownlint",
        });
      });
    }
  }

  return diagnostics;
}

/** @param {import("../config.js").KfLintConfig} config @param {string[]} files @param {string} [cwd] */
export function runSkillLint(config, files, cwd = process.cwd()) {
  /** @type {import("../diagnostics.js").Diagnostic[]} */
  const diagnostics = [];
  const externalSkills = loadExternalSkillNames(cwd);

  for (const filePath of files) {
    if (!filePath.endsWith("SKILL.md")) continue;
    const content = readFileSync(filePath, "utf8");
    const { data } = parseFrontmatter(content);
    const dirName = filePath.split("/").slice(-2, -1)[0] ?? "";
    const isExternal = externalSkills.has(dirName);

    if (resolveSeverity("skill/frontmatter-required", config)) {
      if (!data || typeof data !== "object") {
        diagnostics.push({
          ruleId: "skill/frontmatter-required",
          message:
            "Problem: SKILL.md has no YAML frontmatter. Why: name and description metadata enable machine discovery and triggering. Fix: add YAML frontmatter with name and description keys.",
          severity: resolveSeverity("skill/frontmatter-required", config) ?? "error",
          filePath,
          line: 1,
          engine: "skill",
        });
        continue;
      }
      for (const key of ["name", "description"]) {
        if (!data[key]) {
          diagnostics.push({
            ruleId: "skill/frontmatter-required",
            message: `Problem: frontmatter is missing '${key}'. Why: name and description metadata enable machine discovery and triggering. Fix: add the '${key}' key to YAML frontmatter.`,
            severity: resolveSeverity("skill/frontmatter-required", config) ?? "error",
            filePath,
            line: 1,
            engine: "skill",
          });
        }
      }
    }

    const name = typeof data?.name === "string" ? data.name : "";
    if (name && resolveSeverity("skill/name-kebab-case", config)) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
        diagnostics.push({
          ruleId: "skill/name-kebab-case",
          message:
            "Problem: skill name is not valid kebab-case ASCII. Why: consistent naming keeps path and skill list resolution predictable. Fix: rename to lowercase ASCII kebab-case.",
          severity: resolveSeverity("skill/name-kebab-case", config) ?? "error",
          filePath,
          line: 1,
          engine: "skill",
        });
      }
    }

    if (name && dirName && resolveSeverity("skill/name-directory-match", config) && !isExternal) {
      if (name !== dirName) {
        diagnostics.push({
          ruleId: "skill/name-directory-match",
          message: `Problem: frontmatter name '${name}' does not match directory '${dirName}'. Why: mismatched names break path and metadata resolution. Fix: set frontmatter name to '${dirName}'.`,
          severity: resolveSeverity("skill/name-directory-match", config) ?? "error",
          filePath,
          line: 1,
          engine: "skill",
        });
      }
    }

    if (name && resolveSeverity("skill/name-prefix", config) && !isExternal) {
      // repo-local skill は kf-g-/kf-pj- prefix で一覧上の主題領域を揃える。
      if (!/^kf-g-/.test(name) && !/^kf-pj-/.test(name)) {
        diagnostics.push({
          ruleId: "skill/name-prefix",
          message:
            "Problem: skill name lacks repo-local prefix kf-g- or kf-pj-. Why: prefix groups skills in listings by domain. Fix: use kf-g- for melumuccu/ai and kf-pj- elsewhere; do not retroactively enforce this convention on existing external skill names.",
          severity: resolveSeverity("skill/name-prefix", config) ?? "error",
          filePath,
          line: 1,
          engine: "skill",
        });
      }
    }
  }

  return diagnostics;
}

/** @param {import("../config.js").KfLintConfig} config @param {string} message */
export function runCommitLint(config, message) {
  /** @type {import("../diagnostics.js").Diagnostic[]} */
  const diagnostics = [];
  const severity = resolveSeverity("commit/japanese-prefix-format", config);
  if (!severity) return diagnostics;

  const lines = message
    .trimEnd()
    .split("\n")
    .map((line) => line.replace(/\r$/, ""));
  const subject = lines[0] ?? "";

  // commit 形式を固定すると prefix 選定と subject 分類を機械的に追跡できる。
  if (!COMMIT_SUBJECT_PATTERN.test(subject)) {
    diagnostics.push({
      ruleId: "commit/japanese-prefix-format",
      message: formatCommitDiagnosticMessage(
        "commit subject does not match required format",
        "fixed prefix and category enable machine tracking",
        "use '<type_>: <category> > <subject>' on line 1 (e.g. fix__: skills > lint導入)",
        "message-format",
      ),
      severity,
      filePath: "COMMIT_EDITMSG",
      line: 1,
      engine: "commitlint",
    });
  }

  if (lines.length > 1 && lines[1].trim() !== "") {
    // 2行目空行は subject と本文を分離し、git log --oneline 表示を安定させる。
    diagnostics.push({
      ruleId: "commit/japanese-prefix-format",
      message: formatCommitDiagnosticMessage(
        "second commit message line is not blank",
        "blank line separates subject from body and stabilizes git log output",
        "leave line 2 empty",
        "message-blank-line",
      ),
      severity,
      filePath: "COMMIT_EDITMSG",
      line: 2,
      engine: "commitlint",
    });
  }

  return diagnostics;
}

/** @param {import("../config.js").KfLintConfig} config @param {string[]} files */
export function runDockerLint(config, files) {
  /** @type {import("../diagnostics.js").Diagnostic[]} */
  const diagnostics = [];
  const severity = resolveSeverity("docker/layer-heading", config, "warn");
  if (!severity) return diagnostics;

  for (const filePath of files) {
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      if (!/^FROM\s/i.test(line.trim())) return;
      const prev = lines[index - 1]?.trim() ?? "";
      const prev2 = lines[index - 2]?.trim() ?? "";
      const prev3 = lines[index - 3]?.trim() ?? "";
      const hasHeading =
        prev3 === "#============================" &&
        /^#\s.+\sLayer$/.test(prev2) &&
        prev === "#============================";
      if (!hasHeading) {
        // stage ごとの見出しがあると multi-stage Dockerfile の build graph を追いやすい。
        diagnostics.push({
          ruleId: "docker/layer-heading",
          message:
            "Problem: FROM has no preceding layer heading block. Why: headings make multi-stage build graphs easier to trace. Fix: insert a 3-line block: '#============================', '# <Role> Layer', '#============================'.",
          severity,
          filePath,
          line: index + 1,
          engine: "docker",
        });
      }
    });
  }

  return diagnostics;
}
