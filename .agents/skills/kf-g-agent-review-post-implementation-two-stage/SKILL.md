---
name: kf-g-agent-review-post-implementation-two-stage
description: Use this skill for programming design and implementation reviews after completion, including code, configuration, tests, and CI/CD changes. Start with a diff-first review, then resume the same reviewer for plan alignment. Route documentation-only, business-planning, general-research, and nontechnical work through the appropriate single-stage review process.
---

# AI agent 実装後レビュー（2段階）

**プログラミング設計・実装**のレビュー手順。第1段階は plan 非参照の差分単独レビュー、第2段階は同一 reviewer が plan と照合する。

frontmatter `description` の対象条件を満たす場合のみ本 skill および references を参照する。非対象では通常の単段階レビュー（`bugbot`、`review-agent` 等）を使う。

## 最小実行順

1. frontmatter `description` の適用条件を確認し、対象条件を満たす場合のみ本 skill を使う
1. **orchestrator 役割**の場合: [orchestrator-guide.md](references/orchestrator-guide.md) を読み、レビュー worker 起動・第1/第2段階委譲指示作成・結果統合・最終チェックに進む
1. 第1段階: plan 非共有で diff 単独レビュー → [stage-procedures.md](references/stage-procedures.md)
1. 停止条件を確認。第1段階が `completed` のときのみ第2段階へ進む
1. 第2段階: **同一 subagent を `resume`** で plan 照合 → [stage-procedures.md](references/stage-procedures.md)
1. 統合レビュー出力 → [review-output-format.md](references/review-output-format.md)

**不変条件**: stage1 出力全文を stage2 へそのまま引き継ぎ、stage2 は disposition と根拠を追加する。plan 整合判定と品質妥当性判定を独立実施し、plan 準拠でも品質問題は専用 disposition で severity を維持する。plan-independent 指摘の disposition 変更は `factually-incorrect`（severity `n/a`）のみ。`resume` 不成立時は `blocked` として報告し、同一 reviewer 再起動を要求する。

## references 目次

| ファイル | 参照者 | 内容・参照開始条件 |
| --- | --- | --- |
| [orchestrator-guide.md](references/orchestrator-guide.md) | orchestrator | 本 skill でレビュー worker を起動するとき、第1/第2段階委譲指示を作るとき、レビュー結果を統合し最終チェックするとき。委譲テンプレート、最終チェック |
| [stage-procedures.md](references/stage-procedures.md) | reviewer worker | 段階手順、停止条件、stage1 再起動、resume 不成立、忖度防止 |
| [review-output-format.md](references/review-output-format.md) | reviewer worker | 第1/2段階・stage1 未完了報告・resume 不成立の出力形式 |
