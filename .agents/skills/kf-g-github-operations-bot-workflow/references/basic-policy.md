# 基本方針

- GitHub 上の issue / PR / comment / review 操作は `gh` または GitHub API で行う。
- issue / PR / repository metadata などの読み取りだけなら、ユーザ本人 token または現在の `gh` 認証を使う。
- GitHub App bot credential は、comment / review など bot の profile が露出する投稿操作に限って使う。
- 投稿者を人間ユーザと分けるため、投稿時は `.agents/credentials/github/scripts/github-agent-comment.mjs` と `github-agent-review.mjs` が使えるならそれを使う。
- secret や token を出力しない。token 確認時は期限、権限、repository selection など非秘密情報だけ表示する。
