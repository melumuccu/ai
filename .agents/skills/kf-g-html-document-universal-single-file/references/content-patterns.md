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

## 視覚構造・可読性・情報エンコード

パターン横断の共通規約。コメント対象本文は `[data-content-root]` 内に置く。

### 積み順と論理分離

| 順序 | 要素 | 用途 |
| --- | --- | --- |
| 1 | 要約カード | 結論・目的（3行以内） |
| 2 | 表 / 図 / steps | 比較・手順・状態の索引 |
| 3 | 短段落 | 1論点の補足（表・図の繰り返し禁止） |
| 4 | collapse | 詳細・根拠・全文 |

概要、リスク群、意図グループ等の論理単位は、親 `section` + `h2` + `mb-6` 以上の余白 + `divider` または背景付き `card` で視覚分離する。

### 図表化の判断

| 情報 | 推奨 | 条件 |
| --- | --- | --- |
| 2軸以上の比較 | `table` | 列見出しで軸を明示。3列以上の同一軸も table |
| 3ステップ超の順序・分岐 | `steps` または Mermaid | 並列分岐は Mermaid flowchart |
| 階層・ツリー | Markmap | 深いネストは collapse と併用 |
| 並列 3〜7 項目 | 短い箇条書き | 1項目1文 |
| 状態・リスク・進捗 | badge + alert/card 背景 | テキストラベル必須 |
| 長文詳細 | `collapse` | 上段に要約または表で要点を先出し |

### 文字量ゲート

| ブロック | 上限 | 超過時 |
| --- | --- | --- |
| 結論カード | 3行 | 表または steps へ分割 |
| 段落 | 3〜4文 | リストまたは表へ |
| リスト項目 | 1文 | 子リストまたは collapse |

### 二重記載禁止

- 表・Mermaid・steps に載せた事実を、直下の段落で言い換えて繰り返さない
- collapse は詳細専用。上段の表/図は索引・対応表に限定
- チェック: 同じ数値・固有名・手順が段落と表の両方にある → 片方を削除

### 情報エンコード（色非依存）

| 意味 | badge | 背景・枠線 |
| --- | --- | --- |
| 高リスク | `badge-error` + 「高リスク」 | `border-error/40 bg-error/10` |
| 中リスク | `badge-warning` + 「中リスク」 | `border-warning/40 bg-warning/10` |
| 低リスク | `badge-success` + 「低リスク」 | `border-success/40 bg-success/10` |
| 注意 | `badge-warning` + ラベル | `alert alert-warning` |
| 完了 | `badge-success` + ラベル | `badge` テキストで状態を明示 |

色だけに頼らない。badge テキスト、見出し、枠線、必要に応じてアイコンまたは太字を併用する。

### a11y / レスポンシブ

- キーボード: collapse・dialog・コメント操作が Tab/Enter で操作可能
- 選択: `[data-content-root]` 内テキスト選択可能。Mermaid SVG に user-select CSS
- レイアウト: デスクトップ右コメントレール / モバイル下スタック（1024px 未満）
- 表: `overflow-x-auto` で横スクロール、または行分割。文字拡大で切れない

## パターン A: PR / 変更説明（リスク順・意図グループ）

**向いている依頼:** プルリクエスト、リファクタ、設定変更の説明ページ

**構成（上から）:**

1. 要約カード — 何を・なぜ（3行以内）
1. リスク順セクション — 影響大 → 小（親 `section` + リスク badge カード）
   - 各項目: 変更点 / 理由 / 確認方法
1. 意図グループ — 関連ファイル・機能単位（`divider` または背景 card で分離）
1. diff 抜粋が必要なら diff2html（任意）
1. フローが複雑なら Mermaid（任意）
1. 詳細は collapse（上段の表/図と重複させない）

**HTML 構造例（`[data-content-root]` 内）:**

```html
<!-- 要約 -->
<section class="card mb-6 border border-primary/30 bg-primary/5 shadow-sm">
  <div class="card-body py-4">
    <div class="flex items-center gap-2">
      <span class="badge badge-primary badge-outline">概要</span>
      <h2 class="card-title text-lg">変更の目的</h2>
    </div>
    <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
      <li>要点1</li>
      <li>要点2</li>
    </ul>
  </div>
</section>

<div class="divider my-6">リスク</div>

<!-- リスク群（高→中→低） -->
<section class="mb-6">
  <h2 class="mb-3 text-xl font-semibold">リスク順レビュー</h2>
  <div class="grid gap-3 sm:grid-cols-3">
    <div class="card border border-error/40 bg-error/10 shadow-sm">
      <div class="card-body gap-2 py-3">
        <span class="badge badge-error w-fit">高リスク</span>
        <h3 class="font-semibold">認証・課金</h3>
        <p class="text-sm">変更点と確認方法</p>
      </div>
    </div>
    <div class="card border border-warning/40 bg-warning/10 shadow-sm">
      <div class="card-body gap-2 py-3">
        <span class="badge badge-warning w-fit">中リスク</span>
        <h3 class="font-semibold">API 契約</h3>
        <p class="text-sm">変更点と確認方法</p>
      </div>
    </div>
    <div class="card border border-success/40 bg-success/10 shadow-sm">
      <div class="card-body gap-2 py-3">
        <span class="badge badge-success w-fit">低リスク</span>
        <h3 class="font-semibold">文言・スタイル</h3>
        <p class="text-sm">変更点と確認方法</p>
      </div>
    </div>
  </div>
</section>

<!-- 意図グループ + 詳細 collapse -->
<section class="mb-6">
  <h2 class="mb-3 text-xl font-semibold">意図グループ</h2>
  <div class="collapse collapse-arrow bg-base-100 border border-base-300">
    <input type="checkbox" />
    <div class="collapse-title font-medium">グループ名（要約1行）</div>
    <div class="collapse-content text-sm">
      <p>詳細・根拠。上段の表/図と重複しない。</p>
    </div>
  </div>
</section>
```

**避ける:** Worker 連携、レビュー API、自動アップロードコードの埋め込み、表/図と同内容の長文段落

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

**向いている依頼:** Cloudflare Zero Trust / R2 構築、Wrangler CLI 配布、Access 検証、GCP OAuth 設定など、ブラウザ・ダッシュボード・CLI を伴うインフラ作業

**通常の概念説明ページには適用しない。** インフラ操作を含む依頼でのみ必須とする。

**構成（上から）:**

1. **操作範囲と前提** — 対象リソース、版番号、上書き禁止ルール、必要権限
1. **インフラ操作の全体図** — Mermaid flowchart 等で **構築/設定** と **CLI 配布** と **Access 保護下の目視確認** を分岐可視化（Dashboard Upload は含めない）
1. **手動インフラ構築手順** — 手動で作成・設定したリソースがある場合、または再現性のために必要な場合は必ず含める。次を区別して記載する:
   - **今回の構築内容（ユーザー申告を含む）** — 実際に行われた事実（クリック履歴が不明な項目はその旨を明記）
   - **再現用クリック手順** — 履歴が取れない操作は一般的な再構築手順として記述（メール・client ID・シークレット・redirect URI を捏造しない）
   - 各ステップ: **画面操作** / **入力値** / **期待結果** / **失敗時**
1. **目視確認手順** — 番号付きカードまたは `steps` コンポーネント。公開後のブラウザ検証に限定する:
   - カスタムドメイン Active、Access ログイン、対象 HTML URL 読み込み
   - DevTools Network で `Content-Type: text/html`
   - テキスト選択・コメント作成・編集保存・個別/全件コピー形式・再読み込み永続化
1. **ターミナルコマンド** — Wrangler OAuth と `r2 object put`（CLI 配布経路のみ。Dashboard Upload は記載しない）
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
1. インフラ操作を含む依頼で「手動インフラ操作記録」パターンを満たしたか（**手動インフラ構築手順** と **目視確認手順** を分離したか）
1. コメントコア契約（[core-contract.md](core-contract.md)）を満たす ID/属性があるか
1. 積み順・論理分離・二重記載禁止・色非依存エンコードを満たしたか
1. 表・図・steps と同内容の段落がないか
