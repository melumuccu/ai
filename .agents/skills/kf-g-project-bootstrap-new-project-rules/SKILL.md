---
name: kf-g-project-bootstrap-new-project-rules
description: Use this skill when starting a new project and defining baseline repository rules, especially for devcontainer setup, mise-first tooling, pnpm security settings, Vite+ workflows, kiso.css adoption, and project-local post-edit lint/format hooks that run after AI agent file edits.
---

# 新規プロジェクト立ち上げルール

この skill は、PJ を新規に立ち上げるときの初期方針を揃えるためのものです。
まず devcontainer と mise を土台に置き、その上で frontend は pnpm + Vite+ + kiso.css を標準にします。
加えて、secret scan は gitleaks を GitHub Action と pre-commit framework の両方で組み込みます。
linter / formatter は PJ ごとに選定し、AI エージェントによるファイル編集の直後に project hooks で lint/fmt を必ず走らせます。

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
1. VS Code の user settings.json にある `dev.containers.*`, `dotfiles.*` を確認する。
1. user settings で既に効いている値と、PJ 固有で必要な値を切り分ける。
1. `.devcontainer/` と `mise.toml` を先に設計する。
1. frontend がある場合は `pnpm-workspace.yaml` を作り、pnpm のセキュリティ設定を先に入れる。
1. `pre-commit` と `gitleaks` は `mise.toml` の `[tools]` へ入れ、`mise install` で導入する。
1. `references/sample-files/` に該当するサンプルがあるか確認し、初期ファイル作成の起点にする。
1. gitleaks の GitHub Action と `.pre-commit-config.yaml` を追加する。
1. Vite+ を前提に scaffold と日常コマンドを決める。
1. Svelte / SvelteKit を採用する場合は、最新安定版を前提に依存関係と scaffold を確認する。
1. kiso.css を導入し、エントリ側で最初に読み込む。
1. 言語・FW・既存 toolchain に合わせて linter / formatter を選定し導入する。
1. lint / format コマンドを `package.json` scripts と `mise` task に載せる。初回のリポジトリ全体一括 format/lint fix はしない。
1. project hooks 設定と編集後 lint/fmt 実行スクリプトをリポジトリへ置く。
1. AI エージェント編集後に lint/fmt が走ることを手動試験する。利用ツールが Tab 補完後 hook を提供する場合はそれも確認する。
1. `mise run hooks-install` で `pre-commit` と `pre-push` の local hook を有効化する。
1. `pre-commit validate-config` と `pre-commit run --hook-stage pre-push` で hook 設定を検証する。
1. 最後に `mise run` 系 task で install / dev / check / test / build / lint / format を揃える。

## PJ全体

### 1. devcontainer を必須にする

- `.devcontainer/devcontainer.json` を必ず作る。
- runtime や package manager の版管理は devcontainer 内に分散させず、原則 `mise.toml` を正本にする。
- devcontainer では `mise install` を実行して、PJ が要求する tool 群を揃える。
- `postCreateCommand` や同等の初期化処理は、`mise install` と `mise run` を中心に組む。
- apt, brew, curl などで個別に runtime を入れるのは、mise で扱えない OS パッケージに限る。

### 2. user settings の dev.containers・dotfiles 設定を先に確認する

- まず user settings.json の `dev.containers.*`, `dotfiles.*` を確認する。
- 既に user settings にある値は、devcontainer 側へ重複して書かない。
- 特に `dev.containers.defaultExtensions` に含まれる拡張は、PJ 固有の理由がない限り `.devcontainer/devcontainer.json` の `customizations.vscode.extensions` へ重複追加しない。
- `dev.containers.copyGitConfig` のような user 方針も、PJ 側で上書きが必要なときだけ明示する。
- override が必要な場合は、なぜ user 設定ではなく PJ 側に置くのかを説明できる状態にする。
- `dotfiles.repository` で指定されたリポジトリの dotfiles は devcontainer 内で常に効く前提で、PJ 固有の devcontainer 設定を考える。

### 3. mise をフル活用する

`mise.toml` は単なる version 指定ファイルとしてではなく、PJ の開発基盤の中心として扱う。

必須方針:

- `[tools]` で runtime と主要 CLI を管理する。
- `[env]` で PJ 固有の環境変数を管理する。
- `[tasks]` で install / dev / check / test / build / lint / format などの日常コマンドを管理する。
- コマンド実行は `mise run <task>` または `mise exec -- <command>` を優先する。
- README や devcontainer の手順も `mise` ベースで統一する。
- CI でもローカルと同じ `mise` task 名を使い、コマンド定義を二重化しない。

活用観点:

- runtime の version は `[tools]` に寄せる。
- `.env` 読み込みが必要なら `[env]` の `_.file` を使う。
- `node_modules/.bin` や独自 bin を通したいなら `[env]` の `_.path` を使う。
- 必須 secret や接続先は `required = true` で明示する。
- OS 依存や install 順依存がある tool は `os` と `depends` を使って `mise.toml` に閉じ込める。

### 4. devcontainer と mise の役割分担

- devcontainer は「実行場所」を揃える。
- mise は「PJ が必要とする tools / env / tasks」を揃える。
- 同じ version 情報を Dockerfile と `mise.toml` の両方に持たない。
- Dockerfile へ version を直書きするのは、base image の都合で避けられない場合だけにする。
- 日常コマンドは shell script の散在より `mise run` を優先する。

### 5. サンプルファイルを初期ファイルの起点にする

- `references/sample-files/` 配下は、新規 PJ に置く設定ファイルのサンプルとして扱う。
- 生成対象と同じ相対パスや同じファイル名のサンプルがある場合は、まずその内容を読む。
- サンプルがあるファイルは、ゼロから書き起こさず、サンプルを起点に PJ 固有の値だけ調整する。
- サンプルの内容と本文ルールが食い違う場合は、本文ルールを優先し、必要ならサンプル側の更新も検討する。
- サンプルがないファイルは、この skill の基本方針に従って新規作成する。

### 6. secret scan は gitleaks で標準化する

- GitHub Action と pre-commit の設定は、`gitleaks/gitleaks` の README を参照して組む。
- `pre-commit` と `gitleaks` は brew ではなく `mise` で入れる。`mise install` を導入の基準にする。
- `GITLEAKS_LICENSE` は個人アカウント利用を前提に不要とし、既定では設定しない。Organization 向け要件が明確な場合だけ別途検討する。
- local の macOS でも `mise install` を前提にし、devcontainer 環境でも同じ `mise` の導線で入るように整える。

pre-commit framework の運用:

- commit 前の検査と push 前の検査は分ける。
- `.pre-commit-config.yaml` では、gitleaks hook を `pre-commit` 専用にする。
- push 前に実行する hook は `pre-push` 専用にする。
- 各 hook の `stages` を明示し、`pre-push` で同じ gitleaks が 2 回走らないようにする。
- gitleaks hook は `stages: [pre-commit]` を基本にする。
- push 用 hook は `stages: [pre-push]` を基本にする。
- local hook の導入は、`pre-commit install` と `pre-commit install --hook-type pre-push` の両方を実行する。
- hook 導入手順は `mise run hooks-install` にまとめる。
- hook 設定の検証は `pre-commit validate-config` と `pre-commit run --hook-stage pre-push` で行う。

### 7. linter / formatter と編集後 hooks

本節の焦点は、特定の linter / formatter や特定の AI 製品を固定することではない。
**編集後 lint/fmt の自動実行**を新規 PJ の必須要件として組み込むこと。

#### linter / formatter の扱い

- linter / formatter は PJ ごとに選定する。言語・FW・既存 toolchain に合わせる。
- この skill 本文に、特定ツール名・設定ファイル名・設定値の固定例は書かない。
- PJ で lint / format コマンドを決め、`package.json` scripts と `mise run` task の両方に載せる。
- lint / format の日常実行入口は `mise run` に集約する。CI でも同じ task 名を使えるようにし、コマンド定義を二重化しない。
- 初回のリポジトリ全体一括 format / lint fix はしない。hooks は編集されたファイルだけを処理する。

#### ignore の扱い

- 各 linter / formatter が `.gitignore` を自動尊重する前提で設計する。
- `.gitignore` の内容を hooks や設定へ重複列挙しない。
- hooks 側で `.gitignore` を動的パースする必要は原則なし。
- 追加除外が必要な場合のみ、各ツールの ignore 設定を使う。これは PJ 判断。

#### 編集後 lint/fmt hooks

新規 PJ では **project 単位** で編集後 lint/fmt を走らせる。

配置:

- リポジトリ内の project hooks 設定と実行スクリプトを置く。
- user / global 設定への依存は標準にしない。

トリガー:

- 必須: AI エージェントによるファイル編集後（after agent edit）
- 任意: Tab（インライン補完）によるファイル編集後（after tab edit）。利用中ツールが該当 hook を提供する場合のみ設定。未提供なら省略可
- 1 本の共通スクリプトを両トリガーで共用してよい
- 実行 cwd は project root 前提

ツール非依存の要件（実装は PJ が選ぶ AI エディタ / エージェントの hooks 機能に合わせる）:

- hook 入力から編集対象 `file_path` を取得する
- PJ で定義した lint / format コマンドをそのファイルに対して実行する
- 対象外拡張子は no-op
- fail-open（編集フローを止めない）
- 結果はログで確認可能にする

記述方針:

- 特定 AI 製品名は固定しない
- 「利用中の AI エージェント / エディタが提供する project hooks で、編集後イベントに lint/fmt スクリプトを登録する」と書く
- Tab 補完後 hook は「存在すれば設定する（推奨）」に留め、必須要件にしない
- hooks の設定ファイル名・イベント名は参考例として括弧書き可。必須仕様にはしない
- 正本はイベント概念（after agent edit / after tab edit if available）とする。将来ツールが変わっても意図が崩れないようにする

既存方針との関係:

- devcontainer / mise / pnpm / gitleaks / pre-commit / Vite+ / kiso.css などの既存必須方針は維持する
- pre-commit / CI への lint/fmt 組み込みは本 skill では必須にしない。主目的は編集後 hooks 実行。将来拡張可能

骨格サンプル:

- `references/sample-files/scripts/lint-fmt-edited-file.sh`
- `references/sample-files/hooks/project-hooks.example.json`
- 配置先ディレクトリ名と設定ファイル名は、利用ツールの project hooks 仕様に合わせて置き換える

## フロントエンド

### 1. package manager は pnpm 固定

- Node.js 系の package manager は pnpm だけを使う。
- npm / yarn / bun を併用しない。
- lockfile は `pnpm-lock.yaml` のみを正本にする。
- `package.json` の `packageManager` は pnpm に固定する。
- pnpm 自体の導入も `mise.toml` の `[tools]` で管理する。

### 2. pnpm の supply chain ルールを最初に入れる

pnpm の security 設定は `pnpm-workspace.yaml` へ置く。single package 構成でも、このファイルを作って設定を入れる。

初期値:

```yaml
minimumReleaseAge: 10080
strictDepBuilds: true
blockExoticSubdeps: true
trustPolicy: no-downgrade
onlyBuiltDependencies: []
```

運用ルール:

- `minimumReleaseAge` は 7日間、つまり `10080` 分で固定する。
- lifecycle script を実行させる package は、`onlyBuiltDependencies` に明示的に許可したものだけにする。
- install 時に未承認 script が出たら、その package が本当に必要かをレビューしてから allowlist へ追加する。
- `strictDepBuilds: true` にして、未承認 script を CI で見逃さない。
- `blockExoticSubdeps: true` にして、推移的依存の git / tarball URL を遮断する。
- `trustPolicy: no-downgrade` にして、公開経路の信頼性低下を検知する。
- project local の `.npmrc` に機密情報や token helper を置かない。

### 3. Vite+ の ecosystem に乗る

- frontend の scaffold は、まず Vite+ で組めるかを確認する。
- 新規作成の標準フローは `vp create` `vp install` `vp dev` `vp check` `vp test` `vp build` `vp run` を基本にする。
- framework を選ぶときは、Vite plugin として自然に乗るものを優先する。
- Svelte / SvelteKit を選ぶ場合は、リリース種別を確認し、最新の安定版を採用する。
- preview / next / rc などの不安定版は、明確な採用理由がある場合だけ使う。
- lint / format / type-check / test / build は、Vite+ が前提にしている toolchain を優先し、無関係な tool をむやみに混在させない。
- `mise` task も Vite+ のコマンド群を包む形で定義する。
- Vite+ に乗らない構成を採る場合は、採用理由を先に明確にする。

### 4. reset css は kiso.css を採用する

- reset css は kiso.css を標準採用する。
- 導入は `pnpm add kiso.css` で行う。
- app の entry stylesheet か main entry から、project 固有の style より先に読み込む。
- CDN 参照や vendor copy を既定にせず、pnpm 経由で依存管理する。
- 日本語向け設計、低い詳細度、accessibility 配慮、モダン HTML/CSS 対応を前提に採用する。

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

## 最終チェック

- devcontainer を作成したか。
- user settings の `dev.containers.*`, `dotfiles.*` を確認したか。
- `mise.toml` が tools / env / tasks の中心になっているか。
- `mise.toml` の `[tools]` に `pre-commit` と `gitleaks` を載せているか。
- `references/sample-files/` の該当サンプルを確認したか。
- `.github/workflows/gitleaks.yml` で公式 gitleaks action を設定したか。
- `.pre-commit-config.yaml` で `pre-commit` 用 hook と `pre-push` 用 hook の `stages` を明示したか。
- `mise run hooks-install` で `pre-commit install` と `pre-commit install --hook-type pre-push` の両方を実行できるか。
- `pre-commit validate-config` と `pre-commit run --hook-stage pre-push` で hook 設定を検証したか。
- GitHub Action に `GITHUB_TOKEN` を渡し、`GITLEAKS_LICENSE` を不要な既定値として扱っているか。
- frontend なら package manager が pnpm に固定されているか。
- `pnpm-workspace.yaml` に `minimumReleaseAge: 10080` を入れたか。
- Vite+ のコマンド群に寄せた構成になっているか。
- Svelte / SvelteKit を採用する場合、最新安定版を使っているか。
- kiso.css を pnpm で導入しているか。
- lint / format コマンドを `package.json` scripts と `mise run` task に載せたか。
- project hooks に AI エージェント編集後の lint/fmt を登録したか。
- 編集後に対象ファイルへ lint/fmt が走ることを確認したか。
- 利用ツールが Tab 補完後 hook を提供する場合、その登録も確認したか。
