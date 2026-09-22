# .agents ディレクトリ

このディレクトリには、AI エージェントに関する設定ファイルが配置されています。

- rules
- skills
- agents

## ディレクトリ構成

```
.agents/
├── custom/ ... 外部 skills 向けカスタマイズの正本
├── hooks/ ... Cursor hook 実装の正本（利用時は ~/.cursor/hooks へコピー）
├── rules/ ... ルールの設定ファイル
├── skills/ ... スキルの設定ファイル
└── \*.md ... エージェントの設定ファイル
```

### Cursor hooks（日本語校正）

`.agents/hooks/ai-ja-readability/` を正本とし、`install-to-cursor.sh` で `~/.cursor/hooks` に展開する。詳細は同ディレクトリの README を参照。
