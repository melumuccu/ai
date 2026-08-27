# pre-push で全テスト実行

## 方針

- push 前に PJ 内の全テストを実行する。
- 1 件でも失敗したら push を止める（hook が非ゼロ終了）。
- pre-commit framework の `pre-push` stage で実行する。`.pre-commit-config.yaml` に `stages: [pre-push]` の hook として載せる。
- gitleaks は `stages: [pre-commit]` のみに置く（[gitleaks-pre-commit.md](gitleaks-pre-commit.md)）。pre-push には test 用 hook を置く。

## 前提

- `mise.toml` に `test` task があり、`mise run test` で全テストが走ること（[devcontainer-mise.md](devcontainer-mise.md) の mise 日常 task 一式）。
- frontend あり PJ では Vite+ の test コマンドを `test` task に載せる（[frontend-vite-plus.md](frontend-vite-plus.md)）。
- backend のみ PJ では、その言語の test runner を `test` task に集約する。

## `.pre-commit-config.yaml`

- `stages: [pre-push]` の local hook を追加する。
- gitleaks hook（`stages: [pre-commit]`）と同じ `.pre-commit-config.yaml` に共存してよい。stage が異なるため、pre-push では test hook のみが走る。
- hook 例:

```yaml
      - id: test-pre-push
        name: Run all tests before push
        entry: mise run test
        language: system
        pass_filenames: false
        always_run: true
        stages:
          - pre-push
```

## 検証

- `pre-commit run test-pre-push --hook-stage pre-push` で手動実行できること。
- 意図的に失敗するテストを置き、`git push` が拒否されることを確認する。

## 不適用

- テストを書かない PJ、または `test` task を定義しない PJ では **不適用**。
