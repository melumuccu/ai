# skills

## Setup

`mise install` で `pre-commit` と `gitleaks` も入る。先に `mise` を使える状態にしてから進める。

```sh
mise install
mise run hooks-install
```

`hooks-install` は `pre-commit install` と `pre-commit install --hook-type pre-push` をまとめて実行する。

## Tasks

フック設定を確認する:

```sh
mise run hooks-validate
```

## @kf/lint

スキル規約を静的 lint 化した CLI。詳細は [packages/kf-lint/README.md](packages/kf-lint/README.md)。

```sh
pnpm --dir packages/kf-lint install
pnpm --dir packages/kf-lint test
```

## サブエージェント 設定の sync 方法

### Cursor

以下を実行 -> ~/.cursor/.agents ディレクトリに sync される

```
scripts/sync-agents-for-cursor.sh
```

## (PJ ごとに要対応) marketingskills カスタマイズ

グローバル skills として入れた coreyhaines31/marketingskills 向け。
正本は `.agents/custom/coreyhaines31/marketingskills/`。
コピー先は skill が読むパス（プロジェクトの `.agents/` と `~/marketing-plans/`）。

```
scripts/sync-marketingskills-custom-for-local.sh --project /path/to/product-repo
```
