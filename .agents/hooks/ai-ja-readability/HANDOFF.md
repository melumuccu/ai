# ai-ja-readability 引き継ぎ資料（要件・仕様）

**読者:** `github.com/melumuccu/ai` 上で作業を引き継ぐ Cloud Agent / 開発者  
**最終更新:** 2026-09-22  
**ステータス:** 実装はこのリポジトリの `.agents/hooks/ai-ja-readability/` に置く。`main` へは PR で取り込む。

---

## 目的

Cursor エージェントが出力する**利用者向け日本語**（チャット最終文、ファイル上のコメント・Markdown など）を、実行時に読む skill に従って**二次校正**する。

- 一次校正: ユーザールール / skill（エージェント本体）
- 二次校正: 本 hook（ファイルに落ちた結果、およびチャット最終文のサイド出力）

**対象外:** Cursor 製品 UI の文言、テストが固定文字列一致を要求する文字列（意図的に送らない）。

---

## リポジトリ方針

| 項目 | 決定 |
| --- | --- |
| **正本** | `https://github.com/melumuccu/ai` |
| **実装パス** | `.agents/hooks/ai-ja-readability/`（Git 管理） |
| **実行時配置** | `~/.cursor/hooks/ai-ja-readability/`（`install-to-cursor.sh` でコピー） |
| **登録** | ユーザーレベル `~/.cursor/hooks.json`（`hooks.json.example` 参照） |
| **廃止予定** | Origin `melumuccu/ai-ja-readability-hook`（GitHub 正本に載ったあと削除） |

New Project 用 Origin リポジトリは移行用スナップショットであり、正本ではない。

---

## 方針ドキュメント

インタラクティブな決定記録。実装の「なぜ」はここが正。

| 版 | URL | 要点 |
| --- | --- | --- |
| **v4（現行）** | https://ai-html.hacksaw.work/2026-09-22_%E6%97%A5%E6%9C%AC%E8%AA%9E%E6%A0%A1%E6%AD%A3hook%E6%96%B9%E9%87%9D_v4.html | 校正文を `{CURSOR_PROJECT_DIR}/artifacts/ja-reply/` に保存 |
| v3 | 同上パターン `_v3.html` | ~~`~/.cursor/ja-reply/`~~ はやめた |
| v2 | `_v2.html` | `afterAgentResponse`、stop は使わない |
| v1 | `_v1.html` | ファイル校正、CLI/API ルーティング、断片切り出しの詳細 |

同一 HTML のコピーは、移行用ワークスペースの `artifacts/2026-09-22_日本語校正hook方針_v*.html` にもある（R2 と同期している想定）。

---

## 機能要件

### チャット

- **入力:** Cursor 共通フィールド + `text`（最終可視メッセージ）。`conversation_id` / `generation_id` を利用。
- **出力:** hook からチャット本文は**返せない**（observe-only）。
- **保存:** 校正後テキストが原文と**異なるときだけ**、次のパスに Markdown を新規作成。
  - 相対: `artifacts/ja-reply/{YYYYMMDD_hhmmss_fff}_{conversation_id 先頭8文字}.md`
  - 絶対: `{CURSOR_PROJECT_DIR}/artifacts/ja-reply/...`
  - 先頭 2 行: `conversation_id:` / `generation_id:`、以降は校正後全文のみ（ドラフトの二重保存なし）
- **`CURSOR_PROJECT_DIR` が空:** ファイルは作らずログのみ。
- **失敗・タイムアウト・検証拒否:** ファイルを作らない（フェイルオープン、exit 0）。

### ファイル

- **入力:** `file_path`, `edits`（[Hooks ドキュメント](https://cursor.com/docs/hooks)）。編集後の内容はディスクから読む。
- **書き戻し:** 校正結果を**同ファイルに上書き**（formatter パターン）。
- **再入:** `JA_REWRITE_INNER=1` のとき即終了。hook 自身のパスはスキップ。
- **失敗:** ファイルを触らない。exit 0（2 は使わない）。

### 使わない hook

- `stop` / `followup_message`（ユーザ発言として再トリガーされるため校正文表示に不向き）
- `subagentStop`

---

## 非機能要件

### 文体

- 実行時に読む（**リポジトリに skill 本文をコピーしない**）:
  - `~/.agents/skills/kf-g-writing-japanese-tech/SKILL.md`
  - genshijin **丁寧** 固定（通常・極限は使わない）
- genshijin が無い場合のフォールバック: 本 repo の `.agents/skills/genshijin/SKILL.md`

### モデルと課金ルート

| 条件 | 経路 |
| --- | --- |
| Other models 使用率 &lt; 95% と**読めた**とき | Cursor CLI: `agent -p --mode=ask --sandbox enabled`、空の temp cwd |
| それ以外（判定不能含む） | Gemini API `gemini-3.8-flash`、`GEMINI_API_KEY` |
| CLI 出力が不正 | **API でやり直さない**（原文維持） |
| Cursor 設定の Google BYOK | **登録しない** |

残量: `https://cursor.com/api/usage-summary` の `individualUsage.plan.apiPercentUsed` を best-effort（10 分キャッシュ）。非公式。

### ログ

- パス: `~/.cursor/logs/ai-ja-readability.log`（JSON Lines）
- 記録: イベント種別、path、経路、採用/拒否。**本文はログに残さない**。

### スキップパス

`node_modules`, `.git`, `.env*`, minified、hook インストールディレクトリ配下など（`ja_rewrite/paths.py`）。

---

## 実装状況

### 実装済み

| 領域 | 内容 |
| --- | --- |
| エントリ | `ja-rewrite.py` → `ja_rewrite/hook_main.py` |
| チャット | `agent_response.py`（全文 1 断片で校正 → ja-reply 保存） |
| ファイル | `file_edit.py` + `extract.py` |
| Markdown | フェンス外の地の文のみ |
| コメント | `#` / `//` 行コメント（日本語含む行） |
| LLM | `llm.py`（Gemini structured JSON / CLI 分岐） |
| 残量 | `usage_cursor.py` |
| テスト | `tests/test_extract.py`, `tests/test_paths.py`（unittest、ネットワークなし） |
| インストール | `install-to-cursor.sh`, `hooks.json.example` |

### 未実装

優先度はプロダクト判断に委ねる。v1 HTML の「実装の順序」を参照。

- HTML artifact のテキストノード校正（現状 `.html` はスキップ）
- ブロックコメント `/* */`、HTML `<!-- -->` の体系的切り出し
- Markdown のインラインコード / URL / フロントマター不変の**厳密バイト検証**
- 編集 diff から「変更のあったコメントだけ」を送る最適化（現状はファイル全体から行コメント抽出）
- ファイルパス単位ロック、より厚いフィクスチャテスト
- CLI モデル ID の自動解決（現状 `JA_REWRITE_CURSOR_CLI_MODEL` 手動）
- `GetCurrentPeriodUsage` 等の別 API との照合

---

## ディレクトリ構成

```
.agents/hooks/ai-ja-readability/
├── HANDOFF.md          ← 本資料
├── README.md           ← 利用者向け短い説明
├── hooks.json.example
├── install-to-cursor.sh
├── ja-rewrite.py
├── ja_rewrite/
│   ├── hook_main.py
│   ├── agent_response.py
│   ├── file_edit.py
│   ├── extract.py
│   ├── llm.py
│   ├── usage_cursor.py
│   ├── skills.py
│   ├── paths.py
│   ├── config.py
│   └── ...
└── tests/
```

`.agents/README.md` に hooks ディレクトリの説明を追記済み（パッチに含む）。

---

## 引き継ぎ先の TODO

### GitHub 正本

1. `.agents/hooks/ai-ja-readability/` を `melumuccu/ai` の `main` に含める。取り込みは PR とする。`main` へ直接 push しない。
1. Origin `melumuccu/ai-ja-readability-hook` は移行用スナップショットであり、正本ではない。

### リポジトリ後片付け

- GitHub に載ったことを確認したら: `origin repo delete melumuccu/ai-ja-readability-hook -y`（任意・利用者判断）

### 品質と運用

- `python3 -m unittest discover -s tests` を CI または pre-commit に載せるか検討
- Cloud Agent Environment: `.cursor/environment.json`（`GEMINI_API_KEY` は Dashboard Secrets）
- 手元 E2E: `install-to-cursor.sh` → 短い日本語コメント編集 → ログ / ja-reply 確認
- v1 未実装項目を issue 化

### ドキュメント

- R2 の v4 と README の URL が一致しているか
- 必要なら `melumuccu/ai` のトップ README に hooks へのリンク 1 行

---

## 環境変数

| 名前 | 必須 | 説明 |
| --- | --- | --- |
| `GEMINI_API_KEY` | 実質必須（CLI だけにしない） | API フォールバック |
| `JA_REWRITE_CURSOR_CLI_MODEL` | 任意 | CLI 経路を使うときの model id |
| `JA_REWRITE_GEMINI_MODEL` | 任意 | 既定 `gemini-3.8-flash` |
| `JA_REWRITE_USAGE_THRESHOLD` | 任意 | 既定 `95` |

---

## 関連リンク

- [Cursor Hooks](https://cursor.com/docs/hooks)
- [Cloud Agents setup](https://cursor.com/docs/cloud-agent/setup)
- [Gemini 3.8 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)

---

## 前セッションのコンテキスト

- 作業は New Project / Origin ドラフト上で進み、**GitHub への push 権限が VM に無かった**。
- 実装本体と `git format-patch` 出力を Origin 移行用 repo に commit 済み。
- 利用者は GitHub Cursor App で **All repositories + Contents read/write** を確認済み。
- **次エージェントは `github.com/melumuccu/ai` を primary として起動**し、上流反映と未実装バックログ消化を担当する。

---

## 成功条件

- [ ] `melumuccu/ai` の `main` に本ディレクトリが存在し、README / HANDOFF が読める
- [ ] 引き継ぎ先エージェントから `git push` が成功する
- [ ] `unittest` がローカルで green
- [ ] （利用者が希望する場合）Origin `ai-ja-readability-hook` 削除

以上。
