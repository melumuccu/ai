---
name: kf-g-project-bootstrap-new-project-rules
description: Use this skill when starting a new project and defining baseline repository rules, especially for devcontainer setup, mise-first tooling, pnpm security settings, Vite+ workflows, kiso.css adoption, and project-local post-edit lint/format hooks that run after AI agent file edits.
---

# 新規プロジェクト立ち上げルール

この SKILL.md は入口として扱い、詳細は `references` 配下の該当ファイルを読む。
PJ を新規に立ち上げるときの初期方針を揃えるための skill。
devcontainer と mise を土台に置き、frontend は pnpm + Vite+ + kiso.css を標準にする。
secret scan は gitleaks を GitHub Action と pre-commit framework の両方で組み込む。
linter / formatter は PJ ごとに選定し、AI エージェントによるファイル編集の直後に project hooks で lint/fmt を必ず走らせる。

## 使用するサービス

- mise
- pnpm
- Vite+
- Svelte / SvelteKit
- kiso.css
- gitleaks
- pre-commit
- PJ 選定の linter / formatter
- 編集後 lint/fmt 用の project hooks

## この skill を使う場面

- 新しい PJ を作る
- 新規リポジトリの初期構成を決める
- devcontainer や mise を含む開発基盤を最初から整える
- frontend の標準 toolchain を決める
- pnpm の supply chain 対策を初期設定へ組み込みたい
- secret scan を初期設定へ組み込みたい
- AI エージェント編集後の lint/fmt 自動実行を初期設定へ組み込みたい

## 基本方針

1. 開発環境は必ず devcontainer を作る。
1. tools と日常コマンドの中心は `mise.toml` に集約する。
1. frontend の package manager は pnpm に固定する。
1. frontend の build / dev / check / test は Vite+ の流れに寄せる。
1. Svelte / SvelteKit を採用する場合は、最新の安定版を使う。
1. reset css は kiso.css を pnpm で導入する。
1. secret scan は gitleaks を GitHub Action と pre-commit framework の両方で組み込む。
1. linter / formatter は PJ ごとに選定し、`package.json` scripts と `mise run` task に載せる。
1. AI エージェント編集後は project hooks で lint/fmt を必須実行する。Tab 補完後 hook は利用ツールが対応していれば設定する。

## 作業手順

1. PJ に frontend が含まれるか確認する。
1. VS Code の user settings.json にある `dev.containers.*`, `dotfiles.*` を確認する。→ [devcontainer-mise.md](references/devcontainer-mise.md)
1. user settings で既に効いている値と、PJ 固有で必要な値を切り分ける。→ [devcontainer-mise.md](references/devcontainer-mise.md)
1. `.devcontainer/` と `mise.toml` を先に設計する。→ [devcontainer-mise.md](references/devcontainer-mise.md)
1. frontend がある場合は `pnpm-workspace.yaml` を作り、pnpm のセキュリティ設定を先に入れる。→ [frontend-pnpm.md](references/frontend-pnpm.md)
1. `pre-commit` と `gitleaks` は `mise.toml` の `[tools]` へ入れ、`mise install` で導入する。→ [gitleaks-pre-commit.md](references/gitleaks-pre-commit.md)
1. `references/sample-files/` に該当するサンプルがあるか確認し、初期ファイル作成の起点にする。→ [devcontainer-mise.md](references/devcontainer-mise.md)
1. gitleaks の GitHub Action と `.pre-commit-config.yaml` を追加する。→ [gitleaks-pre-commit.md](references/gitleaks-pre-commit.md)
1. Vite+ を前提に scaffold と日常コマンドを決める。→ [frontend-vite-plus.md](references/frontend-vite-plus.md)
1. Svelte / SvelteKit を採用する場合は、最新安定版を前提に依存関係と scaffold を確認する。→ [frontend-vite-plus.md](references/frontend-vite-plus.md)
1. kiso.css を導入し、エントリ側で最初に読み込む。→ [frontend-vite-plus.md](references/frontend-vite-plus.md)
1. 言語・FW・既存 toolchain に合わせて linter / formatter を選定し導入する。→ [lint-fmt-hooks.md](references/lint-fmt-hooks.md)
1. lint / format コマンドを `package.json` scripts と `mise` task に載せる。初回のリポジトリ全体一括 format/lint fix はしない。→ [lint-fmt-hooks.md](references/lint-fmt-hooks.md)
1. project hooks 設定と編集後 lint/fmt 実行スクリプトをリポジトリへ置く。→ [lint-fmt-hooks.md](references/lint-fmt-hooks.md)
1. AI エージェント編集後に lint/fmt が走ることを手動試験する。利用ツールが Tab 補完後 hook を提供する場合はそれも確認する。→ [lint-fmt-hooks.md](references/lint-fmt-hooks.md)
1. `mise run hooks-install` で `pre-commit` と `pre-push` の local hook を有効化する。→ [gitleaks-pre-commit.md](references/gitleaks-pre-commit.md)
1. `pre-commit validate-config` と `pre-commit run --hook-stage pre-push` で hook 設定を検証する。→ [gitleaks-pre-commit.md](references/gitleaks-pre-commit.md)
1. 最後に `mise run` 系 task で install / dev / check / test / build / lint / format を揃える。
1. 作業完了前に [checklist.md](references/checklist.md) を確認する。

## 読み進め方

1. 開発基盤を扱うなら [devcontainer-mise.md](references/devcontainer-mise.md) を読む。
1. secret scan を扱うなら [gitleaks-pre-commit.md](references/gitleaks-pre-commit.md) を読む。
1. frontend の package manager や supply chain を扱うなら [frontend-pnpm.md](references/frontend-pnpm.md) を読む。
1. Vite+ / SvelteKit / kiso.css を扱うなら [frontend-vite-plus.md](references/frontend-vite-plus.md) を読む。
1. lint / format や編集後 hooks を扱うなら [lint-fmt-hooks.md](references/lint-fmt-hooks.md) を読む。
1. 初期ファイル生成時は `references/sample-files/` を確認する。
1. 作業完了前に [checklist.md](references/checklist.md) を確認する。

## 参照ファイル

- [devcontainer-mise.md](references/devcontainer-mise.md): devcontainer、mise、user settings、サンプルファイル運用
- [gitleaks-pre-commit.md](references/gitleaks-pre-commit.md): gitleaks と pre-commit / pre-push hook 運用
- [frontend-pnpm.md](references/frontend-pnpm.md): pnpm 固定と supply chain 設定
- [frontend-vite-plus.md](references/frontend-vite-plus.md): Vite+ / SvelteKit と kiso.css
- [lint-fmt-hooks.md](references/lint-fmt-hooks.md): linter / formatter 選定と編集後 hooks
- [checklist.md](references/checklist.md): 作業完了前の確認項目

## 最低限そろえる対象

frontend を含む新規 PJ では、少なくとも次を用意する。

- `.devcontainer/devcontainer.json`
- `.github/workflows/gitleaks.yml`
- `mise.toml`
- `.pre-commit-config.yaml`
- `pnpm-workspace.yaml`
- `package.json` の `packageManager`
- kiso.css を読み込む entry 側の style または import
- lint / format 用の `package.json` scripts と `mise run` task
- project hooks 設定（編集後 lint/fmt 登録）
- 編集後 lint/fmt 実行スクリプト
- `mise run` で叩ける install / dev / check / test / build / hooks-install task

## 出力方針

- 実際に新規 PJ を作る依頼では、方針説明だけで止めずに必要ファイルを作る。
- user settings から再利用した `dev.containers.*`, `dotfiles.*` と、PJ 側で追加した差分を短く説明する。
- pnpm の allowlist に package を追加した場合は、その理由を残す。
- Vite+ に乗らない例外を選んだ場合は、理由を明記する。
- 選定した linter / formatter と、編集後 hooks の登録先を短く説明する。
