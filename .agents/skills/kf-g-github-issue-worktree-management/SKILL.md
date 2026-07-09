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

## Issue 参照

GitHub Projects から issue を参照する時は、`.agents/credentials/github/.env` の `GH_TOKEN` (= user token) を環境変数へ読み込んだ状態で `gh` を実行する。
host 側の `gh auth login` 済み状態は前提にしない。
`projectItems` を読むには `read:project` scope が必要。
token 値は出力しない。

コマンド例:

```sh
gh issue list --repo melumuccu/gitdoc-v2 --state open --limit 100 --json number,title,state,url,projectItems,labels,assignees
```

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

issue と local 設計資料は用途を分ける。

- remote の GitHub Issues / GitHub Projects は、作業進行を管理する場所。
- local repository の設計資料は、後から見返す設計判断を残す場所。
- issue の作業メモを、そのまま設計資料へコピーしない。
- 設計資料には、完了後も参照する決定事項、背景、議論の要点だけを整理して残す。

remote issue では、メンバーや AI agent 間のタスク状況共有と進捗管理を行う。
GitHub Projects がある場合は、repository の既定に従い `Backlog`、`Ready`、`In Progress`、`In review`、`Done` などの status を更新する。

作業中は issue に随時記録を残す。

記録する内容:

- 着手開始
- 方針、調査結果、判断理由
- blocked / waiting / review など状態変化
- description 更新
- status 更新
- 議論、保留、未決事項
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
1. local repository に設計資料ディレクトリがある場合は、設計資料への反映要否を確認する。
1. 設計変更や判断が残る作業なら、local 設計資料へ反映する。
1. remote issue の作業記録や議論を整理し、設計資料として必要な情報だけに絞る。
1. なぜその設計に至ったか、どの議論や制約が判断に影響したかを記録する。
1. issue URL と PR URL を設計資料から辿れる形で残す。

local 設計資料の置き場は repository の規約に従う。
例: `docs/`、`design-docs/`、`2_設計前資料/`、`3_設計資料/`。

## 最終確認

- issue ごとの専用 worktree で作業したか。
- branch 名と worktree path が issue と対応しているか。
- issue に進捗と PR URL を残したか。
- main worktree に作業差分を混ぜていないか。
- gitleaks 失敗を回避していないか。
