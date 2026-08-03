# 最終確認

- 既存 issue からプランニングする場合、プランニング前に既存 issue の description と comment を参照したか。
- 計画を基に着手した場合、description を workflow に応じて更新したか。
  - HTML 配布あり（`kf-g-html-document-universal-single-file` で R2 アップロード済み）: 最小サマリと `## プランニング用資料` 配下の **`[vN](<確認済み latest R2 URL>)`** のみを記載したか。計画全文・詳細は HTML に置き、description に複製していないか。
  - HTML 配布なし: プランニング Markdown を issue description に**そのまま**転記したか。
- AI 側プランニングファイルには issue リンクのみ記載したか。
- ユーザ comment に応じた description 更新と、更新内容の comment 告知を行ったか。
- issue 上のユーザ comment に必要に応じ返答したか。
- issue ごとの専用 worktree で作業したか。
- branch 名と worktree path が issue と対応しているか。
- issue に進捗と PR URL を残したか。
- main worktree に作業差分を混ぜていないか。
- gitleaks 失敗を回避していないか。
