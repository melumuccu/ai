---
name: kf-g-skill-review-modification-sample-artifacts
description: Use this skill whenever revising a self-made skill and preparing user review of before/after sample artifacts. Apply it when you must produce sample outputs with two independent subagents—one using only the pre-change skill snapshot and one using only the post-change skill—under identical prompts and inputs so reviewers can visually inspect only the skill-change delta.
---

# skill 改修 before/after サンプルレビュー

自作 skill を改修するとき、修正前後のサンプル成果物を独立 2 worker で生成し、ユーザが skill 修正由来の差分だけを目視確認できるようにする手順。

## 他 skill との境界

| skill | 関係 |
| --- | --- |
| `skill-creator` | eval / benchmark 全般。本 skill は before/after サンプルレビュー手順に特化し、フル eval ループを必須にしない |
| `kf-g-skill-authoring-body-structure-rules` | 本文構成・肯定形手順。本 skill はサンプル生成とレビュー依頼のみ |
| `kf-g-skill-naming-creation-organization-rules` | 命名・配置。改修時に参照するが正本ではない |
| 本 skill 新設 PR | 本メタ skill 自身のフル dogfood は必須にしない |

## 最小適用手順

1. 対象 skill、改修意図、レビュー観点を固定する
1. [procedure.md](references/procedure.md) の着手条件を満たす
1. 修正前 skill のスナップショットを取得する
1. [sample-artifact-selection.md](references/sample-artifact-selection.md) で成果物種別と共通入力を 1 セット固定する
1. [fixed-prompt-template.md](references/fixed-prompt-template.md) で固定プロンプトを確定する
1. 同一ターンで独立 2 worker を並列起動し、before / after 成果物を収集する
1. [review-request.md](references/review-request.md) の形式でユーザへレビュー依頼する
1. 承認後に skill 修正を確定する（未承認で確定しない）

## references 目次

| ファイル | 参照開始条件 |
| --- | --- |
| [procedure.md](references/procedure.md) | 着手条件、スナップショット、固定条件、並列起動、成果物収集、承認後の確定 |
| [sample-artifact-selection.md](references/sample-artifact-selection.md) | 対象 skill に応じた成果物種別の選び方と同一対象内容の固定 |
| [isolation-and-invariants.md](references/isolation-and-invariants.md) | 独立 subagent、禁止事項、委譲時の skill 列挙ルール |
| [review-request.md](references/review-request.md) | ユーザへのレビュー依頼形式（before/after 並置、差分の見方、承認待ち） |
| [fixed-prompt-template.md](references/fixed-prompt-template.md) | 固定プロンプトのテンプレート（プレースホルダ付き正本） |

## 不変条件

- 修正前 skill と修正後 skill を同一 subagent に渡さない
- 1 worker = 1 skill 版のみ
- before / after でプロンプト・入力・成果物種別を統一し、差分は skill 改修由来のみとする

## 最終チェック

1. 独立 2 worker が同一固定プロンプトで並列起動されている
1. before / after 成果物が `artifacts/skill-modification-review/<target-skill>/<timestamp>/{before,after}/` に保存されている（Git commit しない）
1. ユーザ承認前に skill を確定していない
1. レビュー依頼が [review-request.md](references/review-request.md) の形式に沿っている
