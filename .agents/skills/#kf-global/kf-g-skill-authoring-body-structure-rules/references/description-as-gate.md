# description を適用ゲートにする

## 基本方針

skill の適用可否は frontmatter `description` だけで制御する。
エージェントは description を読み、該当タスクなら skill 本体を開く。

## description の記載要件

1. **いつ使うか**: トリガーとなる作業・依頼・文脈を英語で書く
1. **何をカバーするか**: この skill が扱う主題・原則・成果物を英語で書く
1. **1〜2文**: 長文化せず、一覧表示でも意味が取れる長さにする
1. **英語**: frontmatter は英語で統一する（命名 skill と同じ）

## 記載パターン

```
Use this skill when [trigger context]. Apply it when [specific actions covered].
```

例:

```
Use this skill when authoring or revising SKILL.md body structure in this repository.
Apply it when writing positive mandatory procedures, using frontmatter description
as the applicability gate, and keeping SKILL.md as a table-of-contents with details
in references.
```

## 本文での扱い

1. 適用条件は frontmatter `description` に集約する
1. 通常は SKILL.md 本文は目的のあと読み進め方へ進む
1. 条件が複雑で description（1〜2文）に収まらない場合のみ、「使う場面」を補助的に置く（詳細は [when-to-use-section.md](when-to-use-section.md)）
1. 適用判定は description のみとし、本文・references は実行手順と原則詳細へ分担する

## description と本文の役割分担

| 場所 | 役割 |
| --- | --- |
| frontmatter `description` | 適用ゲート（エージェントが skill を選ぶ唯一の基準） |
| SKILL.md「使う場面」（例外時のみ） | description の補足（詳細条件・境界・例） |
| references | 手順・規約・条件表・変換例など実行に必要な詳細 |

## 整備手順

1. トリガーとなる依頼パターンを列挙する
1. 1〜2文の英語 description にまとめる
1. description だけで足りる場合は本文を目的 → 読み進め方へ構成する
1. 補足が必要な場合は description に主要 trigger を残し、「使う場面」は詳細・境界・例に限定する
1. 詳細条件表は references へ分離し、適用判定は description に集約する

## 最終チェック

1. description だけで「いつ開くか」が判断できる
1. 適用判定は description、本文は実行手順へ分担されている
1. references に原則詳細のみ配置され、適用条件は description へ集約されている
