# .agents ディレクトリ

このディレクトリには、AI エージェントに関する設定ファイルが配置されています。

- rules
- skills
- agents

## ディレクトリ構成

```
.agents/
├── custom/ ... 外部 skills 向けカスタマイズの正本
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

## marketingskills カスタマイズの sync 方法

グローバル skills として入れた coreyhaines31/marketingskills 向け。
正本は `.agents/custom/coreyhaines31/marketingskills/`。
コピー先は skill が読むパス（プロジェクトの `.agents/` と `~/marketing-plans/`）。

```
scripts/sync-marketingskills-custom-for-local.sh --project /path/to/product-repo
```
