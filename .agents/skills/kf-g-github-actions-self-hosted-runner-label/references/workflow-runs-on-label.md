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
| `.github/workflows/gitleaks.yml` | `scan`（reusable。caller から呼ばれる側） |

## reusable workflow

`workflow_call` で呼ばれる側（例: gitleaks `scan` job）も caller 側と同じ label 規約を守る。caller が `ubuntu-latest` でも、callee が self-hosted なら label 必須。

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

gitleaks job の最小骨子（label + cache bootstrap）:

```yaml
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
