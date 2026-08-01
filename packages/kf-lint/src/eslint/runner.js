import { readFileSync } from "node:fs";
import eslint from "eslint";
import tsParser from "@typescript-eslint/parser";
import svelteParser from "svelte-eslint-parser";
import sveltePlugin from "eslint-plugin-svelte";

/** @param {import("../config.js").KfLintConfig} config @param {string[]} files */
export async function runEslint(config, files) {
  if (files.length === 0) return [];

  /** @type {import("../diagnostics.js").Diagnostic[]} */
  const diagnostics = [];

  for (const filePath of files) {
    diagnostics.push(...lintSveltekitImports(config, filePath));
    if (filePath.endsWith(".svelte")) {
      diagnostics.push(...lintLegacySvelteSyntax(config, filePath));
    }
  }

  const svelteFiles = files.filter((f) => f.endsWith(".svelte"));
  if (svelteFiles.length > 0 && config.rules?.["svelte/require-each-key"] !== "off") {
    diagnostics.push(...(await lintSvelteEachKey(config, svelteFiles)));
  }

  return diagnostics;
}

/** @param {import("../config.js").KfLintConfig} config @param {string} filePath */
function lintSveltekitImports(config, filePath) {
  /** @type {import("../diagnostics.js").Diagnostic[]} */
  const diagnostics = [];
  const content = readFileSync(filePath, "utf8");
  const imports = [...content.matchAll(/import\s+[^'"]+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const lines = content.split("\n");

  /** @param {string} ruleId @param {string} source @param {string} message */
  const report = (ruleId, source, message) => {
    const severity = config.rules?.[ruleId];
    if (severity === "off") return;
    const line = lines.findIndex((l) => l.includes(source)) + 1;
    diagnostics.push({
      ruleId,
      message,
      severity: severity === "warn" ? "warn" : "error",
      filePath,
      line: line || 1,
      engine: "eslint",
    });
  };

  const isBrowserSurface =
    /\+page\.svelte$/.test(filePath) ||
    /\+layout\.svelte$/.test(filePath) ||
    /\/\$lib\/components\//.test(filePath);
  const isComponent = /\/\$lib\/components\//.test(filePath);
  const isServer = /\/\$lib\/server\//.test(filePath);

  for (const source of imports) {
    if (isBrowserSurface && config.rules?.["sveltekit/no-server-import-in-browser"] !== "off") {
      // browser 面から server-only module を import すると秘密情報や DB 依存が client bundle に漏れる。
      if (/\$lib\/server/.test(source)) {
        report(
          "sveltekit/no-server-import-in-browser",
          source,
          "Problem: browser code imports from $lib/server. Why: server-only modules expose secrets and DB dependencies that leak into the client bundle. Fix: move logic to load/actions or import from a browser-safe $lib module.",
        );
      }
    }
    if (isComponent && config.rules?.["sveltekit/no-route-import-in-components"] !== "off") {
      // shared component が route 固有 code に依存すると、配置先変更で再利用不能になる。
      if (/src\/routes/.test(source) || /\$lib\/components\/.*\/routes/.test(source)) {
        report(
          "sveltekit/no-route-import-in-components",
          source,
          "Problem: shared component imports from src/routes. Why: route-specific code makes the component non-reusable when moved. Fix: extract shared logic into $lib and pass data via props.",
        );
      }
    }
    if (isServer && config.rules?.["sveltekit/no-svelte-import-in-server"] !== "off") {
      // server-only 層が UI component に依存すると、server/client 境界が逆転しテストも困難になる。
      if (/\.svelte$/.test(source)) {
        report(
          "sveltekit/no-svelte-import-in-server",
          source,
          "Problem: $lib/server imports a .svelte component. Why: server-only code depending on UI inverts the server/client boundary and complicates testing. Fix: keep server modules UI-free; render components from client surfaces.",
        );
      }
    }
  }

  return diagnostics;
}

/** @param {import("../config.js").KfLintConfig} config @param {string} filePath */
function lintLegacySvelteSyntax(config, filePath) {
  /** @type {import("../diagnostics.js").Diagnostic[]} */
  const diagnostics = [];
  if (config.rules?.["svelte/no-legacy-syntax"] === "off") return diagnostics;

  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const severity = config.rules?.["svelte/no-legacy-syntax"] === "warn" ? "warn" : "error";
  const checks = [
    {
      pattern: /\bexport\s+let\b/,
      message:
        "Problem: component uses export let. Why: Svelte 5 runes replace legacy props and improve reactivity clarity. Fix: use $props() instead of export let.",
    },
    {
      pattern: /\bon:[a-z-]+=/,
      message:
        "Problem: component uses on:event syntax. Why: Svelte 5 uses native event attributes for clearer DOM binding. Fix: use onclick={...} instead of on:event.",
    },
    {
      pattern: /<slot[\s>]/,
      message:
        "Problem: component uses <slot>. Why: Svelte 5 snippets replace slots with typed, composable content projection. Fix: use snippets instead of <slot>.",
    },
  ];

  lines.forEach((line, index) => {
    for (const check of checks) {
      if (!check.pattern.test(line)) continue;
      diagnostics.push({
        ruleId: "svelte/no-legacy-syntax",
        message: check.message,
        severity,
        filePath,
        line: index + 1,
        engine: "eslint",
      });
    }
  });

  return diagnostics;
}

/** @param {import("../config.js").KfLintConfig} config @param {string[]} files */
async function lintSvelteEachKey(config, files) {
  const severity = config.rules?.["svelte/require-each-key"] === "warn" ? "warn" : "error";
  const engine = new eslint.ESLint({
    overrideConfigFile: true,
    baseConfig: [
      {
        plugins: { svelte: sveltePlugin },
      },
      {
        files: ["**/*.svelte"],
        languageOptions: {
          parser: svelteParser,
          parserOptions: { parser: tsParser },
        },
        plugins: { svelte: sveltePlugin },
        processor: "svelte/svelte",
        rules: {
          "no-inner-declarations": "off",
          "no-self-assign": "off",
          "svelte/comment-directive": "error",
          "svelte/system": "error",
          "svelte/require-each-key": severity,
        },
      },
    ],
  });

  /** @type {import("../diagnostics.js").Diagnostic[]} */
  const diagnostics = [];
  const results = await engine.lintFiles(files);
  for (const result of results) {
    for (const message of result.messages) {
      diagnostics.push({
        ruleId: "svelte/require-each-key",
        message:
          "Problem: {#each} block has no key. Why: missing keys cause incorrect DOM reuse and state bugs when lists change. Fix: add a key expression, e.g. {#each items as item (item.id)}.",
        severity: message.severity === 2 ? "error" : "warn",
        filePath: result.filePath,
        line: message.line,
        column: message.column,
        engine: "eslint",
      });
    }
  }
  return diagnostics;
}
