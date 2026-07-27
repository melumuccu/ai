/**
 * @typedef {Object} Diagnostic
 * @property {string} ruleId
 * @property {string} message
 * @property {"error" | "warn"} severity
 * @property {string} filePath
 * @property {number} [line]
 * @property {number} [column]
 * @property {string} [engine]
 * @property {string} [skillRef]
 */

/** @param {Diagnostic[]} diagnostics */
export function summarize(diagnostics) {
  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.filter((d) => d.severity === "warn").length;
  return { errors, warnings, total: diagnostics.length };
}

/** @param {Diagnostic[]} diagnostics */
export function formatDiagnostics(diagnostics) {
  return diagnostics
    .map((d) => {
      const loc = d.line ? `${d.filePath}:${d.line}${d.column ? `:${d.column}` : ""}` : d.filePath;
      return `${d.severity}  ${loc}  ${d.ruleId}  ${d.message}`;
    })
    .join("\n");
}

/** @param {Diagnostic[]} diagnostics @param {"json" | "pretty"} format */
export function printDiagnostics(diagnostics, format) {
  if (format === "json") {
    console.log(JSON.stringify(diagnostics, null, 2));
    return;
  }
  if (diagnostics.length === 0) {
    console.log("kf-lint: no issues");
    return;
  }
  console.log(formatDiagnostics(diagnostics));
}

/** @param {Diagnostic[]} diagnostics */
export function exitCodeFor(diagnostics) {
  return diagnostics.some((d) => d.severity === "error") ? 1 : 0;
}

/**
 * @param {string} ruleId
 * @param {import("./config.js").KfLintConfig} config
 */
export function isRuleEnabled(ruleId, config) {
  const severity = config.rules?.[ruleId];
  return severity !== "off";
}

/**
 * @param {string} ruleId
 * @param {import("./config.js").KfLintConfig} config
 * @param {"error" | "warn"} [fallback]
 */
export function resolveSeverity(ruleId, config, fallback = "error") {
  const severity = config.rules?.[ruleId];
  if (severity === "off") return null;
  return severity ?? fallback;
}
