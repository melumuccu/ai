# 最終確認

- GitHub 操作先 remote を確認したか。
- 読み取りだけの作業で `GH_TOKEN` または検証済みの `gh` 認証を使い、bot credential を要求していないか。
- GitHub 書き込み前に bot preflight を成功させたか。
- GitHub comment / review / reply / resolve / PR 作成 / description 更新 / reviewer 設定を bot script で行ったか。
- bot preflight 失敗時に人間 `gh` や `GH_TOKEN` へ fallback していないか。
- token / secret を出力していないか。
- gitleaks 失敗を回避していないか。
- GitHub comment / review URL をユーザへ報告したか。
