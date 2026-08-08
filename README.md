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
