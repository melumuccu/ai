# skills

## Setup

`mise install` で `pre-commit` と `gitleaks` も入る。先に `mise` を使える状態にしてから進める。

```sh
mise install
mise run hooks-install
```

`hooks-install` は `pre-commit install` と `pre-commit install --hook-type pre-push` をまとめて実行する。

## Tasks

[.agents/skills/skills.json](.agents/skills/skills.json) を生成する:

```sh
mise run skills-json
```

フック設定を確認する:

```sh
mise run hooks-validate
```
