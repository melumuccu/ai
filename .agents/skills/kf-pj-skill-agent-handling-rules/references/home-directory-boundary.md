# ホームディレクトリ skill の境界

## 基本方針

ホームディレクトリ直下の skill は、vercel-labs/skills 同期結果として配置される読み取り参照先である。
エージェントは skill 本体を変更しない。

## 対象パス

次のパス配下の skill 本体は変更禁止とする。

- `~/.agent/skills/`
- `~/.agents/skills/`

## 必須手順

1. skill 修正依頼を受けた → 編集先を `.agents/skills/`（リポジトリ）に限定する
1. ホーム skill を参照する必要がある → 読み取りのみで内容を確認する
1. ホーム skill とリポジトリ skill に差分がある → [expected-differences.md](expected-differences.md) に従い正常と扱う
1. ユーザーがホーム側を最新化したい → [sync-after-merge.md](sync-after-merge.md) の手順を案内する

## 禁止事項

- ホームディレクトリ skill の `SKILL.md` や `references/` を直接編集しない
- リポジトリ側の修正をホーム側へ手動コピーして「同期完了」と報告しない
- ホーム skill の内容をリポジトリの正とみなして逆方向に反映しない

## 完了判定

1. ホームディレクトリ skill への Write / Delete を行っていない
1. 修正内容はリポジトリ側にのみ存在する
