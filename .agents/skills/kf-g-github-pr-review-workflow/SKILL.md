---
name: kf-g-github-pr-review-workflow
description: Use this skill whenever creating, updating, reviewing, commenting on, or preparing a GitHub pull request. Always use it for issue-linked PRs, reviewer assignment, PR body conventions, PR comments, PR reviews, and deciding whether to use GitHub App bot review scripts.
---

# GitHub PR 作成・レビュー運用

この skill は PR 作成、更新、レビュー、comment のルール。
GitHub 操作全般は `kf-g-github-operations-bot-workflow`、issue 起点の作業は `kf-g-github-issue-worktree-management` も使う。

## 基本方針

- 1 issue 1 PR を基本にする。
- PR は対応 issue に紐づけ、merge / close 時に issue が閉じる形を優先する。
- PR 作成後、issue comment に PR URL を残す。
- reviewer は　gh コマンドでログイン済みのユーザーを reviewer に設定する
- AI agent の PR 作成 / comment / review は GitHub App bot credential を優先する。

## PR 作成前

確認:

1. issue 番号、issue URL、完了条件
1. branch が issue 用 branch か
1. worktree が issue 用 worktree か
1. unrelated change が混ざっていないか
1. repository native の check が通るか

## PR body

PR description（body）の内容は、HTML 配布の有無で分ける。

### HTML 配布あり（R2 アップロード済み）

`kf-g-html-document-universal-single-file` で HTML を生成し R2 へアップロードする場合:

- PR description には **最小サマリと最新 HTML リンクのみ** を置く
- 詳細な計画・テスト計画・リスク・実装経緯は **HTML 本文** に記載し、description に複製しない
- **R2 アップロードと公開 URL の確認後** に description を確定する。URL 未確定の間はリンクを置かない
- HTML を改訂したら新しい `vN` をアップロードし、description のリンクを最新 URL に差し替える（旧版は上書きしない）

```markdown
## 概要
- <PR の最小サマリ>

## 最新版HTML
[最新版のHTMLを開く](<確認済み latest R2 URL>)
```

- 確認済み URL のみ Markdown リンクで記載する。プレースホルダや推測 URL は禁止
- Issue 自動 close が必要なら、description 末尾に `Closes #<issue-number>` または repository で定めた closing keyword を追加してよい

### HTML 配布なし

HTML 配布がない通常の PR:

- PR description には、issue 側で完成させた Markdown を**そのまま**記載する
- 理由: repository 設定で squash merge 時に description（= プランニング）を merge commit message に自動反映できるため
- Issue 自動 close が必要なら、description 末尾に `Closes #<issue-number>` または repository で定めた closing keyword を追加してよい。これのみ issue Markdown への追記を許可する

### PR comment に記載する項目

本来 PR description に記載すべき次の項目は、**初回 comment**（または適宜 comment）に記載する。

- Reviewer 向け Summary
- 検証結果
- 関連情報（issue リンク、依存 PR など）
- 未確認事項または残リスク

次は GitHub PR UI に既に表示されるため、description にも comment にも**サマリとして記載しない**。

- コミット一覧
- GitHub Actions / CI 結果の一覧・要約
- 変更ファイル一覧

調査・障害対応で個別 check run へリンクが必要な場合のみ、comment / reply に URL リンクで記載してよい（`## PR description / comment のリンク化` 参照）。

## PR description / comment のリンク化

PR description / comment / reply の本文作成時、下記対象が本文に出るなら可能な限りリンク形式で記述する。
URL が未確定の対象は、URL 判明後に本文更新または comment / reply で補う。

- issue: `#<issue-number>`。別 repository なら `OWNER/REPO#<issue-number>`。
- PR: `#<pr-number>`。別 repository なら `OWNER/REPO#<pr-number>`。
- commit: `[{short commit id}]({PR base URL}/changes/{commit id})`。
- file: `[path/to/file](<repository URL>/blob/<branch-or-commit>/path/to/file)`。
- file line: `[path/to/file:L<line>](<repository URL>/blob/<branch-or-commit>/path/to/file#L<line>)`。
- review comment / thread: `[review comment](<comment URL>)`。
- CI / check run: 調査・障害対応が必要な場合のみ comment / reply に `[<check name>](<check run URL>)` で記載する。CI 結果の一覧・要約は書かない。
- R2 HTML（HTML 配布あり）: description の `[最新版のHTMLを開く](<確認済み latest R2 URL>)` に載せる。未確認 URL は載せない。

## PR 作成後

実施:

1. PR URL を issue に comment する。
1. reviewer を設定する。
1. issue status を review 待ちへ更新する。
1. CI / checks を確認する。
1. 失敗時は原因を調査し、必要なら issue / PR に状況を残す。

## Bot comment / review

PR conversation comment:

```sh
node .agents/credentials/github/scripts/github-agent-comment.mjs OWNER/REPO PR_NUMBER BODY_FILE
```

PR review comment:

```sh
node .agents/credentials/github/scripts/github-agent-review.mjs OWNER/REPO PR_NUMBER BODY_FILE --event COMMENT
```

Review event:

- `COMMENT`: 通知・確認・中立コメント。
- `APPROVE`: repository ルール上、AI agent approval が許されている場合だけ使う。
- `REQUEST_CHANGES`: 明確な blocker があり、repository ルール上 AI agent が requested changes を出してよい場合だけ使う。

## Review 対応

レビューコメント対応時:

- 未解決 thread / requested changes / CI failure を確認する。
- ユーザからの PR comment / review comment には必ず reply で応答する。
- 複数の review comment が 1 つの review に含まれる場合でも、各 review comment / thread ごとに個別 reply する。
- 指摘ごとに修正、説明、保留を分ける。
- 修正、説明、保留の内容は該当 comment / thread の reply に残す。
- 自分が作った unrelated change を混ぜない。

## 禁止事項

- Merge 処理
- 複数の comment がまとまった review に対して、まとめて 1 つの comment を作成して reply すること。

## 最終確認

- 1 issue 1 PR の対応になっているか。
- issue に PR URL を残したか。
- reviewer を設定したか。
- AI agent comment / review は bot credential で投稿したか。
- ユーザからの PR comment / review comment へ個別に reply したか。
- HTML 配布あり: PR description に最小サマリと確認済み最新 HTML リンクのみを記載したか。HTML 配布なし: issue 完成 Markdown をそのまま記載したか。
- Summary・検証結果・関連情報は PR comment に記載したか。
- PR description / comment に GitHub UI と重複する情報（コミット一覧・Actions・変更ファイル）を書いていないか。
- PR description / comment / reply のリンク化対象を可能な限りリンク形式で書いたか。
- gitleaks 失敗を回避していないか。
