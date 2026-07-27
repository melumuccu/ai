# @kf/lint

SvelteKit、CSS、Markdown、コミット、Docker、SKILL メタデータ向けに、agent skill 規約を決定論的 linter として提供する CLI。

**コマンド実行の前提**: 特記がない限り、リポジトリルートをカレントディレクトリとして記載する。pnpm は導入済みであること。

## 対象範囲

リポジトリ内 **43 件中 13 件** の skill を静的 lint ルールに変換している。残り 30 件は agent ワークフロー、文体、選定方針、文脈判断など、決定論的 lint に落とせない領域。

### 対応 skill（適合度 高 → 低）

| グループ | skill |
| --- | --- |
| A | SvelteKit architecture、CSS responsive/flex-grid/spacing/animations/typography/font-zoom、svelte-core-bestpractices、skill naming、commit message |
| B | Japanese markdown structure、Dockerfile layer headings |

## 開発

本パッケージは pnpm 単体で完結する。

```bash
pnpm --dir packages/kf-lint install --frozen-lockfile
pnpm --dir packages/kf-lint test
pnpm --dir packages/kf-lint verify
pnpm --dir packages/kf-lint smoke
```

mise 利用時:

```bash
mise -C packages/kf-lint run lint-kf
mise -C packages/kf-lint run lint-kf-smoke
```

補足（パッケージ cwd から直接実行する場合）:

```bash
cd packages/kf-lint
pnpm install --frozen-lockfile
pnpm test
pnpm verify
pnpm smoke
mise run lint-kf
mise run lint-kf-smoke
```

self-lint は `.kf-lintrc.json` で `fixtures/**` を除外。invalid fixture は `test/` から明示検証する。

## build と pnpm global install

ソースから tarball を作り、pnpm でグローバル install する手順。公開前のローカル検証や、PATH 上で `kf-lint` を直接実行したい開発者向け。

**補足**: 本パッケージに `build` script はない。配布用 tarball は `pack:local`（内部で `pnpm pack`）で生成する。

### tarball 生成

```bash
pnpm --dir packages/kf-lint install --frozen-lockfile
pnpm --dir packages/kf-lint pack:local
```

`pack:local` は `packages/kf-lint/tmp/kf-lint-<version>.tgz` を出力する（`tmp/` は gitignore）。

### pnpm global install

fish:

```fish
set VERSION (node -p "JSON.parse(require('fs').readFileSync('packages/kf-lint/package.json','utf8')).version")
pnpm add -g "./packages/kf-lint/tmp/kf-lint-$VERSION.tgz"
```

zsh/bash:

```bash
VERSION=$(node -p "JSON.parse(require('fs').readFileSync('packages/kf-lint/package.json','utf8')).version")
pnpm add -g "./packages/kf-lint/tmp/kf-lint-${VERSION}.tgz"
```

### install 後の確認

```bash
kf-lint --version
kf-lint verify /path/to/project   # 検証対象リポジトリ
```

### ソース更新時

1. パッケージソースを変更したら、tarball の再生成（`pack:local`）と global 再 install（`pnpm add -g ...`）が必要
1. global に install 済みの tarball はソース変更を自動反映しない

自動検証は `pnpm --dir packages/kf-lint smoke`（pack → global install → `--version` まで実行）。

## 導入

### リポジトリローカル（CI・チーム運用で推奨）

各リポジトリの `package.json` に `@kf/lint` を devDependency として pin する。ルール版は **インストールしたパッケージ版** に固定され、CI と開発者の結果が揃う。グローバル PATH への依存を避け、`pnpm exec` 経由で実行する。

#### tarball から導入（公開前・ローカル検証）

fish:

```fish
pnpm --dir packages/kf-lint pack:local
set VERSION (node -p "JSON.parse(require('fs').readFileSync('packages/kf-lint/package.json','utf8')).version")
pnpm --dir packages/kf-lint add -D "./tmp/kf-lint-$VERSION.tgz"
pnpm --dir packages/kf-lint exec kf-lint init   # .kf-lintrc.json を生成
pnpm --dir packages/kf-lint exec kf-lint verify .
```

zsh/bash:

```bash
pnpm --dir packages/kf-lint pack:local
VERSION=$(node -p "JSON.parse(require('fs').readFileSync('packages/kf-lint/package.json','utf8')).version")
pnpm --dir packages/kf-lint add -D "./tmp/kf-lint-${VERSION}.tgz"
pnpm --dir packages/kf-lint exec kf-lint init   # .kf-lintrc.json を生成
pnpm --dir packages/kf-lint exec kf-lint verify .
```

#### 公開後に registry から導入

導入先リポジトリのルートで実行する:

```bash
pnpm add -D @kf/lint@<version>
pnpm exec kf-lint init
pnpm exec kf-lint verify .
```

**pin を推奨する理由**

- CI とローカルで同一ルール版を保証できる
- チーム全員が同じ `@kf/lint` 版を使える
- グローバル install や PATH 差分の影響を受けない
- pre-commit / GitHub Actions で `pnpm exec kf-lint` をそのまま使える

### グローバル（開発者の便宜）

公開 registry から:

```bash
pnpm add -g @kf/lint
```

ローカル tarball から global install する手順は [build と pnpm global install](#build-と-pnpm-global-install) を参照。

グローバル install では PATH 上の `kf-lint` を直接実行できる。**ルール版はインストールしたパッケージに依存する。** CI 再現性のため、各リポジトリでは devDependency として pin すること。

## コマンド

```bash
kf-lint verify [paths...]          # ファイルを lint（省略時: cwd）
kf-lint verify --format json .
kf-lint commit-msg .git/COMMIT_EDITMSG
kf-lint init
kf-lint --version
```

リポジトリローカル導入時は `pnpm exec kf-lint ...` を使う。

## 設定

`.kf-lintrc.json`:

```json
{
  "extendsRecommended": true,
  "ignore": ["**/dist/**"],
  "rules": {
    "css/no-vw-vh": "error",
    "markdown/ordered-list-one": "warn"
  }
}
```

Severity: `error` | `warn` | `off`。

## 連携例（利用側で任意導入）

### mise

```toml
[tasks.lint-kf]
run = "pnpm exec kf-lint verify ."
```

### pre-commit

```yaml
- id: kf-lint
  name: kf-lint verify
  entry: pnpm exec kf-lint verify
  language: system
  types: [css, javascript, markdown, svelte, ts]
```

### commit-msg hook

```yaml
- id: kf-lint-commit-msg
  name: kf-lint commit message
  entry: pnpm exec kf-lint commit-msg
  language: system
  stages: [commit-msg]
```

### GitHub Actions

```yaml
name: kf-lint
on:
  push:
    paths: ["packages/kf-lint/**"]
jobs:
  verify:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/kf-lint
    steps:
      - uses: actions/checkout@v4
      - uses: jdx/mise-action@v2
      - run: mise run lint-kf
```

## Phase 1 ルール（blocking）

- `sveltekit/no-server-import-in-browser`
- `sveltekit/no-route-import-in-components`
- `sveltekit/no-svelte-import-in-server`
- `css/no-vw-vh`
- `css/no-flex-column`
- `css/no-transition-all`
- `css/keyframes-dashed-ident`

Fixtures: `fixtures/`。

## lint 化しないもの（skill / AI レビューに残す）

- Agent orchestration and delegation protocols
- Dependency selection and architecture trade-offs
- genshijin communication style
- CSS animation necessity、gap vs margin intent、grid-template preference
- Comment WHY/WHAT heuristics beyond URL-only detection

## パッケージ構成

```
packages/kf-lint/
  bin/kf-lint.js
  configs/recommended.json
  src/
    cli.js
    eslint/runner.js
    stylelint/runner.js
    rules/runners.js
  fixtures/
  test/
  tmp/          # pack 出力（gitignore）
```

## Smoke test（グローバル install 模擬）

推奨（shell 非依存）:

```bash
pnpm --dir packages/kf-lint smoke
# または
mise -C packages/kf-lint run lint-kf-smoke
```

手動:

fish:

```fish
pnpm --dir packages/kf-lint pack:local
set VERSION (node -p "JSON.parse(require('fs').readFileSync('packages/kf-lint/package.json','utf8')).version")
pnpm add -g "./packages/kf-lint/tmp/kf-lint-$VERSION.tgz"
kf-lint --version
kf-lint verify /path/to/project   # 検証対象リポジトリ
```

zsh/bash:

```bash
pnpm --dir packages/kf-lint pack:local
VERSION=$(node -p "JSON.parse(require('fs').readFileSync('packages/kf-lint/package.json','utf8')).version")
pnpm add -g "./packages/kf-lint/tmp/kf-lint-${VERSION}.tgz"
kf-lint --version
kf-lint verify /path/to/project   # 検証対象リポジトリ
```
