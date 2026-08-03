---
name: kf-g-command-do-pr-rev-comment
description: PR の未解決 review comment に対応するコマンド。指摘を論理変更グループへ分類し、グループごとに atomic commit・push・個別 reply を行う。
disable-model-invocation: true
---

PR の review comment のうち、未解決 thread を対応してください。
1 コメント = 1 commit ではなく、**1 commit = 1 logical change** を基準に分割します。

## Bot 書き込み必須

GitHub への comment / reply / resolve は、bot preflight 成功後に bot helper script のみ使う。
bot 資格情報が未設定または preflight が失敗した場合は、`kf-g-github-operations-bot-workflow` の setup 手順を表示して停止する。
人間 `gh` 認証や `GH_TOKEN` への fallback は禁止。

参照:

- `kf-g-github-operations-bot-workflow` — preflight / write gate
- `kf-g-github-pr-review-workflow` — reply / resolve 手順

reply:

```sh
node ~/.agents/credentials/github/scripts/github-agent-reply.mjs OWNER/REPO PR_NUMBER COMMENT_ID BODY_FILE
```

## 着手条件

1. 対応 PR の branch と worktree を特定する
1. `kf-g-git-commit-atomic-rules` を読み、commit 粒度の基準を確認する
1. `kf-g-github-pr-review-workflow` を読み、reply 運用を確認する
1. 未解決 thread、requested changes、CI failure を一覧化する

## 未解決 thread の収集

1. PR の未解決 review comment / thread をすべて列挙する
1. 各 thread に、指摘内容・対象ファイル・意図（修正 / 説明 / 保留）を付ける
1. 同じ指摘が複数 thread に分かれている場合は、1 つの論理変更として扱えるか判断する

## 論理グループへの分類

1. 未解決 thread を、独立した論理変更単位のグループへ分類する
1. 分類基準の詳細は [references/review-group-classification.md](references/review-group-classification.md) を読む
1. 各グループに短い識別名（例: `表記横断統一`）を付ける
1. 各グループに対応する thread ID / URL を記録する（ユーザー向け完了報告に含める）
1. 同じファイルに複数グループがある場合も、作業順を分けて commit する

### 分類の原則

- 1 コメント = 1 commit とは限らない（論理変更単位で分類した結果、1 コメント = 1 commit になる場合もある）
- 複数 thread が同じ論理変更なら 1 グループにまとめる
- 独立した修正理由・レビュー観点を持つ thread は別グループにする
- 分類結果を作業前に一覧として残す（チャットまたは完了報告でユーザーに提示する）

## グループごとの実装・commit

各グループについて、次の順序を必ず守る。

1. 当該グループの修正だけを実装する
1. 当該グループに必要な検証（lint・テスト・差分確認）を実行する
1. 当該グループの変更だけを stage する
1. `git diff --cached --stat` で 1 つの関心事だけが staged になっていることを確認する
1. commit message には変更理由を書く。`レビュー指摘 N 件` のような件数表現は使わない
1. commit 後、次のグループへ進む

詳細手順は [references/group-commit-reply-sequence.md](references/group-commit-reply-sequence.md) を読む。

## push 後の reply

1. すべてのグループの commit が完了したら push する
1. push 前に thread へ reply しない
1. push 後、各グループに対応する thread だけ個別 reply する
1. reply には、対応した commit（message 1 行目をラベルとしたリンク）と変更概要を書く
1. resolve はユーザーが行う。エージェントは resolve しない
1. 説明のみ・保留の thread は reply で理由を残す
1. reply 前に bot preflight を成功させ、上記 bot helper script を使う
1. bot preflight 失敗時は setup 手順を表示して停止し、人間 `gh` 認証や `GH_TOKEN` へ fallback しない

### reply の禁止事項

- 複数 thread を 1 つの reply にまとめない
- push 前に reply しない
- thread を resolve しない

## 完了確認

1. [references/validation-checklist.md](references/validation-checklist.md) のチェックリストをすべて確認する
1. 各 commit と対象 thread の対応表を報告する
1. 未 resolve thread とその理由があれば報告する（resolve はユーザーが行う）

## 参照 skill

- `kf-g-git-commit-atomic-rules` — commit 粒度（1 commit = 1 logical change）
- `kf-g-git-commit-japanese-commit-message` — commit message 形式
- `kf-g-github-pr-review-workflow` — PR review 対応・個別 reply
- `kf-g-github-operations-bot-workflow` — bot comment / review 投稿
