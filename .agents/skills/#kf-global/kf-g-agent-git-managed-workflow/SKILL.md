---
name: kf-g-agent-git-managed-workflow
description: >
  Use this skill when changing any git-managed files in a repository.
  Always apply it before creating issues, dedicated worktrees, commits, or pull requests
  for such changes; covers issue-first planning, worktree path and branch naming,
  atomic commits, push, PR creation, presenting the PR URL to the user, and stopping on hook failures without --no-verify.
---

# git 管理ファイルの作業手順

git 管理ファイルの変更では、issue、worktree、commit、push、PR をこの順で進める。

## 参照ファイル

- [workflow.md](references/workflow.md): issue から PR までの手順
- [worktree.md](references/worktree.md): branch 名と worktree 配置

## 読み進め方

1. [workflow.md](references/workflow.md) を読み、着手順を確定する
1. issue 起点なら [worktree.md](references/worktree.md) に従い worktree を作る
1. commit は `kf-g-git-commit-atomic-rules` に従う
1. 下記「完了条件」を満たす
1. 下記「最終チェック」で完了判定する

## 完了条件

git 管理ファイルに変更差分がある作業では、実装と検証のあと次を一貫して完了する。

1. atomic commit する
1. remote へ push する
1. PR を作成する
1. ユーザーへの回答に PR URL を記載する

issue 起点の作業では、PR URL を対応 issue にも記録する。

ファイル変更差分がない HTML 報告の R2 配布だけは PR を作成しない。

ユーザーが commit や PR 作成を明示的に禁止した場合は、その指示に従う。

## 最終チェック

1. プランニングが必要な作業で、worktree 作成前に issue を作成している
1. 変更は専用 worktree 内だけで行い、main では直接変更していない
1. 変更を論理単位に分け、検証後に atomic commit している
1. ファイル変更差分がある作業で commit、push、PR 作成まで完了している
1. ユーザーへの回答に PR URL を記載している
1. commit / push 前の hook 失敗を `--no-verify` で回避していない
