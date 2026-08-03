---
name: kf-g-github-issue-worktree-management
description: Use this skill whenever starting, planning, implementing, tracking, or closing GitHub issue work. Always use it when the user says to start implementation/planning from issues, asks to pick the next issue, or asks for issue-linked work, because issue work should use a dedicated worktree and continuous issue progress records.
---

# GitHub issue 管理と worktree 運用

この SKILL.md は入口として扱い、詳細は `references` 配下の該当ファイルを読む。
この skill は issue 対応の進め方を扱う。

GitHub 操作全般は `kf-g-github-operations-bot-workflow`、PR 作成・レビューは `kf-g-github-pr-review-workflow` も使う。

## 基本方針

- 1 issue = 1 branch = 1 worktree。
- issue 対応時は main worktree で直接作業しない。
- 作業ログ、判断、進捗、PR URL は issue comment に残す。
- 既存 issue からプランニングする場合、プランニング前に既存 issue の description と comment を参照する。詳細は [issue-progress.md](references/issue-progress.md)。
- HTML 配布あり（`kf-g-html-document-universal-single-file` で生成・R2 アップロード済み）: issue description は最小サマリと `## プランニング用資料` 配下の `[vN](<確認済み latest R2 URL>)` のみとする。計画全文・詳細は HTML に置く。description 更新のタイミングと形式は [issue-progress.md](references/issue-progress.md)。
- HTML 配布なし: プランニングしたら、計画 Markdown を issue description へ**そのまま**転記する。AI 側プランニングファイルには計画 Markdown を記載する代わりに issue リンクのみ記載する。詳細は [issue-progress.md](references/issue-progress.md)。
- AI agent が comment を残す時は GitHub App bot credential を優先する。

## Plan mode 中の GitHub 書き込み

Plan mode では確認前の GitHub 書き込みが禁止されていると判明した場合、Issue comment または description を更新する前にユーザーへ明示的な許可を求める。

1. GitHub 書き込みを実行する前に、更新対象（Issue comment / description）と更新内容の概要をユーザーへ明示する。
1. ユーザーから明示的な許可を得る。
1. 許可を得るまで GitHub 書き込みを実行しない。
1. 許可を得た後、本 skill の正規手順（[issue-progress.md](references/issue-progress.md) 等）に従って更新する。

## Branch / commit / push

- issue branch にだけ作業差分を作る。
- commit / push 前に実行される gitleaks が失敗したら commit / push しない。
  - hook 回避や `--no-verify` で進めない。
- gitleaks の詳細は `kf-g-github-operations-bot-workflow` を読む。

## 読み進め方

1. issue を選ぶなら [issue-selection.md](references/issue-selection.md) を読む。
1. GitHub Projects から issue を参照するなら [issue-reference.md](references/issue-reference.md) を読む。
1. worktree を作る・運用するなら [worktree.md](references/worktree.md) を読む。
1. 作業中の issue 更新や設計資料の切り分けなら [issue-progress.md](references/issue-progress.md) を読む。
1. PR 作成後の完了処理なら [completion.md](references/completion.md) を読む。
1. 作業完了前に [checklist.md](references/checklist.md) を確認する。

## 参照ファイル

- [issue-selection.md](references/issue-selection.md): issue 選定と依存関係
- [issue-reference.md](references/issue-reference.md): Projects 参照と GH_TOKEN
- [worktree.md](references/worktree.md): worktree 作成・命名・`.worktreeinclude`
- [issue-progress.md](references/issue-progress.md): 作業中の issue 更新と設計資料の切り分け
- [completion.md](references/completion.md): PR 後の完了処理と設計資料反映
- [checklist.md](references/checklist.md): 作業完了前の確認項目
