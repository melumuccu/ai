---
name: kf-g-github-actions-self-hosted-runner-label
description: Use when authoring or bootstrapping GitHub Actions workflows that run on Mac Studio self-hosted runners with a repository-specific label. Covers runs-on label convention, runner-name pairing, bootstrap workflow integration, and prerequisites before merge.
---

# GitHub Actions self-hosted runner label 規約

この SKILL.md は入口として扱い、詳細は `references` 配下の該当ファイルを読む。
runner バイナリ install / launchd / token 取得は host 運用 README が正本。cache / mise 最適化は sibling skill `kf-g-github-actions-self-hosted-ci-cache` が担当する。

## 使う場面

- bootstrap で CI = Mac Studio self-hosted を **適用** するとき
- `.github/workflows/*.yml` を新規作成・改修するとき
- reusable workflow 内 job の `runs-on` を決めるとき
- self-hosted job が queue 待ちのまま進まないとき

## 前提

- Mac Studio（Apple Silicon / arm64）上の **repo 専用** self-hosted runner
- 1 repo = 1 runner プロセス。`<repo-slug>` label で workflow から runner を指定する
- host 運用手順: `~/projects/_github-selfhosted-actions-runner/README.md`

## 命名規約（要約）

| 概念 | 規約 | 例 |
|------|------|-----|
| `<repo-slug>` | GitHub リポジトリ名（kebab-case） | `gitdoc-v2`, `hacksaw-shop` |
| `<label>` | `<repo-slug>` と同一 | `gitdoc-v2` |
| `<runner-name>` | `macstudio-<repo-slug>` | `macstudio-gitdoc-v2` |
| config.sh labels | `self-hosted,macOS,ARM64,<repo-slug>` | — |
| workflow `runs-on` | `[self-hosted, <repo-slug>]` | 必須 |

## 読み進め方

1. `runs-on` 記述と reusable workflow → [workflow-runs-on-label.md](references/workflow-runs-on-label.md)
2. merge 前確認と troubleshooting → [runner-prerequisites.md](references/runner-prerequisites.md)
3. cache bootstrap / mise 分割 → `kf-g-github-actions-self-hosted-ci-cache`

## 共通チェック

- host 側 runner 登録が **workflow merge より先** か
- self-hosted で動かす **すべての job**（reusable 内含む）が `runs-on: [self-hosted, <repo-slug>]` か
- runner の `--labels` に `<repo-slug>` が含まれるか（Settings → Actions → Runners）
- cache 最適化が必要なら sibling skill の bootstrap step があるか

## 並列実行

- 1 runner プロセス = 同時 1 job
- repo ごとにプロセスを分ければ **repo 間は並列可**（例: gitdoc-v2 + hacksaw-shop 同時 CI）
- **同一 repo 内**の複数 job は 1 台 runner なら queue 待ち
