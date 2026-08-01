---
name: kf-pj-kf-lint-version-upgrade
description: Use this skill whenever adding, editing, or deleting any file under packages/kf-lint. At the start, verify the package version; before completion, increment the SemVer patch version by one, read the README for the current install or upgrade command, and prompt the user to run that command.
---

# @kf/lint のバージョン更新手順

1. 作業開始時に `packages/kf-lint/package.json` を読み、現在の `version` を確認します。
1. `packages/kf-lint/README.md` を読み、install または upgrade の最新手順を取得します。
1. 作業完了前に、`packages/kf-lint/package.json` の SemVer patch version を一つ上げます。
1. ユーザーへの完了報告で、README に記載された install または upgrade コマンドの実行を促します。

README の install または upgrade コマンドは、毎回 README から取得してユーザーへ案内します。
