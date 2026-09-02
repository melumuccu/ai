/** @typedef {"invocation" | "message-format" | "message-blank-line"} CommitHintKind */

export const ALLOWED_COMMIT_PREFIXES = [
  "feat_",
  "fix__",
  "docs_",
  "style",
  "refa_",
  "perf_",
  "test_",
  "chore",
];

export const COMMIT_MESSAGE_EXAMPLE = `fix__: skills > lint導入

- 概要: CLI追加
- Why: 規約を機械検証`;

const COMMIT_PREFIX_LIST = ALLOWED_COMMIT_PREFIXES.join(", ");

/** @returns {string} */
export function commitMessageFormatHint() {
  return [
    "Example message:",
    COMMIT_MESSAGE_EXAMPLE,
    "",
    `Allowed prefixes (5 chars): ${COMMIT_PREFIX_LIST}`,
    "Line 1: <type_>: <category> > <subject>",
    "Line 2: blank",
    "Body: bullet list with - 概要 and - Why:",
  ].join("\n");
}

/** @returns {string} */
export function commitInvocationHint() {
  return [
    "Write the message under the gitignored artifacts/ directory (e.g. artifacts/git/commit-msg.txt), then run:",
    "  git commit -F artifacts/git/commit-msg.txt",
    "",
    "Do not use heredoc (<<), $(), backticks, or -F -.",
    "",
    commitMessageFormatHint(),
  ].join("\n");
}

/**
 * @param {string} problem
 * @param {string} why
 * @param {string} fix
 * @param {CommitHintKind} hintKind
 */
export function formatCommitDiagnosticMessage(problem, why, fix, hintKind) {
  const hint = hintKind === "message-format" || hintKind === "message-blank-line"
    ? commitMessageFormatHint()
    : commitInvocationHint();
  return `Problem: ${problem} Why: ${why} Fix: ${fix}\n\nHint:\n${hint}`;
}
