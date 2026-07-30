---
name: kf-g-skill-authoring-body-structure-rules
description: Use this skill when authoring or revising SKILL.md body structure in this repository. Apply it when writing positive mandatory procedures, using frontmatter description as the applicability gate, and keeping SKILL.md as a table-of-contents with details in references. Covers universal authoring rules for body structure, separate from skill-creator and naming rules.
---

# skill 本文構成の基本ルール

この skill は、SKILL.md の本文構成と指示の書き方に関する基本ルールを定義する。
命名・配置は `kf-g-skill-naming-creation-organization-rules`、作成手順全般は `skill-creator` を参照する。

## 基本ルール（概要）

1. **肯定形の必須手順**: 指示は着手条件・手順・出力条件を「必ずこうする」形式で書く
1. **description が適用ゲート**: frontmatter `description` で適用可否を制御する
1. **SKILL.md は目次**: 読み進め方と参照目次に徹し、詳細は references へ分離する

## 参照ファイル

- [references/overview.md](references/overview.md) — 着手時: 基本ルールの全体像・適用範囲・他 skill 分担を確認するとき
- [references/positive-instruction-style.md](references/positive-instruction-style.md) — 着手時: 指示文を肯定形の必須手順へ書く・直すとき
- [references/description-as-gate.md](references/description-as-gate.md) — 着手時: description を適用ゲートとして整えるとき
- [references/when-to-use-section.md](references/when-to-use-section.md) — 着手時: 本文「使う場面」の要否・配置を判断するとき
- [references/toc-and-references.md](references/toc-and-references.md) — 着手時: SKILL.md を目次化し詳細を references へ分離するとき

## 最小適用手順

1. [references/overview.md](references/overview.md) で基本ルールと適用範囲を確認する
1. 着手内容に応じて上記参照ファイルの1つ以上を開く
1. 各基本ルールを満たす構成で SKILL.md と references を整える
1. 下記「最終チェック」で完了判定する

## 最終チェック

1. 本文の手順が着手条件・実行手順・出力条件の肯定形になっている
1. 適用条件が frontmatter `description` に記載され、本文は実行手順へ分担されている
1. 「使う場面」がある場合、description の補足（詳細・境界・例）に限定されている
1. SKILL.md が目次・読み進め方中心で、詳細へ Markdown リンクで到達できる
1. references に原則詳細のみ配置され、適用条件は description へ集約されている
