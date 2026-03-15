# skills

## Setup

`mise` が未導入であれば先にインストールし、その後 Git がこのリポジトリのフックディレクトリを使うように設定します。

```sh
git config --local core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## Tasks

[.agents/skills/skills.json](.agents/skills/skills.json) を生成する:

```sh
mise run skills-json
```
