# ディレクトリ構成と meta 情報

## インストール前提

1. `kf-local` 以外の skill は vercel-labs/skills の `npx skills` で repo `melumuccu/ai` を指定し、作業マシンのグローバルへインストールする
1. `kf-local` はこのリポジトリ専用であり、グローバルインストール対象にしない

## ディレクトリ構成

skill は次の4バケットに分類する。

1. `.agents/skills/kf-global`: 自作グローバル skill。`npx skills add` 対象。`metadata.internal: true` は付与しない
1. `.agents/skills/kf-global-commands`: 自作グローバルコマンド。各 SKILL.md に `disable-model-invocation: true` 必須
1. `.agents/skills/external`: 外部 skill。`skills-lock.json` 管理。upstream 直接変更しない
1. `.agents/skills/kf-local/`: この repo のプロジェクト skill。各 SKILL.md に `metadata.internal: true` 必須（`npx skills add` 一覧と一括インストールから除外）

## meta 付与手順

### kf-local

frontmatter の `metadata:` マップ内に `internal: true` を置く。
トップレベル `internal: true` は使わない。

```yaml
---
name: example-skill
description: ...
metadata:
  internal: true
---
```

### kf-global-commands

frontmatter トップレベルに `disable-model-invocation: true` を置く。
`metadata` 内には置かない。

```yaml
---
name: example-command
description: ...
disable-model-invocation: true
---
```

### disable-model-invocation の適用範囲

1. `kf-global-commands` では必須
1. 他バケットでは自動発火させない skill に限って付与してよい
