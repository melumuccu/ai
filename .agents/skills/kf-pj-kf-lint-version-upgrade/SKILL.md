---
name: kf-pj-kf-lint-version-upgrade
description: Use this skill whenever adding, editing, or deleting any file under packages/kf-lint. At the start, verify the package version; before completion, increment the SemVer patch version by one, read the README for the current install or upgrade command, prompt the user to run that command, and format commit messages with kf-lint@{ver} in the category.
---

# @kf/lint のバージョン更新手順

1. 作業開始時に `packages/kf-lint/package.json` を読み、現在の `version` を確認します。
1. `packages/kf-lint/README.md` を読み、install または upgrade の最新手順を取得します。
1. 作業完了前に、`packages/kf-lint/package.json` の SemVer patch version を一つ上げます。
1. ユーザーへの完了報告で、README に記載された install または upgrade コマンドの実行を促します。

README の install または upgrade コマンドは、毎回 README から取得してユーザーへ案内します。

## commit message のカテゴリ

`packages/kf-lint/package.json` の `version` を上げる commit では、1行目のカテゴリを **`kf-lint@{version}`** 形式にします。

- 形式: `<type_>: kf-lint@{version}_<subject>`
- `{version}` は bump 後の `package.json` の `version` と一致させる
- `kf-lint` だけ、`kf-lint_` だけ、バージョンなしの表記は使わない

### 例

```text
fix__: kf-lint@0.1.4_commit prefix検証を5文字固定に厳密化

- 概要:
  - 許可 prefix 一覧で commit lint を検証
  - @kf/lint を 0.1.4 に更新
- Why:
  - 0.1.2 の _+ 正規表現が chore: を誤拒否していた
```

version bump を含まない `packages/kf-lint` 変更（version 据え置きの修正のみ）では、この `kf-lint@{version}` 形式は不要です。通常のカテゴリ（例: `kf-lint_`）を使います。
