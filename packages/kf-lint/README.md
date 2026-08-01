# @kf/lint

SvelteKit、CSS、Markdown、コミット、Docker、SKILL メタデータ向けに、agent skill 規約を決定論的 linter として提供する CLI。

**コマンド実行の前提**: 特記がない限り、リポジトリルートをカレントディレクトリとして記載する。pnpm は導入済みであること。

## 使用方法

```bash
cd {検査したい dir}
kf-lint verify
```

## 開発

本パッケージは pnpm 単体で完結する。

```bash
pnpm --dir packages/kf-lint ...
```

mise 利用時:

```bash
mise -C packages/kf-lint run ...
```

## install / upgrade (pnpm)

ソースから tarball を作り、pnpm でグローバル install / upgrade する手順。公開前のローカル検証や、PATH 上で `kf-lint` を直接実行したい開発者向け。

```bash
mise -C packages/kf-lint run lint-kf-smoke
```

## 設定

`.kf-lintrc.json`:

```json
{
  "extendsRecommended": true,
  "ignore": ["**/dist/**"],
  "rules": {
    "css/no-vw-vh": "error",
    "markdown/ordered-list-one": "warn"
  }
}
```

Severity: `error` | `warn` | `off`。
