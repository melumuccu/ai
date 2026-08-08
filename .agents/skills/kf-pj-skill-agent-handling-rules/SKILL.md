---
name: kf-pj-skill-agent-handling-rules
description: Use this project skill whenever modifying, syncing, or deciding where to edit AI agent skills for this repository. Always use it when a skill change is requested, when comparing repository skills with home-directory skills under ~/.agent/skills, or when deciding whether vercel-labs/skills sync makes repository vs home differences expected.
---

# skill 編集・同期の取り扱い

このリポジトリの skill を編集・同期・比較するときは、リポジトリ側を正とし、ホームディレクトリ直下の skill は読み取り専用として扱う。

## 参照ファイル

- [references/overview.md](references/overview.md) — 着手時: 基本原則・適用範囲・完了判定を確認するとき
- [references/edit-in-repository.md](references/edit-in-repository.md) — 着手時: skill 修正依頼の編集先を決めるとき
- [references/home-directory-boundary.md](references/home-directory-boundary.md) — 着手時: ホームディレクトリ skill への触れ方を確認するとき
- [references/sync-after-merge.md](references/sync-after-merge.md) — 着手時: main マージ後の同期前提を確認するとき
- [references/expected-differences.md](references/expected-differences.md) — 着手時: リポジトリとホームの差分を評価するとき

## 読み進め方

1. [references/overview.md](references/overview.md) を読み、基本原則と適用範囲を確認する
1. 依頼内容に応じて上記参照ファイルの1つ以上を開く
1. 各参照の必須手順に従い、編集先・禁止事項・同期前提を確定する
1. 下記「最終チェック」で完了判定する

## 最終チェック

1. skill 修正は `.agents/skills/` 配下（このリポジトリ）だけで行っている
1. `~/.agent/skills` および `~/.agents/skills` 配下の skill 本体を変更していない
1. main マージ後の同期は vercel-labs/skills 経由であることを前提に説明している
1. リポジトリとホーム間の差分を異常と扱っていない
