# `.agents/skills` ディレクトリ

エージェント作業と `skills update` の原本。

## ディレクトリ構成

```
.agents/skills/
├── #kf-global/          ... グローバル skills
├── #kf-global-commands/ ... グローバル commands
├── #kf-local/           ... ローカル skills
├── (... 外部 skills が続く)
```

ローカル skills は global install 対象外 (この repo 用の skills 群のため)。

## 外部 skills の原本と配信用コピー

[vercel-labs/skills](https://github.com/vercel-labs/skills) で global install する対象のうち、lock 追跡の外部 skill の発見経路は [`.agents-external-skills`](../../.agents-external-skills/README.md) 側。
このディレクトリ配下かつ `skills-lock.json` に載る外部 skill は、latest `skills add` の発見時に捨てられる。

`.agents-external-skills/<name>` に、lock 追跡の外部 skill の実体コピーがある。

latest CLI はエージェント用ディレクトリ配下の lock 済み skill を add 一覧から外す。
一覧に載せる実体を、このディレクトリの外へ置く必要がある。
symlink は CLI の walk がディレクトリだけを見るため使えない。

外部 skill の本文は直接変更しない。
更新は upstream 取り込み、不足は自作 skill で補完する。
配信用の skill ディレクトリは `scripts/sync-external-skills.mjs` がコピーする。
配信用直下の `README.md` は同期で消えない。ディレクトリ単位の差し替えのみ。
