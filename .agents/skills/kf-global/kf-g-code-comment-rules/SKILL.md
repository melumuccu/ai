---
name: kf-g-code-comment-rules
description: Use this project skill whenever adding, editing, reviewing, or deciding whether to keep source-code comments in this repository. It is the authoritative rule set for code comments, including Why not content, official-doc URL breadcrumbs, and comment placement.
---

# コードコメント規約

この skill は、このリポジトリのコードコメント全般の入口。
詳細は `references/why-not.md` と `references/official-doc-url.md` に分ける。

## 使う場面

- コメントを追加、編集、レビュー、削除判断する時
- コメントを残すか迷う時
- 公式ドキュメント URL の残し方を決める時
- コメントの配置を決める時

## 参照ファイル

- `references/why-not.md`: Why not の基準、判断手順、例
- `references/official-doc-url.md`: 公式ドキュメント URL の扱い、配置ルール、例

## 読み進め方

1. `references/why-not.md` を読む
1. `references/official-doc-url.md` を読む
1. 必要なら周辺コードと関連ドキュメントを読む
1. コメントは Why not と判断根拠だけに絞る

## 最終チェック

- コメントは Why not（別案の却下、単純化・削除不能の理由）を説明しているか
- 採用理由の positive Why をコメントに書いていないか（commit log が担う）
- 参照した公式ドキュメント URL を残しているか
- ファイル全体向けか局所向けかで配置を分けているか
- What（処理内容）や How（実装手順）の説明になっていないか
