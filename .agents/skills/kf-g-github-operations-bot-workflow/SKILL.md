---
name: kf-g-github-operations-bot-workflow
description: Use this skill whenever working with GitHub issues, pull requests, comments, reviews, repository metadata, or agent-authored GitHub activity. Always use it before posting GitHub comments or reviews, checking remote repository context, or deciding whether GitHub App bot credentials are available.
---

# GitHub 操作と AI agent bot 投稿

この skill は GitHub 操作全般の基本ルール。
issue 管理の進め方は `kf-g-github-issue-worktree-management`、PR 作成・レビューの詳細は `kf-g-github-pr-review-workflow` も使う。

## 基本方針

- GitHub 上の issue / PR / comment / review 操作は `gh` または GitHub API で行う。
- AI agent が GitHub に comment / review を残す時は、ユーザ本人 token ではなく GitHub App bot credential を優先する。
- 投稿者を人間ユーザと分けるため、`.agents/credentials/github/scripts/github-agent-comment.mjs` と `github-agent-review.mjs` が使えるならそれを使う。
- secret や token を出力しない。token 確認時は期限、権限、repository selection など非秘密情報だけ表示する。

## Repository Context

作業開始時に remote URL を確認する。

```sh
git remote -v
```

## GitHub App credentials

AI agent 用 credential は repository local の `.agents/credentials/github` を使う。
このディレクトリは local-only で、git 管理しない。

### setup

PJ local に `.agents/credentials/github` が存在しない場合:

1. sample credential ディレクトリを repository local の `.agents/credentials/github` へコピーする。
1. sample 配下のファイル群をすべてコピーする
1. `.agents/credentials/github/.env.example` を `.agents/credentials/github/.env` にリネームする
（ここまでを AI agent の作業対象とする）
1. コピー後、残りのユーザ作業をチャットに出力する。

注: AI agent が secret を作成、推測、生成、貼り付けしない。

コマンド例:

```sh
mkdir -p .agents/credentials/github

cp -R .agents/skills/kf-g-github-operations-bot-workflow/sample/. \
  .agents/credentials/github/

mv .agents/credentials/github/.env.example \
  .agents/credentials/github/.env
```

コピー元: この skill 配下の下記ディレクトリ

```text
sample
```

コピー先: local repository 配下の下記ディレクトリ

```text
.agents/credentials/github
```

ユーザへ出力する残作業:

1. `.env` に `AI_AGENT_GITHUB_CLIENT_ID`、`AI_AGENT_GITHUB_INSTALLATION_ID`、`AI_AGENT_GITHUB_PRIVATE_KEY_PATH` を記入する。
1. GitHub App の private key ( `ai-agent-melumuccu.{YYYY-MM-DD}.private-key.pem` )  を `.agents/credentials/github` 直下へ配置する。
1. `.env` と private key に `chmod 600` を設定する
   コマンド例

    ```sh
    chmod 600 .agents/credentials/github/.env
    chmod 600 .agents/credentials/github/ai-agent-melumuccu.{YYYY-MM-DD}.private-key.pem
    ```

1. 設定完了後、AI agent に GitHub bot 投稿の再実行を依頼する。

## Bot comment / review

Issue または PR conversation comment:

```sh
node .agents/credentials/github/scripts/github-agent-comment.mjs OWNER/REPO ISSUE_OR_PR_NUMBER BODY_FILE
```

PR review comment:

```sh
node .agents/credentials/github/scripts/github-agent-review.mjs OWNER/REPO PR_NUMBER BODY_FILE
```

運用:

- 投稿本文は一時ファイルに作る。
- 投稿後、URL をユーザに報告する。
- 失敗時は HTTP status と GitHub API message を読む。
- user token に自動 fallback しない。bot credential が壊れている場合は原因を直す。

Token:

- `github-agent-comment.mjs` / `github-agent-review.mjs` は投稿直前に installation token を発行する。
- 長期間未使用でも、`.env` と private key が有効ならユーザ操作は不要。
- `github-agent-token.mjs` の手動実行は診断用。通常投稿前に毎回実行しなくてよい。

## gitleaks

commit / push 時に gitleaks で検知された場合:

- commit / push 禁止。
- `--no-verify` 禁止。
- hook 削除、scan 弱体化、除外設定追加による回避禁止。
- まず検知内容を修正する。
- 誤検知に見える場合も、ignore 追加前にユーザへ確認する。

## 最終確認

- GitHub 操作先 remote を確認したか。
- bot credential がある場合、bot script で投稿したか。
- token / secret を出力していないか。
- gitleaks 失敗を回避していないか。
- GitHub comment / review URL をユーザへ報告したか。
