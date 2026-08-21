# 整合性チェックリスト

レビュー対応完了前に、次をすべて確認する。

## atomic commit との整合

- [ ] 各 commit が 1 つの logical change だけを含む
- [ ] `Fix multiple issues` や `レビュー指摘 N 件` のような commit message を使っていない
- [ ] refactor / format / typo fix と functional change を混在させていない
- [ ] 各 commit 時点で lint・テスト等の必要検証が通る
- [ ] ユーザーの既存変更を自分の commit に混ぜていない

参照: `kf-g-git-commit-atomic-rules`

## GitHub PR 運用との整合

- [ ] 各 review comment / thread へ個別 reply している
- [ ] 複数 thread を 1 つの reply にまとめていない
- [ ] push 後に reply している（push 前 reply なし）
- [ ] エージェントは thread を resolve していない
- [ ] 必ず bot credential で投稿している
- [ ] reply 本文は変更概要から始まり、続けて commit リンクを含めている
- [ ] reply に受領クッション前置き（`ご指摘ありがとうございます`、`ご質問ありがとうございます` など）を書いていない
- [ ] reply に挨拶・お礼・謝罪などの前置きを書いていない

参照: `kf-g-command-do-pr-rev-comment`

## 追跡可能性

- [ ] 作業前に論理グループ一覧を作成した
- [ ] 各グループと thread の対応を記録した
- [ ] 各 commit とグループの対応を報告できる
- [ ] 未 resolve thread と理由を報告できる（resolve はユーザーが行う）

## 完了報告に含める項目

1. 論理グループ一覧（識別名・変更理由）
1. commit 一覧（hash・message・対応グループ）
1. thread 対応表（thread URL → commit hash → reply 有無）
1. 実行した検証内容
1. 未 resolve thread があれば理由（resolve はユーザーが行う）

## 既存 PR への適用注意

- すでに push 済みの PR を force push で書き換えない（別 PR で skill 改善する場合は対象外）
- 一括 commit 済みの PR を後から分割する必要がある場合は、ユーザ確認後に別途対応する
