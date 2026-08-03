# Preflight Write Gate

AI agent が GitHub へ**書き込む**前に必ず通す gate。
読み取り操作には適用しない。

## 書き込み操作の定義

次はすべて bot preflight 成功後にのみ実行する。

- Issue / PR comment 投稿
- PR review 投稿
- review comment への reply
- review thread の resolve
- Issue / PR description（body）更新
- PR 作成
- reviewer 設定
- Issue / PR status 更新（state 変更、Projects status 更新）

## 読み取り操作

次は従来どおり `gh` または `GH_TOKEN` を使ってよい。

- issue / PR / comment / review の参照
- repository metadata 確認
- Projects item 一覧取得
- CI / check run 参照

## セッション内の preflight

呼出元は GitHub 書き込みを行うセッションごとに、一意な `AI_AGENT_GITHUB_SESSION_ID` を環境変数で設定する。

1. 同じ session ID、repository、bot installation、API URL の最初の GitHub 書き込み前に完全 preflight を実行する。
1. 完全 preflight は bot 資格情報、installation token 発行、対象 repository へのアクセス権を確認する。
1. 成功した repository 確認は OS の一時ディレクトリに marker として保存する。marker は SHA-256 digest をファイル名に使い、成功時刻と期限だけを mode `600` で保存する。
1. marker の TTL は 15 分。mtime ではなく marker 内容の期限を検証する。壊れた marker は miss として完全 preflight を実行する。
1. 同一セッションで有効な marker がある場合、repository 権限確認だけを省略する。
1. **各書き込み操作では、marker の有無にかかわらず installation token を必ず再発行する。marker は token cache ではない。**
1. `AI_AGENT_GITHUB_SESSION_ID` が未設定の場合、セッションを安全に識別できないため、従来どおり各書き込み前に完全 preflight を実行する。

完全 preflight が失敗した場合、marker は作成せず、setup 手順を表示して非ゼロで停止する。人間の `gh` / `GH_TOKEN` へ fallback しない。

## Preflight 手順

1. `.agents/credentials/github/.env` と環境変数から bot 資格情報を読む。
1. 必須項目の存在確認:
   - `AI_AGENT_GITHUB_CLIENT_ID` または `AI_AGENT_GITHUB_APP_ID`
   - `AI_AGENT_GITHUB_INSTALLATION_ID`
   - `AI_AGENT_GITHUB_PRIVATE_KEY_PATH`（ファイル実在）
1. installation token を発行する。
1. `--repo OWNER/REPO` が指定されている場合、対象 repository へのアクセス権を確認する（有効な session marker がある場合を除く）。
1. 成功時のみ write helper script を実行する。

## 診断出力

preflight の出力に含めてよい情報:

- 不足している env 名
- private key ファイルの有無（パスは表示可、内容は不可）
- installation token の `expires_at`
- repository へのアクセス可否
- token permissions の種別名（`contents`, `pull_requests` など）

preflight の出力に含めてはいけない情報:

- installation token 本体
- JWT
- private key 内容
- `.env` の値

## 失敗時の停止フロー

preflight が失敗した場合:

1. GitHub API へ書き込みリクエストを送らない。
1. 人間ユーザの `gh auth login` や `GH_TOKEN` へ fallback しない。
1. [github-app-credentials.md](github-app-credentials.md) の setup 手順を表示する。
1. 再実行すべき操作（checkpoint）をユーザへ伝える。
1. 非ゼロ終了コードで停止する。

診断コマンド:

```sh
node .agents/credentials/github/scripts/github-agent-preflight.mjs --repo OWNER/REPO
```

## Write helper script 一覧

bot preflight 内蔵。直接 `gh` や `gh api -X PATCH` を使わない。

| 操作 | script |
| --- | --- |
| preflight 診断 | `github-agent-preflight.mjs` |
| Issue / PR comment | `github-agent-comment.mjs` |
| PR review | `github-agent-review.mjs` |
| review comment reply | `github-agent-reply.mjs` |
| review thread resolve | `github-agent-resolve-thread.mjs` |
| Issue body 更新 | `github-agent-update-issue.mjs` |
| PR body 更新 | `github-agent-update-pr.mjs` |
| PR 作成 | `github-agent-create-pr.mjs` |
| reviewer 設定 | `github-agent-set-reviewers.mjs` |
| Issue state 更新 | `github-agent-update-issue-state.mjs` |

## Reply と resolve の順序

review comment 対応時:

1. `github-agent-reply.mjs` で reply を投稿する。
1. reply 成功を確認する。
1. `github-agent-resolve-thread.mjs` で thread を resolve する。

reply 成功前に resolve しない。

## 権限不足時

preflight 成功後に個別操作が 403 / 422 等で失敗した場合:

- 人間アカウントへ fallback しない。
- 必要な GitHub App permission を報告して停止する。
- Projects status 更新など App 権限外の操作も同様。
