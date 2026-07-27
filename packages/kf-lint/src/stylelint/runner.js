import postcss from "postcss";
import safeParser from "postcss-safe-parser";
import { readFileSync } from "node:fs";
import { resolveSeverity } from "../diagnostics.js";

/** @typedef {{ id: string, test: (ctx: RuleContext) => boolean, message: string, defaultSeverity?: "error" | "warn", skillRef?: string }} CssRule */

/** @typedef {{ content: string, filePath: string, root: import('postcss').Root, config: import('../config.js').KfLintConfig }} RuleContext */

/** @type {CssRule[]} */
const CSS_RULES = [
  {
    id: "css/no-vw-vh",
    // vw/vh は Safari/Firefox で scrollbar 幅など挙動差が残る。100vw 系は多くの場合不要なコードスメル。
    message:
      "Problem: vw/vh units used. Why: Safari/Firefox differ on scrollbar width; 100vw patterns are often unnecessary. Fix: use svi/svb or intrinsic layout.",
    test: ({ root }) => {
      let found = false;
      root.walkDecls((decl) => {
        if (/\b\d+(?:\.\d+)?(?:vw|vh)\b/i.test(decl.value)) found = true;
      });
      return found;
    },
  },
  {
    id: "css/no-flex-column",
    // 縦積みを flex column にすると将来の行列化・開始位置調整・空白設計が窮屈になりやすい。
    message:
      "Problem: flex-direction: column used. Why: vertical flex stacking makes future row/column layout, alignment, and spacing harder. Fix: use display: grid with gap.",
    test: ({ root }) => {
      let found = false;
      root.walkDecls((decl) => {
        if (decl.prop === "flex-direction" && /\bcolumn\b/i.test(decl.value)) found = true;
      });
      return found;
    },
  },
  {
    id: "css/no-transition-all",
    // all 指定は関係ないプロパティまで transition 対象にし、意図しない動きと性能劣化を招く。
    message:
      "Problem: transition-property: all used. Why: transitions unrelated properties, causing unintended motion and performance cost. Fix: list explicit properties (e.g. opacity, transform).",
    test: ({ root }) => {
      let found = false;
      root.walkDecls((decl) => {
        if (decl.prop === "transition-property" && /\ball\b/.test(decl.value)) found = true;
      });
      return found;
    },
  },
  {
    id: "css/keyframes-dashed-ident",
    // @keyframes はグローバルスコープのため dashed ident で名前空間を分離する。
    message:
      "Problem: @keyframes name lacks -- prefix. Why: @keyframes are global scope; unprefixed names collide across components. Fix: use dashed ident starting with -- (e.g. --fade-in).",
    test: ({ root }) => {
      let found = false;
      root.walkAtRules("keyframes", (atRule) => {
        if (!/^--/.test(atRule.params.trim())) found = true;
      });
      return found;
    },
  },
  {
    id: "css/no-unnamed-container",
    // 名前なし container は再利用コンポーネント内で参照先が特定できず、条件の衝突を招きやすい。
    message:
      "Problem: unnamed @container (...) used. Why: unnamed containers cannot be targeted in reusable components; query conditions may collide. Fix: use named container --name.",
    test: ({ root }) => {
      let found = false;
      root.walkAtRules("container", (atRule) => {
        const params = atRule.params.trim();
        if (/^\(/.test(params) && !/^--/.test(params)) found = true;
      });
      return found;
    },
  },
  {
    id: "css/container-name-prefix",
    // container 名は dashed ident（-- 始まり）で CSS カスタムプロパティ命名と揃える。
    message:
      "Problem: container name lacks -- prefix. Why: unprefixed names do not align with dashed-ident custom property naming. Fix: prefix container name with -- (e.g. --sidebar).",
    test: ({ root }) => {
      let found = false;
      root.walkDecls((decl) => {
        if (decl.prop !== "container" && decl.prop !== "container-name") return;
        const names = decl.value.match(/(?:^|\s)(--[\w-]+|[\w-]+)/g) ?? [];
        for (const name of names) {
          const trimmed = name.trim();
          if (/^[\w-]+$/.test(trimmed) && !trimmed.startsWith("--")) found = true;
        }
      });
      return found;
    },
  },
  {
    id: "css/no-var-in-query-condition",
    // @media/@container 条件内 var() は評価タイミングが不定で、閾値の意図が読み取りにくくなる。
    message:
      "Problem: var() used in @media/@container condition. Why: evaluation timing is unclear; threshold intent is hard to read. Fix: use literal query conditions (e.g. (width >= 768px)).",
    test: ({ root }) => {
      let found = false;
      root.walkAtRules((atRule) => {
        if (atRule.name !== "media" && atRule.name !== "container") return;
        if (/var\s*\(/.test(atRule.params)) found = true;
      });
      return found;
    },
  },
  {
    id: "css/no-legacy-media-range",
    // min-width/max-width プレフィックス構文は range 構文より意図が読み取りにくい。
    message:
      "Problem: legacy min-width/max-width media syntax used. Why: prefix syntax is harder to read than range syntax. Fix: use range syntax (e.g. (width >= 768px)).",
    test: ({ root }) => {
      let found = false;
      root.walkAtRules("media", (atRule) => {
        if (/\b(min-width|max-width|min-height|max-height)\s*:/.test(atRule.params)) found = true;
      });
      return found;
    },
  },
  {
    id: "css/no-sp-pc-only-class",
    // sp/tablet/pc 起点の切り替えクラスはデバイス分類を CSS に持ち込み、再利用を壊す。
    message:
      "Problem: .sp-only/.pc-only classes used. Why: device-class toggles embed viewport assumptions and break reuse. Fix: use content-based layout (container queries, intrinsic sizing).",
    test: ({ root }) => {
      let found = false;
      root.walkRules((rule) => {
        if (/\.(?:sp-only|pc-only)\b/.test(rule.selector)) found = true;
      });
      return found;
    },
  },
  {
    id: "css/no-grid-empty-dot",
    // 空セルは . だと視覚配置の空白と実セルの区別が読み取りにくい。
    message:
      "Problem: empty grid cell uses . Why: . is ambiguous between visual placement and real cells. Fix: use ... for empty cells.",
    test: ({ root }) => {
      let found = false;
      root.walkDecls((decl) => {
        if (!decl.prop.startsWith("grid-template")) return;
        if (/(?:^|\s)\.(?:\s|$)/m.test(decl.value)) found = true;
      });
      return found;
    },
  },
  {
    id: "css/no-adjacent-sibling-margin",
    // 規則的な子要素間隔は sibling margin よりコンテナ gap の責務に寄せた方が崩れにくい。
    message:
      "Problem: adjacent sibling margin spacing used. Why: sibling margins are fragile for regular child spacing. Fix: use gap on the container (grid or flex).",
    test: ({ root }) => {
      let found = false;
      root.walkRules((rule) => {
        if (!/\+\s*\*/.test(rule.selector)) return;
        rule.walkDecls((decl) => {
          if (/^margin/.test(decl.prop)) found = true;
        });
      });
      return found;
    },
  },
  {
    id: "css/no-line-height-one",
    // line-height: 1 はハーフレディングを消し、和文本文の可読性を損ねやすい。
    message:
      "Problem: line-height: 1 used. Why: removes half-leading and hurts Japanese body text readability. Fix: use unitless line-height >= 1.5 (e.g. 1.6).",
    test: ({ root }) => {
      let found = false;
      root.walkDecls((decl) => {
        if (decl.prop === "line-height" && /^1(?:\.0+)?$/.test(decl.value.trim())) found = true;
      });
      return found;
    },
  },
  {
    id: "css/no-text-justify",
    // justify は英語混在時に単語間隔が不自然になり、組版が破綻しやすい。
    message:
      "Problem: text-align: justify used. Why: uneven word spacing when mixed with English; layout breaks easily. Fix: use text-align: start or left.",
    test: ({ root }) => {
      let found = false;
      root.walkDecls((decl) => {
        if (decl.prop === "text-align" && /\bjustify\b/.test(decl.value)) found = true;
      });
      return found;
    },
  },
  {
    id: "css/no-root-font-size-px",
    // :root font-size の px 固定はブラウザ文字拡大を無効化し、見かけだけ rem 化する罠になる。
    message:
      "Problem: :root { font-size: Npx } used. Why: fixed px disables browser text zoom; rem values only look scalable. Fix: use % or rem on :root, or rely on browser default.",
    test: ({ root }) => {
      let found = false;
      root.walkRules((rule) => {
        if (!/:root\b/.test(rule.selector)) return;
        rule.walkDecls((decl) => {
          if (decl.prop === "font-size" && /\d+px\b/.test(decl.value)) found = true;
        });
      });
      return found;
    },
  },
  {
    id: "css/no-root-font-size-625",
    // 62.5% ハックは rem 換算の簡略化目的で、文字拡大と値の意味を壊しやすい。
    message:
      "Problem: :root { font-size: 62.5% } used. Why: rem conversion shortcut breaks text zoom and semantic rem values. Fix: use 100% on :root and rem values without the hack.",
    test: ({ root }) => {
      let found = false;
      root.walkRules((rule) => {
        if (!/:root\b/.test(rule.selector)) return;
        rule.walkDecls((decl) => {
          if (decl.prop === "font-size" && /62\.5%/.test(decl.value)) found = true;
        });
      });
      return found;
    },
  },
  {
    id: "css/no-enabled-hover",
    // タッチ端末に hover が無い、無効ボタンや href 無し anchor で hover が誤作動する。
    message:
      "Problem: bare :hover selector used. Why: touch devices lack hover; disabled buttons and anchors without href trigger falsely. Fix: use :enabled:hover or :any-link:hover.",
    defaultSeverity: "warn",
    test: ({ root }) => {
      let found = false;
      root.walkRules((rule) => {
        if (!/:hover\b/.test(rule.selector)) return;
        if (/:enabled:hover|:any-link:hover/.test(rule.selector)) return;
        found = true;
      });
      return found;
    },
  },
  {
    id: "css/no-functional-animation-duration",
    // 高頻度 UI では 300ms 超の機能的 animation が体感負荷を増やす。
    message:
      "Problem: functional animation/transition duration over 300ms. Why: long durations on high-frequency UI increase perceived load. Fix: keep duration <= 300ms or reduce motion scope.",
    defaultSeverity: "warn",
    test: ({ root }) => {
      let found = false;
      root.walkDecls((decl) => {
        if (!/(?:animation|transition)-duration/.test(decl.prop)) return;
        const match = decl.value.match(/(\d+(?:\.\d+)?)(ms|s)/);
        if (!match) return;
        const ms = match[2] === "s" ? Number(match[1]) * 1000 : Number(match[1]);
        if (ms > 300) found = true;
      });
      return found;
    },
  },
];

/** @param {import("../config.js").KfLintConfig} config @param {string[]} files */
export async function runStylelint(config, files) {
  /** @type {import("../diagnostics.js").Diagnostic[]} */
  const diagnostics = [];

  for (const filePath of files) {
    const content = readFileSync(filePath, "utf8");
    let root;
    try {
      root = postcss.parse(content, { parser: safeParser });
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error);
      diagnostics.push({
        ruleId: "css/parse-error",
        message: `Problem: CSS could not be parsed. Why: invalid CSS prevents reliable rule evaluation. Fix: correct the syntax and rerun the linter. Details: ${details}`,
        severity: "error",
        filePath,
        engine: "stylelint",
      });
      continue;
    }

    for (const rule of CSS_RULES) {
      const severity = resolveSeverity(rule.id, config, rule.defaultSeverity ?? "error");
      if (!severity) continue;
      if (!rule.test({ content, filePath, root, config })) continue;
      diagnostics.push({
        ruleId: rule.id,
        message: rule.message,
        severity,
        filePath,
        engine: "stylelint",
      });
    }
  }

  return diagnostics;
}

export { CSS_RULES };
