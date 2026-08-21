# .agents/skills ディレクトリ

[vercel-labs/skills](https://github.com/vercel-labs/skills) を用いることで、このディレクトリの skills を local machine に global install 可能。

## ディレクトリ構成

```
.agents/skills/
├── #kf-global/          ... グローバル skills
├── #kf-global-commands/ ... グローバル commands
├── #kf-local/           ... ローカル skills
├── (... 外部 skills が続く)
```

ローカル skills は global install 対象外 (この repo 用の skills 群のため)。
