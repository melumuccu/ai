---
name: kf-g-command-do-pr-rev-comment
description: PR のレビューコメントに対応するコマンド
disable-model-invocation: true
---

PR の review comment の中から resolve されていないものを対応してください。

## Bot 書き込み必須

GitHub への comment / reply / resolve は、bot preflight 成功後に bot helper script のみ使う。
bot 資格情報が未設定または preflight が失敗した場合は、`kf-g-github-operations-bot-workflow` の setup 手順を表示して停止する。
人間 `gh` 認証や `GH_TOKEN` への fallback は禁止。

参照:

- `kf-g-github-operations-bot-workflow` — preflight / write gate
- `kf-g-github-pr-review-workflow` — reply / resolve 手順

Reply:

```sh
node .agents/credentials/github/scripts/github-agent-reply.mjs OWNER/REPO PR_NUMBER COMMENT_ID BODY_FILE
```

Resolve（reply 成功後）:

```sh
node .agents/credentials/github/scripts/github-agent-resolve-thread.mjs OWNER/REPO PR_NUMBER --comment-id COMMENT_ID
```
