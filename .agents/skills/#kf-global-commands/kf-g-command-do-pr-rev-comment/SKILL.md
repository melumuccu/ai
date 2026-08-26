---
name: kf-g-command-do-pr-rev-comment
description: PR の未解決 review comment に対応する専用skill。指摘を論理変更グループへ分類し、グループごとに atomic commit・push・個別 reply を行う。
disable-model-invocation: true
---

# PR review comment 対応

PR の未解決 review thread を、1 commit = 1 logical change の単位で対応します。
このファイルは入口と読み進め方を示し、手順・境界条件・reply規則は references に分離します。

## 参照ファイル

- [review-intake-and-scope.md](references/review-intake-and-scope.md): 着手時のBot gate、thread収集、PR内外の対象範囲
- [review-group-classification.md](references/review-group-classification.md): 未解決threadを論理変更グループへ分類するとき
- [group-commit-reply-sequence.md](references/group-commit-reply-sequence.md): グループごとの実装・atomic commit・push・個別replyの順序
- [validation-checklist.md](references/validation-checklist.md): 全グループ完了後の整合性・追跡可能性チェック

## 読み進め方

1. 着手時に [review-intake-and-scope.md](references/review-intake-and-scope.md) を読み、Bot write gate、対応PR、thread、対象ファイルの境界を確定します。
1. threadの一覧化後に [review-group-classification.md](references/review-group-classification.md) を読み、作業前に論理グループ一覧を確定します。
1. 各グループの実装前に [group-commit-reply-sequence.md](references/group-commit-reply-sequence.md) を読み、PR内全ファイルへの横展開とPR外候補の扱いを確認します。
1. 完了前に [validation-checklist.md](references/validation-checklist.md) を読み、commit・reply・resolveの状態を確認します。

## 最終チェック

1. Bot write gateと `kf-g-github-operations-bot-workflow` への委譲導線を満たします。
1. PR内の対象ファイルを漏れなく確認し、PR外の変更はユーザー確認まで保留します。
1. 各commitが1つのlogical changeで、push後に各threadへ個別replyします。
1. resolveはユーザーが行うものとして、未resolve threadと対応表を報告します。
1. [validation-checklist.md](references/validation-checklist.md) の全項目を確認します。
