# ai-ja-readability（Cursor hooks）

Cursor エージェントの日本語出力を、`kf-g-writing-japanese-tech` と genshijin **丁寧** に沿って二次校正する hook 実装です。正本はこのリポジトリの `.agents/hooks/ai-ja-readability/` に置き、利用時は `~/.cursor/hooks` へコピーして `~/.cursor/hooks.json` から呼び出します。

**引き継ぎ・要件一覧:** [HANDOFF.md](./HANDOFF.md)

方針ドキュメント（v4）: [日本語校正 hook の実装方針 v4](https://ai-html.hacksaw.work/2026-09-22_%E6%97%A5%E6%9C%AC%E8%AA%9E%E6%A0%A1%E6%AD%A3hook%E6%96%B9%E9%87%9D_v4.html)

## できること

| Hook | 動作 |
| --- | --- |
| `afterAgentResponse` | 最終メッセージを校正し、変更があれば `{CURSOR_PROJECT_DIR}/artifacts/ja-reply/` に Markdown を保存 |
| `afterFileEdit` / `afterTabFileEdit` | 編集後ファイルの Markdown 地の文、または `#` / `//` 行コメントを校正して書き戻し |

チャット吹き出しの置き換えはできません（observe-only）。`stop` / `followup_message` は使いません。

## インストール（手元の Cursor）

```sh
./.agents/hooks/ai-ja-readability/install-to-cursor.sh
```

`~/.cursor/hooks.json` に `hooks.json.example` と同じエントリを追加します。コマンドパスは `~/.cursor/` からの相対パスです。

## 環境変数

| 変数 | 用途 |
| --- | --- |
| `GEMINI_API_KEY` | Other models 枠を使えないときの Gemini API（`gemini-3.8-flash`） |
| `JA_REWRITE_CURSOR_CLI_MODEL` | 枠が余っているときの `agent --model`（`agent --list-models` で確認） |
| `JA_REWRITE_INNER=1` | 再入防止（hook 自身と CLI 子プロセス用。通常は触らない） |

Cursor 設定画面の Google API キーは登録しないでください（BYOK 固定になります）。

## ログ

`~/.cursor/logs/ai-ja-readability.log` に JSON 行で記録します。本文はログに残しません。

## 開発

```sh
cd .agents/hooks/ai-ja-readability
python3 -m unittest discover -s tests -p 'test_*.py'
```

## skill の読み方

実行時に次を読みます（リポジトリへ skill 本文はコピーしません）。

- `~/.agents/skills/kf-g-writing-japanese-tech/SKILL.md`
- `~/.agents/skills/genshijin/SKILL.md`（無い場合はこのリポジトリの `.agents/skills/genshijin/SKILL.md`）
