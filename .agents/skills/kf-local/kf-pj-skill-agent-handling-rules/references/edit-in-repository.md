# リポジトリ skill を編集する

## 基本方針

skill 修正依頼を受けたら、必ずこのリポジトリの `.agents/skills/` 配下を編集する。
ホームディレクトリの skill を修正対象にしない。

## 必須手順

1. 修正対象 skill のディレクトリを `.agents/skills/<skill-name>/` で特定する
1. 対象が `skills-lock.json` 管理の外部 skill か確認する
1. 外部 skill の場合 → upstream 直接変更はせず、自作 skill で補完する方針を取る（`kf-g-skill-naming-creation-organization-rules` を参照）
1. 自作 skill の場合 → 当該ディレクトリ内の `SKILL.md` と `references/` を編集する
1. skill 追加・改名時 → `.claude-plugin/marketplace.json` の `kf-pj-skills` または該当 plugin へ反映する
1. 変更を commit し、PR 経由で main へマージする

## 禁止事項

- `~/.agent/skills` 配下の skill を修正依頼の対応先にしない
- `~/.agents/skills` 配下の skill を修正依頼の対応先にしない
- リポジトリ未マージの変更をホーム側へ先に反映しない

## 完了判定

1. 編集したファイルがすべて `.agents/skills/` 配下である
1. marketplace 更新が必要な変更であれば反映済みである
1. ホームディレクトリ skill に書き込みを行っていない
