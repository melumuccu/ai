# 作業中の issue 更新

issue と local 設計資料は用途を分ける。

- remote の GitHub Issues / GitHub Projects は、作業進行を管理する場所。
- local repository の設計資料は、後から見返す設計判断を残す場所。
- issue の作業メモを、そのまま設計資料へコピーしない。
- 設計資料には、完了後も参照する決定事項、背景、議論の要点だけを整理して残す。

remote issue では、メンバーや AI agent 間のタスク状況共有と進捗管理を行う。
GitHub Projects がある場合は、repository の既定に従い `Backlog`、`Ready`、`In Progress`、`In review`、`Done` などの status を更新する。

## プランニング前処理

既存 issue からプランニングする場合、プランニング着手前に次の順序で行う。

1. 既存 issue の description と既存 comment を読み、プランニングの参考として扱う。
1. プランニング完了後、次節の workflow に従い description を更新する（HTML 配布ありは R2 アップロードと URL 確認後。既存 description は参考にし、最小サマリ + プランニング用資料リンク形式へ統合・上書きする）。

## プランニング内容の description 更新

Cursor チャットや Plan モードなどで作成した実装計画を基に作業を始める場合、workflow に応じて description を更新する。

- comment: 作業ログ、判断、進捗、PR URL を残す場所（`SKILL.md` 基本方針参照）。
- Cursor や Codex など AI 側でプランニングファイルを作成する場合、ファイル本文には**該当 issue へのリンクのみ**を記載する。計画本文の置き場所は下記のいずれかに従う。

### HTML 配布あり（R2 アップロード済み）

`kf-g-html-document-universal-single-file` で HTML を生成し R2 へアップロードする場合:

1. 詳細な計画・調査・検証・リスクは **HTML 本文** に記載する
1. 新規 `v{N}` として R2 へアップロードし、**`https://ai-html.hacksaw.work/<object-key>`** を確認する
1. **URL 確認後** に issue description を確定する。R2 アップロードと URL 確認前に description を確定しない
1. HTML を改訂するたびに新しい `v{N}` をアップロードし、**確認済み最新 URL** と **`v{N}`（版番号）ラベル** で description のリンクを差し替える（旧版オブジェクトは上書きしない）
1. 既存 description がある場合は **参考として読み**、最小サマリ + `## プランニング用資料` リンク形式へ **統合・上書き** する（追記のみはしない）

- issue description には **最小サマリと `## プランニング用資料` 配下の HTML リンクのみ** を置く。計画全文・テスト計画・リスク一覧・実装経緯は description に書かない
- リンクラベルは版付きオブジェクト名から抽出した **`v{N}`（版番号）のみ**（例: `..._v2.html` → `[v2](...)`）。`最新版HTML` やファイル名全体は使わない
- URL または `v{N}` が未確定の間はリンクを置かない。プレースホルダ、推測 URL、未確認の版番号は禁止

```markdown
## 概要
- <issue の最小サマリ>

## プランニング用資料
[v{N}](https://ai-html.hacksaw.work/<object-key>)
```

- 確認済み URL と `v{N}`（版番号）のみ Markdown リンクで記載する

### HTML 配布なし

HTML 配布がない通常の issue プランニング:

- **実装着手前**に issue description を更新する
- description: 作業の仕様・計画を置く場所。プランニングで作成した Markdown を**そのまま**記載する
- GitHub 投稿前のフットノート記法変換は `kf-g-agent-planning-structured-plan-output` に従う
- 既存 description がある場合は **参考として読み**、プランニングで作成した Markdown へ **統合・上書き** する（追記のみはしない）
- 理由: AI 側のプランニングはやり取りログが残らず意思決定経緯が追えないため、issue 側でプランニング経緯を管理する

### description の更新

- ユーザからの comment に応じて description を随時更新する。
- HTML 配布あり: HTML を改訂して新しい `v{N}` をアップロードしたら、URL 確認後に description のリンクとラベルを最新版へ差し替える。
- description を更新した場合は、更新内容を issue 上で comment する。

### ユーザ comment への返答

- issue 上でユーザから comment があった場合、必要に応じて issue 側で返答する。

作業中は issue に随時記録を残す。

記録する内容:

- 着手開始
- 方針、調査結果、判断理由
- blocked / waiting / review など状態変化
- description 更新
- status 更新
- 議論、保留、未決事項
- PR URL
- 完了時の要約

AI agent がコメントする場合は `kf-g-github-operations-bot-workflow` の skill に従う。
