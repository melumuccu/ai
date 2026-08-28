---
name: kf-g-agent-coding-workflow
description: >
  Use this skill when performing coding work on git-managed files in a repository.
  Always apply it before creating issues, dedicated worktrees, commits, or pull requests
  for coding tasks; covers issue-first planning, worktree path and branch naming,
  atomic commits, PR creation, and stopping on hook failures without --no-verify.
---

# コーディング業務の手順

git 管理ファイルのコーディングでは、issue、worktree、commit、PR をこの順で進める。

## 参照ファイル

- [workflow.md](references/workflow.md): issue から PR までの手順
- [worktree.md](references/worktree.md): branch 名と worktree 配置

## 読み進め方

1. [workflow.md](references/workflow.md) を読み、着手順を確定する
1. issue 起点なら [worktree.md](references/worktree.md) に従い worktree を作る
1. commit は `kf-g-git-commit-atomic-rules` に従う
1. 下記「最終チェック」で完了判定する

## 最終チェック

1. プランニングが必要な作業で、worktree 作成前に issue を作成している
1. 変更は専用 worktree 内だけで行い、main では直接変更していない
1. 変更を論理単位に分け、検証後に atomic commit している
1. ファイル変更差分がある作業で PR を作成している
1. commit / push 前の hook 失敗を `--no-verify` で回避していない
