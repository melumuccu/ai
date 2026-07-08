# 基本方針

- GitHub 上の issue / PR / comment / review 操作は `gh` または GitHub API で行う。
- AI agent が GitHub に comment / review を残す時は、ユーザ本人 token ではなく GitHub App bot credential を優先する。
- 投稿者を人間ユーザと分けるため、`.agents/credentials/github/scripts/github-agent-comment.mjs` と `github-agent-review.mjs` が使えるならそれを使う。
- secret や token を出力しない。token 確認時は期限、権限、repository selection など非秘密情報だけ表示する。
