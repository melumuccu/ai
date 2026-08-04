---
name: kf-g-github-issue-worktree-management
description: Use this skill whenever starting, planning, implementing, tracking, or closing GitHub issue work. Always use it when the user says to start implementation/planning from issues, asks to pick the next issue, or asks for issue-linked work.
---

# GitHub issue 管理と worktree 運用

この skill は issue 対応時の作業対象と参照先を定義する。

## 基本方針

- 1 issue = 1 branch = 1 worktree。
- issue 対応時は main worktree で直接作業しない。
- 作業ログ、判断、進捗、PR URL は issue comment に残す。
- 作業順、worktree、issue 進行、プランニング、HTML 配布の詳細は `.agents/rules/kf-g-always-workflow.mdc` に従う。
- GitHub 操作全般は `kf-g-github-operations-bot-workflow`、PR 作成・レビューは `kf-g-github-pr-review-workflow` も使う。

## Plan mode 中の GitHub 書き込み

Plan mode で確認前の GitHub 書き込みが禁止されている場合、Issue comment または description を更新する前にユーザーへ明示的な許可を求める。許可を得るまで書き込みを実行しない。許可後は GitHub App bot の preflight 成功後に bot helper script のみ使う。

## Branch / commit / push

- issue branch にだけ作業差分を作る。
- commit / push 前に gitleaks が失敗したら commit / push しない。
- hook 回避や `--no-verify` で進めない。
