# .agents ディレクトリ

このディレクトリには、AI エージェントに関する設定ファイルが配置されています。

- rules
- skills
- agents

## ディレクトリ構成

```
.agents/
├── rules/ ... ルールの設定ファイル
├── skills/ ... スキルの設定ファイル
└── \*.md ... エージェントの設定ファイル
```

---

（以下、 .agents ディレクトリ直下 = agents 設定ファイルに関する説明）

## agents 設定の sync 方法

### Cursor

以下を実行 -> ~/.cursor/.agents ディレクトリに sync される

```
scripts/sync-agents-for-cursor.sh
```
