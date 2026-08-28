---
name: kf-g-agent-review-adversarial-after-primary-response
description: 'Use this skill after finishing design or implementation and after giving the user the primary response. Always apply it then to run adversarial evaluation, and implementation verification or two-stage review as specified, so findings can be used for self-improvement.'
---

# 一次回答後の敵対的検証

設計または実装を終え、ユーザーへ一次回答したあと、成果を敵対的に検証し、指摘を自己改善へつなげる。

## 最小実行順

1. 一次回答済みであることを確認する。未回答なら先に一次回答する → [procedures.md](references/procedures.md)
1. 成果物の種類に応じて検証を起動する → [procedures.md](references/procedures.md)
1. 他 skill との境界を確認する → [boundaries.md](references/boundaries.md)
1. 指摘への対処と追記を完了する → [procedures.md](references/procedures.md)

## references 目次

| ファイル | 参照開始条件 |
| --- | --- |
| [procedures.md](references/procedures.md) | 一次回答の確認、検証の起動、対処策、追記 |
| [boundaries.md](references/boundaries.md) | 他 skill との境界、適用しない場面 |

## 最終チェック

1. 一次回答を検証より先に出している
1. 設計なら `kf-g-agent-review-adversarial-evaluation` に従っている
1. 実装なら verification worker と `kf-g-agent-review-post-implementation-two-stage` を使い、敵対的評価 skill で置換していない
1. 各指摘に対処策がある。実質的分岐があれば選択肢を列挙し、推奨は行末 `(推奨)`（HTML はバッジ）。ほぼ 1 択なら採用・反映済みを伝えている
