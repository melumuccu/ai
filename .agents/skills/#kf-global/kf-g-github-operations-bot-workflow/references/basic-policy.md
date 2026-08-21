# 基本方針

- GitHub 上の issue / PR / comment / review 操作は GitHub API で行う。
- AI agent は sandbox 環境で動く前提。host 側でユーザが `gh auth login` 済みでも、sandbox から同じ認証状態を使えるとは限らない。
- issue / PR / repository metadata などの**読み取り**だけなら、`~/.agents/credentials/github/.env` の `GH_TOKEN` を環境変数へ読み込み、ユーザ本人 token で `gh` または GitHub API を使う。
- 既存の `gh` 認証を使う場合は、sandbox 内で実際に使えることを確認してから使う。読み取り専用に限る。
- AI agent による GitHub **書き込み**は、GitHub App bot credential の preflight 成功後にのみ実行する。
- 書き込み前に [preflight-write-gate.md](preflight-write-gate.md) を読み、`github-agent-preflight.mjs` 相当の確認を通す。
- bot preflight が失敗した場合は setup 手順を表示して停止する。人間ユーザの `gh` 認証や `GH_TOKEN` へ fallback しない。
- 投稿者を bot と分けるため、書き込みは `~/.agents/credentials/github/scripts/` 配下の bot helper script のみ使う。
- `gh pr create`、`gh pr edit`、`gh api -X PATCH` 等の直接 write コマンドは AI agent が使わない。
- secret や token を出力しない。token 確認時は期限、権限、repository selection など非秘密情報だけ表示する。
