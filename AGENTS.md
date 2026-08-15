# AGENTS.md

## Cursor Cloud specific instructions

このリポジトリは AI agent skill 群と、その規約を静的 lint 化した唯一の実行可能パッケージ `@kf/lint` (`packages/kf-lint`) で構成されます。

### toolchain

- toolchain は `mise.toml` が pin します (node v24 / pnpm latest / pre-commit / gitleaks)。update script が `mise` を `~/.local/bin` へ導入し `mise install` まで実行します。
- `mise` は shell へ自動 activate されません。tool を使うときは `~/.local/bin/mise exec -- <cmd>` を用いるか、`~/.local/bin/mise activate bash` を eval してください。
- 基底 image にも node v22 / pnpm 10 が別途存在します。`@kf/lint` は `node >=20` で動くため素の pnpm でも実行できますが、後述の理由から pnpm の major を混在させないでください。

### lint / test / run

- コマンドは新設せず既存の定義を参照します。`@kf/lint` の script は `packages/kf-lint/package.json` (`test` / `verify` / `lint`)、mise task は `packages/kf-lint/mise.toml` と ルート `mise.toml` にあります。
- `@kf/lint` は GUI を持たない CLI です。動作確認は `kf-lint verify <dir>` や `kf-lint commit-msg <file>` で違反検知と exit code を見ます。設定は `.kf-lintrc.json`。

### 非自明な注意点

- pnpm の major 版を混在させると `pnpm install` 実行時に `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` で停止します。ある major が作った `node_modules` を別 major で触ると発生します。回避するには mise の pnpm に統一するか、非対話環境では `CI=true` を付けてください。
- git hook (gitleaks) は既定では入りません。`mise run hooks-install` で pre-commit と pre-push を導入します。hook は `gitleaks` が PATH 上にある前提のため、mise を activate した shell で commit してください。
