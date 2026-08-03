# ~/.agents/credentials/github

このディレクトリは AI agent が GitHub 連携に必要な認証情報を格納するためのもの。

このディレクトリは local-only。git 管理しない。(グローバル gitignore に登録済みなので local gitignore に登録する必要はない)

## GitHub App

- Name: `ai-agent-melumuccu`

## `.env`

このディレクトリの `.env` に以下を記載する。
値は GitHub App 作成後に取得する。Bitwarden の GitHub にも記録する。

```sh
GH_TOKEN=github_pat_xxx
AI_AGENT_GITHUB_CLIENT_ID=xxx
AI_AGENT_GITHUB_INSTALLATION_ID=xxx
AI_AGENT_GITHUB_PRIVATE_KEY_PATH=$HOME/.agents/credentials/github/ai-agent-melumuccu.xxxxxxxxxxx.private-key.pem
```

`GH_TOKEN` は読み取り操作で使うユーザ本人 token。
AI agent は sandbox 環境で動くため、host 側の `gh auth login` 済み状態を前提にしない。
`GH_TOKEN` は AI の GitHub **書き込み**には使わない。
GitHub 書き込みをまとめる呼出元は、セッションごとに一意な `AI_AGENT_GITHUB_SESSION_ID` を設定する。

```sh
export AI_AGENT_GITHUB_SESSION_ID="$(uuidgen)"
```

同一 session の最初の書き込みで repository 権限を完全 preflight し、有効な marker がある後続書き込みでも installation token は毎回再発行する。session ID が未設定の場合は、各書き込みで完全 preflight を実行する。

JWT の `iss` には GitHub docs 推奨の Client ID を使う。
古い local 設定との互換用に script は `AI_AGENT_GITHUB_APP_ID` も fallback として読む。
旧 `GITDOC_AGENT_*` も fallback として読む。

```sh
chmod 600 ~/.agents/credentials/github/.env
```

## Private key

GitHub App の private key をこのディレクトリに配置する。

```sh
chmod 600 ~/.agents/credentials/github/ai-agent-melumuccu.xxxxxxxxxxx.private-key.pem
```

private key を紛失した場合は GitHub App 設定画面で再発行する。
古い key が不要なら削除する。

## Scripts

AI agent が使う補助 script。
人間が日常的に直接使う前提ではない。

```sh
node ~/.agents/credentials/github/scripts/github-agent-preflight.mjs --repo OWNER/REPO
node ~/.agents/credentials/github/scripts/github-agent-token.mjs
node ~/.agents/credentials/github/scripts/github-agent-comment.mjs OWNER/REPO ISSUE_OR_PR_NUMBER BODY_FILE
node ~/.agents/credentials/github/scripts/github-agent-review.mjs OWNER/REPO PR_NUMBER BODY_FILE
node ~/.agents/credentials/github/scripts/github-agent-reply.mjs OWNER/REPO PR_NUMBER COMMENT_ID BODY_FILE
node ~/.agents/credentials/github/scripts/github-agent-resolve-thread.mjs OWNER/REPO PR_NUMBER --comment-id COMMENT_ID
node ~/.agents/credentials/github/scripts/github-agent-update-issue.mjs OWNER/REPO ISSUE_NUMBER BODY_FILE
node ~/.agents/credentials/github/scripts/github-agent-update-pr.mjs OWNER/REPO PR_NUMBER BODY_FILE
node ~/.agents/credentials/github/scripts/github-agent-create-issue.mjs OWNER/REPO --title TITLE BODY_FILE
node ~/.agents/credentials/github/scripts/github-agent-create-pr.mjs OWNER/REPO --head BRANCH --base BASE BODY_FILE
node ~/.agents/credentials/github/scripts/github-agent-set-reviewers.mjs OWNER/REPO PR_NUMBER REVIEWER
node ~/.agents/credentials/github/scripts/verify-write-gate.mjs
node ~/.agents/credentials/github/scripts/verify-session-preflight.mjs
```

`github-agent-preflight.mjs` は書き込み前の bot 資格情報診断用。
preflight 失敗時は setup 手順を表示して停止する。

`github-agent-token.mjs` は GitHub App private key から installation token を発行する。
installation token は約 1 時間で失効する。
token 本体は出力しない。

write helper script は user token ではなく GitHub App installation token を使うため、投稿者がユーザ本人と分離される。

`mise.toml` task は追加しない。
このディレクトリは local-only で、tracked task から参照すると他環境で壊れるため。
