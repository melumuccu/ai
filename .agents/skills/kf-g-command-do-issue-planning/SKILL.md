---
name: kf-g-command-do-issue-planning
description: Issue の planning を行うコマンド
disable-model-invocation: true
---

Issue を参照し、ルールに則って planning を開始してください。
「なぜその issue を選んだか」は plan document への記載対象外です。

## プランニング

1. `kf-g-github-issue-worktree-management` に従い issue を参照する
1. `kf-g-agent-planning-structured-plan-output` に従い plan を作成する
1. plan を提示し、ユーザーから実装許可を得る

## 実装許可後

ユーザーから実装許可を得たら、次を完了するまでユーザーへレビューを求めない。

1. 実装を完了する
1. 検証（テスト・lint 等）を実行する
1. PR を作成する
1. PR URL を issue comment に記録する（`kf-g-github-issue-worktree-management` 参照）

上記が完了した時点で、ユーザーへ PR レビューを依頼する。

## 参照 skill

- `kf-g-github-issue-worktree-management` — issue / worktree / 進捗管理
- `kf-g-agent-planning-structured-plan-output` — plan 出力形式
- `kf-g-github-pr-review-workflow` — PR 作成
