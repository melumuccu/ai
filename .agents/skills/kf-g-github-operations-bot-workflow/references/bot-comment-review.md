# Bot Comment / Review

書き込み前に必ず preflight を通す。詳細は [preflight-write-gate.md](preflight-write-gate.md)。

Preflight 診断:

```sh
node .agents/credentials/github/scripts/github-agent-preflight.mjs --repo OWNER/REPO
```

Issue または PR conversation comment:

```sh
node .agents/credentials/github/scripts/github-agent-comment.mjs OWNER/REPO ISSUE_OR_PR_NUMBER BODY_FILE
```

PR review comment:

```sh
node .agents/credentials/github/scripts/github-agent-review.mjs OWNER/REPO PR_NUMBER BODY_FILE
```

Review comment reply:

```sh
node .agents/credentials/github/scripts/github-agent-reply.mjs OWNER/REPO PR_NUMBER COMMENT_ID BODY_FILE
```

Review thread resolve:

```sh
node .agents/credentials/github/scripts/github-agent-resolve-thread.mjs OWNER/REPO PR_NUMBER --comment-id COMMENT_ID
```

Issue description 更新:

```sh
node .agents/credentials/github/scripts/github-agent-update-issue.mjs OWNER/REPO ISSUE_NUMBER BODY_FILE
```

PR description 更新:

```sh
node .agents/credentials/github/scripts/github-agent-update-pr.mjs OWNER/REPO PR_NUMBER BODY_FILE
```

PR 作成:

```sh
node .agents/credentials/github/scripts/github-agent-create-pr.mjs OWNER/REPO --head BRANCH --base BASE [--title TITLE] BODY_FILE
```

Reviewer 設定:

```sh
node .agents/credentials/github/scripts/github-agent-set-reviewers.mjs OWNER/REPO PR_NUMBER REVIEWER [REVIEWER...]
```

Issue state 更新:

```sh
node .agents/credentials/github/scripts/github-agent-update-issue-state.mjs OWNER/REPO ISSUE_NUMBER --state open|closed
```

運用:

- 投稿本文は一時ファイルに作る。
- 投稿後、URL をユーザに報告する。
- 失敗時は HTTP status と GitHub API message を読む。
- user token に自動 fallback しない。bot credential が未設定または無効な場合は setup 手順を表示して停止する。
- review comment 対応時は reply 成功後に thread resolve する。

Token:

- write helper script は投稿直前に installation token を発行する。
- 長期間未使用でも、`.env` と private key が有効ならユーザ操作は不要。
- `github-agent-token.mjs` の手動実行は診断用。token 本体は出力しない。
