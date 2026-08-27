# workflow の runs-on と label

## 必須形式

self-hosted で動かす **すべての job**（reusable workflow 内の job 含む）は次の形式に固定する。

```yaml
runs-on: [self-hosted, <repo-slug>]
```

`<repo-slug>` は GitHub リポジトリ名と同一（kebab-case）。例: `gitdoc-v2`, `hacksaw-shop`。

## 参照実装

[gitdoc-v2 PR #64](https://github.com/melumuccu/gitdoc-v2/pull/64) が正本。以下 3 workflow の全 self-hosted job で `runs-on: [self-hosted, gitdoc-v2]` へ統一されている。

| workflow | job |
|----------|-----|
| `.github/workflows/deploy.yml` | `cloudflare-workers` |
| `.github/workflows/preview.yml` | `deploy`, `cleanup` |
| `.github/workflows/gitleaks.yml` | `scan`（standalone。`on: pull_request` が正本） |

## standalone gitleaks workflow の `on:`

standalone の gitleaks（および同等の verify CI）では、`on:` に `pull_request` を置く。

`on:` には `pull_request` を置き、feature branch へのフィルタなし `push` は置かない。`push` と `pull_request` をフィルタなしで並べない。

default branch への直 push も CI したい場合だけ、`push.branches` を default branch に限定して追加する。

`on:` の正本は本節の完全 workflow サンプルとする。

## gitleaks workflow 完全サンプル

label + cache bootstrap + `mise run secrets:scan` を含む standalone 正本:

```yaml
on:
  pull_request:

jobs:
  scan:
    runs-on: [self-hosted, <repo-slug>]
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0
      - name: Configure cache directories
        run: |
          echo "MISE_DATA_DIR=$RUNNER_TOOL_CACHE/mise" >> "$GITHUB_ENV"
          mkdir -p "$RUNNER_TOOL_CACHE/mise"
      - uses: jdx/mise-action@v4
        with:
          cache: false
      - run: mise run secrets:scan
```

PJ へコピーする成果物は [`kf-g-project-bootstrap-new-project-rules` の `sample-files/.github/workflows/gitleaks.yml`](../../kf-g-project-bootstrap-new-project-rules/references/sample-files/.github/workflows/gitleaks.yml) を参照する。

## reusable workflow

`workflow_call` で呼ばれる側（gitleaks 以外の reusable job）も caller 側と同じ label 規約を守る。caller が `ubuntu-latest` でも、callee が self-hosted なら label 必須。

gitleaks の standalone workflow（`on: pull_request` 付き完全ファイル）が正本である。gitleaks を `workflow_call` として再利用する構成は本 skill の推奨対象外とする。

## 非推奨

```yaml
runs-on: self-hosted   # label なし。複数 repo runner 共存時に意図が読み取れない
runs-on: macOS         # GitHub hosted と混同しやすい
```

## ubuntu-latest との使い分け（bootstrap 向け）

| 用途 | 推奨 runner |
|------|-------------|
| gitleaks / build+deploy / preview（mise+pnpm 重い） | self-hosted + label |
| curl のみ deploy hook キック | `ubuntu-latest` のままでよい |
| secrets 不要の軽量 check | 要判断 |

## cache bootstrap との組み合わせ

`runs-on` / label は本 skill の担当。step 構成（`RUNNER_TOOL_CACHE` bootstrap、`mise-action` 等）は sibling skill [`kf-g-github-actions-self-hosted-ci-cache`](../../kf-g-github-actions-self-hosted-ci-cache/SKILL.md) を参照する。

gitleaks の step 構成は上記「gitleaks workflow 完全サンプル」を正本とする。
