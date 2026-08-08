---
name: kf-g-agent-review-adversarial-evaluation
description: 'Use this skill whenever the user asks for advice, review, critique, evaluation, feedback, or a second opinion on a design, plan, proposal, document, approach, or similar artifact. Apply adversarial evaluation: challenge assumptions, surface failure modes and risks, and refuse rubber-stamping. Do not use for post-implementation two-stage programming reviews (use kf-g-agent-review-post-implementation-two-stage) or as the edit-approval gate (use kf-g-agent-research-report-only-unless-approved); those skills remain complementary.'
---

# 敵対的評価レビュー

助言・レビュー・評価依頼に対し、前提を疑い、失敗モードとリスクを表面化する評価姿勢を適用する。frontmatter `description` の適用条件を満たす場合のみ本 skill および references を参照する。

## 最小実行順

1. frontmatter `description` の適用条件を確認し、対象条件を満たす場合のみ本 skill を使う
1. 編集禁止ゲートが必要な場合は `kf-g-agent-research-report-only-unless-approved` を併用する → [boundaries.md](references/boundaries.md)
1. 対象の主張・前提・成功条件を抽出し、敵対的評価を実施する → [procedures.md](references/procedures.md)
1. 出力は指定見出し順に従う → [output-format.md](references/output-format.md)

## references 目次

| ファイル | 参照開始条件 |
| --- | --- |
| [procedures.md](references/procedures.md) | 評価手順、攻撃の優先順位、対処策検討、トーン |
| [boundaries.md](references/boundaries.md) | 他 skill との境界、適用しない場面 |
| [output-format.md](references/output-format.md) | 必須見出し順、指摘テンプレ、対処策・選択肢 |

## 最終チェック

1. 結論（進める / 条件付き / 差し戻し）を冒頭に置いている
1. Blocking / Non-blocking / Open questions を分類している
1. 称賛や同意を既定の冒頭に置いていない
1. 敵対対象は提案・成果物であり、人への敵意がない
1. 各指摘に対処策・選択肢があり、推奨があればバッジで示している
