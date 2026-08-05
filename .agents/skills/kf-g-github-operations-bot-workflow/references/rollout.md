# 段階導入

GitHub Bot 書き込み必須化を repository へ導入する手順。

## Local 開発環境

1. `~/.agents/credentials/github` が無ければ [github-app-credentials.md](github-app-credentials.md) に従い sample をコピーする。
1. bot 資格情報（Client ID、Installation ID、private key）を設定する。
1. GitHub 書き込みをまとめる呼出元で、一意な session ID を設定する:

```sh
export AI_AGENT_GITHUB_SESSION_ID="$(uuidgen)"
```

1. preflight を実行する:

```sh
node ~/.agents/credentials/github/scripts/github-agent-preflight.mjs --repo OWNER/REPO
```

1. write gate 検証 script を実行する:

```sh
node ~/.agents/credentials/github/scripts/verify-write-gate.mjs
```

1. セッション内で最初の GitHub 書き込み前に完全 preflight を成功させ、GitHub 書き込みは bot helper script のみ使う。各書き込みでは installation token が再発行される。

移行時の禁止事項:

- `gh pr create` / `gh pr edit` / `gh issue comment` 等の human write
- bot 未設定時の `GH_TOKEN` fallback
- preflight 前の GitHub API write

## CI / 自動化

CI で GitHub 書き込みが必要な場合:

1. GitHub App の installation token 発行に必要な secret を CI 環境変数または secret store へ配置する。
1. job ごとに一意な `AI_AGENT_GITHUB_SESSION_ID` を設定する。
1. job 開始時に `github-agent-preflight.mjs --repo OWNER/REPO` を実行する。
1. preflight 失敗時は job を fail させ、setup 手順をログへ出す（token 値は出さない）。
1. 書き込み操作は bot helper script 経由に統一する。

CI で読み取りのみの場合は従来どおり `GH_TOKEN` を使ってよい。

## 既存 credentials ディレクトリの更新

`~/.agents/credentials/github` は local-only。skill 更新後、次を実行する:

```sh
cp .agents/skills/kf-g-github-operations-bot-workflow/sample/scripts/*.mjs \
  ~/.agents/credentials/github/scripts/
```

private key と `.env` は上書きしない。

## トラブルシュート

| 症状                                    | 対応                                                      |
| --------------------------------------- | --------------------------------------------------------- |
| preflight が missing credentials で失敗 | `.env` と private key を確認                              |
| repository access failed                | App installation の repository 選択を確認                 |
| write helper が 403                     | App permissions（Issues、Pull requests 等）を確認         |
| Projects status 更新不可                | App 権限外。必要権限を報告して停止（human fallback 禁止） |
