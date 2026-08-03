# コンテンツ別ビジュアルパターン

コメントコアは全パターン共通。ここでは本文の構成と、必要な CDN のみを選ぶ。

## CDN 選定の原則

| ライブラリ | 読み込む条件 |
| --- | --- |
| daisyUI v5 + `@tailwindcss/browser@4` | 常に（スタイル基盤）。CDN タグは次の公式構成を使う |
| Mermaid | フロー図・シーケンス図・状態遷移が必要 |
| Markmap | 階層型マインドマップが主役 |
| diff2html | Git diff の視覚的説明が必要 |
| Alpine.js | 小さな UI 状態（タブ・折りたたみ）のみ。コメントコアには使わない |

**daisyUI 公式 CDN（ビルド不要 HTML）:**

```html
<link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

- `<html>` に `data-theme="light"`（または依頼に合うテーマ）を設定する
- ページ chrome、カード、バッジ、アラート、折りたたみ、手順 UI は daisyUI コンポーネントクラス（`btn`, `card`, `alert`, `badge`, `collapse`, `steps` など）を使う
- コメントコアは vanilla JS のまま。Alpine.js をコメント機能に使わない
- CDN モードで利用できない daisyUI バリアントは使わない

不要な CDN は読み込まない。ビルド・npm・ローカル import は禁止。

## パターン A: PR / 変更説明（リスク順・意図グループ）

**向いている依頼:** プルリクエスト、リファクタ、設定変更の説明ページ

**構成（上から）:**

1. 概要（何を・なぜ）
1. リスク順セクション — 影響大 → 小
   - 各項目: 変更点 / 理由 / 確認方法
1. 意図グループ — 関連ファイル・機能単位でまとめる
1. diff 抜粋が必要なら diff2html（任意）
1. フローが複雑なら Mermaid（任意）

**例セクション見出し:**

- 高リスク: 認証・課金・データ移行
- 中リスク: API 契約変更
- 低リスク: 文言・スタイル

**避ける:** Worker 連携、レビュー API、自動アップロードコードの埋め込み

## パターン B: 業務フロー（マインドマップ / シミュレータ）

**向いている依頼:** 業務プロセス、オンボーディング、判断フローの説明

**構成:**

1. 目的と読者
1. Markmap または Mermaid で全体像
1. ステップごとの本文（選択コメントで補足しやすい短い段落）
1. 分岐がある場合: Alpine.js でタブまたはアコーディオン（任意）
1. 「もし X なら」シナリオを箇条書きまたは簡易表

**Markmap 例:**

```html
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="https://cdn.jsdelivr.net/npm/markmap-view"></script>
<!-- 公式 CDN パスは生成時に最新を確認 -->
<div id="markmap" class="h-96"></div>
```

**Mermaid 例:** `pre.mermaid` + `mermaid.run()`（テンプレート内コメント参照）

## パターン C: 非コーディング汎用ドキュメント

**向いている依頼:** 制度説明、研修資料、調査メモ、製品比較

**構成:**

1. タイトルと要約
1. 論点ごとのセクション（見出し + 短い段落）
1. 比較が必要なら HTML 表（daisyUI `table` または Tailwind ユーティリティ）
1. 時系列なら番号付きリスト
1. 図は必要最小限。テキスト選択コメントが主 UI

**CDN:** daisyUI + Tailwind browser のみが基本。図がなくても成立することを優先。

## パターン D: 手動インフラ操作記録（必須）

**向いている依頼:** Cloudflare Dashboard 操作、R2 アップロード、Wrangler OAuth、Access 検証、DNS / ドメイン設定など、ブラウザ・ダッシュボード・CLI を伴うインフラ作業

**通常の概念説明ページには適用しない。** インフラ操作を含む依頼でのみ必須とする。

**構成（上から）:**

1. **操作範囲と前提** — 対象リソース、版番号、上書き禁止ルール、必要権限
1. **インフラ操作の全体図** — Mermaid flowchart 等で Dashboard / CLI / 検証の流れを可視化
1. **手動インフラ操作手順** — 番号付きカードまたは `steps` コンポーネント。各ステップに次を必ず含める:
   - **画面操作**: メニュー・ボタンのクリック経路（例: `R2 object storage → Overview → ai-html → Upload`）
   - **入力値**: バケット名、ドメイン、オブジェクトキー、Content-Type、CLI 引数
   - **期待結果**: 成功時に画面またはターミナルで見える状態
   - **失敗時**: 具体的な修正手順
1. **ターミナルコマンド** — 実行コマンドと期待出力（該当する場合）
1. **検証手順** — ブラウザ確認、DevTools ヘッダー確認、Access ログイン後の表示確認
1. **失敗復旧** — 404、302 リダイレクト、キャッシュ、認証失敗、版重複など
1. **セキュリティ注意** — シークレット非貼付、Access 維持、旧版非改変
1. **操作ステータス** — 版、pending / 完了、タイムスタンプを `badge` 等で表示

**UI 推奨:** daisyUI `card`, `collapse`, `alert`, `badge`, `steps` で手順を折りたたみ可能にする。Dashboard ラベルは変更されうる旨を `alert` で明記する。

**R2 配布の詳細手順:** [r2-static-delivery.md](r2-static-delivery.md) のリポジトリ固有 runbook を参照し、本文にもクリックレベル手順を反映する。

## 生成時チェック

1. `[data-content-root]` 内に説明本文をすべて置いたか
1. デモ用見出し・段落を実内容に差し替えたか
1. 使わない CDN の `<script>` / `<link>` を削除したか
1. daisyUI CDN と `data-theme` を設定したか
1. Mermaid 使用時はテキスト選択 CSS を入れたか
1. インフラ操作を含む依頼で「手動インフラ操作記録」パターンを満たしたか
1. コメントコア契約（[core-contract.md](core-contract.md)）を満たす ID/属性があるか
