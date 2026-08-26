---
name: kf-g-command-do-pr-rev-comment
description: Use this skill when responding to unresolved PR review comments. Classify feedback into logical change groups, then atomic-commit, push, and reply to each group.
disable-model-invocation: true
---

未解決 review thread を論理変更グループへ分類し、グループごとに atomic commit したあと一括 push し、thread へ個別 reply する。

## 参照ファイル

- [overview.md](references/overview.md) — 着手時: 全体フロー、着手条件、参照 skill
- [collect-and-propagate.md](references/collect-and-propagate.md) — 着手時: 未解決 thread 収集と横展開対象の確定
- [review-group-classification.md](references/review-group-classification.md) — 分類時: 論理グループ分類
- [group-commit-reply-sequence.md](references/group-commit-reply-sequence.md) — 実装時: グループ単位の実装・commit・push・reply・bot 書き込み
- [validation-checklist.md](references/validation-checklist.md) — 完了前: チェックリストと報告

## 最小適用手順

1. [overview.md](references/overview.md) を読み、着手条件と全体フローを確認する
1. [collect-and-propagate.md](references/collect-and-propagate.md) で未解決 thread を収集し、横展開対象を確定する
1. [review-group-classification.md](references/review-group-classification.md) で論理グループへ分類する
1. 各グループについて [group-commit-reply-sequence.md](references/group-commit-reply-sequence.md) に従い実装し commit する
1. 全グループの commit 後に push し、同ファイルの bot preflight を満たしたうえで各 thread へ個別 reply する
1. [validation-checklist.md](references/validation-checklist.md) で完了判定し、commit と thread の対応を報告する

## 最終チェック

1. [validation-checklist.md](references/validation-checklist.md) の項目をすべて満たしている
1. 各 commit と対象 thread の対応表を報告している
1. thread を resolve していない
1. GitHub 書き込みが bot helper のみである
