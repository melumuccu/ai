# SKILL.md 目次化と references 分離

## 基本方針

SKILL.md は目次・読み進め方・参照リンクに徹する。
詳細ルール、変換例、チェックリストは references/ へ分離する。

## SKILL.md の目安構成

1. frontmatter（`name`, `description`）
1. 短い目的（1〜3文）
1. 原則概要または参照ファイル一覧
1. 読み進め方（番号付き必須手順）
1. 最終チェック（完了判定）

「使う場面」は通常省略する。条件が複雑で description（1〜2文）に収まらない場合のみ、目的のあとに補助的に置く（詳細は [when-to-use-section.md](when-to-use-section.md)）。

## 行数の目安

- SKILL.md 本体: **30〜50行**
- 50行を超える詳細は references へ移す

## references の分離基準

| SKILL.md に残す | references へ移す |
| --- | --- |
| 原則名と一行概要 | 規約の全文、変換例、長い表 |
| 参照ファイル一覧と役割 | 手順の詳細、エッジケース |
| 読み進め方（どの順で読むか） | チェックリストの詳細項目 |

## ファイル命名

1. 主題別に kebab-case で命名する（例: `positive-instruction-style.md`）
1. `overview.md` を全体像の入口にする
1. 適用条件を SKILL.md description へ記載し、references には原則詳細だけを配置する

## リンクと段階的開示

1. SKILL.md から各 reference へ Markdown リンク（相対パス）で接続する
1. 読み進め方で「いつどの reference を開くか」を明示する
1. reference 同士は必要時のみ相互リンクする
1. エージェントは SKILL.md → 必要な reference だけを開く流れを想定する

## 作成手順

1. 基本ルールの概要だけ SKILL.md に書く
1. 詳細を主題別 reference に分割する
1. SKILL.md に参照ファイル一覧（Markdown リンク）と読み進め方を追加する
1. 行数が50行を超える場合、SKILL.md から詳細を references へ移す
1. リンクがすべて到達可能か確認する

## 最終チェック

1. SKILL.md が目次・読み進め方中心になっている
1. 詳細が references へ分離されている
1. 内部 Markdown リンクがすべて有効である
1. references に原則詳細のみ配置され、適用条件は description へ集約されている
