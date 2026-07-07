---
name: kf-g-github-issue-worktree-management
description: Use this skill whenever starting, planning, implementing, tracking, or closing GitHub issue work. Always use it when the user says to start implementation/planning from issues, asks to pick the next issue, or asks for issue-linked work, because issue work should use a dedicated worktree and continuous issue progress records.
---

# GitHub issue 管理と worktree 運用

この skill は issue 対応の進め方。
GitHub 操作全般は `kf-g-github-operations-bot-workflow`、PR 作成・レビューは `kf-g-github-pr-review-workflow` も使う。

## 基本方針

- 1 issue = 1 branch = 1 worktree。
- issue 対応時は main worktree で直接作業しない。
- 作業ログ、判断、進捗、PR URL は issue comment に残す。
- AI agent が comment を残す時は GitHub App bot credential を優先する。

## Issue 選択

「issue 実装開始」や「issue プランニング開始」など、特定のタスクを明示せずに指示を受けた時は以下のルールに従って作業を進める。

1. GitHub issues を参照し、status が Ready になっている issue を確認する。
1. Ready になっている issue の中で、start date プロパティが最も早い issue を選択する。
1. 選択した issue の内容を確認し、作業を開始する。
1. 作業中は、随時 issue の description の更新・status 更新・comment 追記など、記録できるものは常に記録する。

作業の着手順は依存関係を考慮する。依存関係は start date プロパティで管理する。

- ロードマップ上で日付順に並べた時に同日なら並行作業可能。
- より早い日付が設定されている issue (A) が、より後の issue (B) をブロックしているものとみなし、A が完了するまで B は着手しない。

## Worktree 作成

issue 着手時は repository 外の sibling directory に worktree を作る。

命名:

- branch: `issue-<issue-number>-<slug>`
- path: `../<repo-name>-issue-<issue-number>-<slug>`

ルール:

- main worktree は同期、確認、緊急操作用に残す。
- 既存 worktree がある場合は `git worktree list` で確認する。
- network share や外部 volume に置く場合は `git worktree lock --reason <reason>` を検討する。
- `--force` は原則禁止。clean にしてから remove / recreate する。

## 作業中の issue 更新

作業中は issue に記録を残す。

記録する内容:

- 着手開始
- 方針、調査結果、判断理由
- blocked / waiting / review など状態変化
- PR URL
- 完了時の要約

AI agent がコメントする場合は `kf-g-github-operations-bot-workflow` の skill に従う

## Branch / commit / push

- issue branch にだけ作業差分を作る。
- commit / push 前に実行される gitleaks が失敗したら commit / push しない。
  - hook 回避や `--no-verify` で進めない。

## 完了処理

PR 作成後:

1. issue に PR URL を comment する。
1. PR を issue に紐づける。
1. 必要な reviewer を設定する。(gh コマンドでログイン済みのユーザーを reviewer に設定する)
1. issue status を review 待ちへ更新する。
1. local repo の設計資料に変更があれば反映する。

## 最終確認

- issue ごとの専用 worktree で作業したか。
- branch 名と worktree path が issue と対応しているか。
- issue に進捗と PR URL を残したか。
- main worktree に作業差分を混ぜていないか。
- gitleaks 失敗を回避していないか。
