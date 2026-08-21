---
name: kf-pj-skill-agent-handling-rules
description: Use this project skill whenever modifying, syncing, or deciding where to edit AI agent skills for this repository. Always use it when a skill change is requested.
---

# skill 編集・同期の取り扱い

このリポジトリの skill を編集・同期・比較するときは、リポジトリ側を正とし、ホームディレクトリ直下の skill は読み取り専用として扱う。

## 参照ファイル

- [references/overview.md](references/overview.md) — 着手時: 基本原則・適用範囲・完了判定を確認するとき
- [references/edit-in-repository.md](references/edit-in-repository.md) — 着手時: skill 修正依頼の編集先を決めるとき

## 読み進め方

1. [references/overview.md](references/overview.md) を読み、基本原則と適用範囲を確認する
1. skill 修正依頼の場合は [references/edit-in-repository.md](references/edit-in-repository.md) を読み、編集先・禁止事項を確定する
1. 下記「最終チェック」で完了判定する

## 最終チェック

1. skill 修正は `.agents/skills/` 配下（このリポジトリ）だけで行っている
1. `~/.agent/skills` および `~/.agents/skills` 配下の skill 本体を変更していない
1. main マージ後の同期は vercel-labs/skills 経由であることを前提に説明している
1. リポジトリとホーム間の差分を異常と扱っていない
