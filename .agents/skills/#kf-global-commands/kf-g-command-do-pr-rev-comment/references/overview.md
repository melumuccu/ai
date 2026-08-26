# 全体像

## 基本原則

1 コメント = 1 commit ではなく、**1 commit = 1 logical change** を基準に分割する。

## 着手条件

1. 対応 PR の branch と worktree を特定する
1. `kf-g-git-commit-atomic-rules` を読み、commit 粒度の基準を確認する
1. この skill を読み、review comment の reply / resolve 運用を確認する
1. 未解決 thread、requested changes、CI failure を一覧化する

## 全体フロー

1. [collect-and-propagate.md](collect-and-propagate.md) で未解決 thread を収集し、PR 内の横展開対象を確定する
1. [review-group-classification.md](review-group-classification.md) で論理グループへ分類する
1. [group-commit-reply-sequence.md](group-commit-reply-sequence.md) に従い、グループごとに実装・commit する
1. 全グループの commit 後に push し、bot helper で各 thread へ個別 reply する
1. [validation-checklist.md](validation-checklist.md) で完了判定し、commit と thread の対応を報告する
1. PR 外への横展開候補がある場合は [collect-and-propagate.md](collect-and-propagate.md) の手順に従う

## 参照 skill

- `kf-g-git-commit-atomic-rules` — commit 粒度（1 commit = 1 logical change）
- `kf-g-git-commit-japanese-commit-message` — commit message 形式
- `kf-g-github-operations-bot-workflow` — bot comment / review 投稿
