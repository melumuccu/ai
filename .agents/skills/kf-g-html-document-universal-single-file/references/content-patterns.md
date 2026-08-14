# コンテンツ別ビジュアルパターン

コメントコアは全パターン共通。ここでは本文の構成と、必要な CDN のみを選ぶ。

## CDN 選定の原則

| ライブラリ | 読み込む条件 |
| --- | --- |
| daisyUI v5 + `@tailwindcss/browser@4` | 常に（スタイル基盤）。CDN タグは次の公式構成を使う |
| Mermaid | フロー図・シーケンス図・状態遷移が必要 |
| Markmap | 階層型マインドマップが主役 |
| diff2html | Git diff の視覚的説明が必要 |
| Alpine.js | 小さな UI 状態（タブ・折りたたみ）のみ。**コメントコア:** vanilla JS を維持 |

**daisyUI CDN タグと `data-theme`:** `assets/universal-single-file-template.html` の `<head>` / `<html>` を正本とする。

- ページ chrome、カード、バッジ、アラート、折りたたみ、手順 UI は daisyUI コンポーネントクラス（`btn`, `card`, `alert`, `badge`, `collapse`, `steps` など）を使う
- daisyUI `steps` を使うときは、`.steps` に `steps-vertical` を必ず付ける（PC とスマホで共通）。`.steps` の直接子は `li.step` のみにする。各 `li.step` のラベルはプレーンテキストとし、コード相当は Markdown のインラインコード記法（バッククォート）でプレーンテキストとして書く。例: `<li class="step step-primary"> \`npx wrangler r2 object put\` を実行して R2 へ put する</li>`。複数の文を入れるときは、一文ごとに `<br>` で改行する。`li.step` 内の入れ子 HTML は、公式の `span.step-icon` と、複数文の改行に使う `<br>` のみとする（[公式](https://daisyui.com/components/steps/?lang=ja)）
- **コメントコア:** vanilla JS を維持。Alpine は小 UI のみ
- daisyUI CDN モードで利用可能なバリアントのみ使う

**配布形式:** 単一 `.html` + 必要 CDN のみ。npm・ビルド・ローカル import は使わない。

## 視覚構造・可読性・情報エンコード

パターン横断の共通規約。コメント対象本文は `[data-content-root]` 内に置く。

### 積み順と論理分離

| 順序 | 要素 | 用途 |
| --- | --- | --- |
| 1 | 要約カード | 結論・目的（3行以内） |
| 2 | 表 / 図 / steps | 比較・手順・状態の索引 |
| 3 | 短段落 | 1論点の補足（表・図と重複しない追加のみ） |
| 4 | collapse | 詳細・根拠・全文 |

概要、リスク群、意図グループ等の論理単位は、親 `section` + `h2` + `mb-6` 以上の余白 + `divider` または背景付き `card` で視覚分離する。

### 図表化の判断

| 情報 | 推奨 | 条件 |
| --- | --- | --- |
| 2軸以上の比較 | `table` | 列見出しで軸を明示。3列以上の同一軸も table |
| 3ステップ超の順序・分岐 | `steps` または Mermaid | 並列分岐は Mermaid flowchart。`steps` 使用時は `.steps` に `steps-vertical` を付け、直接子を `li.step` のみにし、ラベルはプレーンテキスト（コード相当は Markdown バッククォート）にする |
| 階層・ツリー | Markmap | 深いネストは collapse と併用 |
| 並列 3〜7 項目 | 短い箇条書き | 1項目1文 |
| 状態・リスク・進捗 | badge + alert/card 背景 | テキストラベル必須 |
| 長文詳細 | `collapse` | 上段に要約または表で要点を先出し |

### Mermaid 図の向き

flowchart で `TD` / `LR` を選べる場合は **`TD`（`flowchart TD`）を基本**とする。縦長の図は本文幅を保ちやすく、ページのスクロール方向とも揃う。

- **既定:** `flowchart TD`
- **LR を使う例:** ノードが少なく横一列の比較が本質である場合。シーケンス図・状態遷移図など、図種で向きが固定されている場合はその制約に従う

### 文字量ゲート

| ブロック | 上限 | 超過時 |
| --- | --- | --- |
| 結論カード | 3行 | 表または steps へ分割 |
| 段落 | 3〜4文 | リストまたは表へ |
| リスト項目 | 1文 | 子リストまたは collapse |

### 単一情報源

- **単一情報源:** 表・図・steps に載せた事実は段落で繰り返さず、詳細のみ追加する
- collapse は詳細専用。上段の表/図は索引・対応表に限定
- チェック: 同じ数値・固有名・手順が段落と表の両方にある → 片方を削除

### 情報エンコード（色非依存）

**冗長エンコード:** badge テキスト + 背景 + 枠線 + ラベルを併用する。リスク段階の具体クラスは `assets/universal-single-file-template.html` を正本とする。注意は `alert`、完了は success 系 badge 等でテキストラベルを必ず付ける。

### タイポグラフィ

`[data-content-root]` 内の本文・補足・強調は **本文 `text-base` / 補足 `text-sm` / 強調 `text-lg`** の 3 値スケールのみ使う。具体例は `assets/universal-single-file-template.html` を正本とする。

- 本文・補足・強調用途で上記以外の `font-size` を使わない
- `text-[0.85rem]` / `text-[1.15rem]` 等の任意値 rem は本文用途で使わない
- **見出し階層:** h1→h2→h3 を連続させる。**本文用途に見出しサイズを流用しない**
- ページ chrome（navbar・レール見出し・dialog ラベル・コメントカード UI）や `badge` 内ラベルは UI 用途として例外可

#### 見出し（Notion 準拠）

`[data-content-root]` 内の h1/h2/h3 は Notion 準拠のサイズ・装飾とする。具体クラスは `assets/universal-single-file-template.html` を正本とする。ページ chrome（navbar タイトル等）は対象外。

- h1 は暗背景 + 明色文字（`text-white` 等）を必須とする
- h3 と本文強調はどちらも `text-lg` だが、見出しは色・余白で区別する

### 色彩・コントラスト

白または薄い背景（`bg-base-100` / `bg-base-200` / 薄色 card 背景等）上では、十分なコントラストを確保する。

| 避ける表現 | 推奨 |
| --- | --- |
| 黄色・薄黄・ライム系の**文字色** | 暗色文字 + badge / 背景で状態を表現 |
| 薄いグレー文字（例: `text-base-content/60` 以下の opacity 単独、`text-gray-300` 等） | `text-base` / `text-sm` の本文色 |
| 色だけで状態・リスクを伝える | [情報エンコード（色非依存）](#情報エンコード色非依存) の冗長エンコード |

- 状態表現は badge + 薄背景 + 枠線 + テキストラベル
- **例外**: コメント選択ハイライトの黄色**背景**（`mark[data-comment-id]`）。文字色は暗色（`text-base-content` 等）を維持する
- daisyUI `alert-warning` / `bg-warning/10` 等（暗文字 + 警告背景）は可

### 専門用語・左注釈

#### 専門用語の定義

次をまとめて**専門用語**と呼ぶ。

1. 頭文字略語（例: ICP）
1. 経済用語、ビジネス用語
1. 標準的なエンジニアでも知らない可能性が高いエンジニアリング用語

#### UI 役割

DOM・属性・レイアウトの詳細は [core-contract.md](core-contract.md) と `assets/universal-single-file-template.html` を正本とする。

#### 執筆ルール

1. 専門用語の初出を `mark[data-term-id]` でマークし、viewport 内に見えている用語の解説カードを左注釈パネルへ文書順に積み上げ表示する
1. **単一情報源:** 本文の長い括弧説明と左注釈を重複させない（括弧は短い補足のみ可）
1. 用語マークの視覚装飾は template の `mark[data-term-id]` CSS に従い**ハイライトのみ**とする（badge・「用語」ラベル・ピル・アイコン等は付けない）
1. a11y 属性（`aria-label` / `role` / `tabindex`）は視覚装飾ではないため維持してよい
1. 左注釈カードは用語名、定義、必要なら関連語へのリンクまたは短い例を載せる

#### パターン別必須度

| パターン | 必須度 |
| --- | --- |
| プランニング、非コーディング（パターン C） | 専門用語があるなら必須 |
| 業務フロー（パターン B） | 必須寄り |
| PR レビュー（パターン A） | 任意推奨 |
| 手動インフラ（パターン D） | 任意推奨 |

#### 生成時の用語網羅チェック

1. 本文を走査し、専門用語の初出がすべて `mark[data-term-id]` でマークされているか
1. 各 `data-term-id` に対応する定義が `#term-annotations` JSON に含まれ、ID が本文マークと一致するか
1. viewport 内に見えている用語の左注釈カードが文書順に積み上がるか（常時全件表示ではない。スクロールで非可視用語のカードは消える）
1. 同一 `data-term-id` の複数マークが同時可視でもカードが 1 枚か
1. 括弧内の長い説明が左注釈と重複していないか（**単一情報源**）
1. 用語マークがハイライトのみで装飾され、badge・「用語」ラベル等の余計な視覚装飾が付いていないか（コメント mark との色分けは維持）

### 出典・外部参照

外部資料を根拠に `[data-content-root]` 本文を書くときは、[source-citations.md](source-citations.md) の手順に従う（リンク化・fragment 優先に加え、**リンクの視覚** で目視識別可能な装飾を維持する）。

| 要素 | 役割 |
| --- | --- |
| 出典 `<a href="...">` | 外部資料への根拠参照（fragment 優先） |
| 左注釈 `mark[data-term-id]` | 著者定義の専門用語解説（別機能） |

**パターン別必須度:** プランニング・調査・非コーディングは外部根拠箇所で必須。PR レビューは出典を引用した箇所のみ必須。

### a11y / レスポンシブ

- キーボード: collapse・dialog・コメント操作が Tab/Enter で操作可能
- 選択: `[data-content-root]` 内テキスト選択可能。Mermaid SVG に user-select CSS
- レイアウト: デスクトップ左注釈レール + 右コメントレール / モバイル下スタック（1024px 未満）
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

**Mermaid 例:** `pre.mermaid` + `mermaid.run()`（テンプレート内コメント参照）。flowchart は `flowchart TD` を基本とする（[Mermaid 図の向き](#mermaid-図の向き)）

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

**適用条件:** インフラ操作を含む依頼でのみ必須とする。通常の概念説明ページでは本パターンは省略する。

**構成（上から）:**

1. **操作範囲と前提** — 対象リソース、版番号、版管理ルール（改訂ごとに新規 `v{N}`）、必要権限
1. **インフラ操作の全体図** — Mermaid flowchart 等で **構築/設定** と **CLI 配布** と **Access 保護下の目視確認** を分岐可視化（**公開経路:** Wrangler CLI（`--remote`）のみ）
1. **手動インフラ構築手順** — 手動で作成・設定したリソースがある場合、または再現性のために必要な場合は必ず含める。次を区別して記載する:
   - **今回の構築内容（ユーザー申告を含む）** — 実際に行われた事実（クリック履歴が不明な項目はその旨を明記）
   - **再現用クリック手順** — 履歴が取れない操作は一般的な再構築手順として記述（**確認済み値のみ書く**。メール・client ID・シークレット・redirect URI を捏造しない）
   - 各ステップ: **画面操作** / **入力値** / **期待結果** / **失敗時**
1. **目視確認手順** — 番号付きカードまたは `steps` コンポーネント。公開後のブラウザ検証に限定する:
   - カスタムドメイン Active、Access ログイン、対象 HTML URL 読み込み
   - DevTools Network で `Content-Type: text/html`
   - テキスト選択・コメント作成・編集保存・個別/全件コピー形式・再読み込み永続化
1. **ターミナルコマンド** — Wrangler OAuth と `r2 object put`（**公開経路:** Wrangler CLI（`--remote`）のみ）
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
1. daisyUI `steps` 使用時、`.steps` に `steps-vertical` を付けたか。直接子が `li.step` のみか。ラベルはプレーンテキストか（コード相当は Markdown バッククォート）。複数文は `<br>` で改行したか。入れ子 HTML は `span.step-icon` と `<br>` のみか
1. Mermaid 使用時はテキスト選択 CSS を入れたか。flowchart は TD / LR を選べる場合 TD を基本としたか
1. インフラ操作を含む依頼で「手動インフラ操作記録」パターンを満たしたか（**手動インフラ構築手順** と **目視確認手順** を分離したか）
1. コメントコア契約（[core-contract.md](core-contract.md)）を満たす ID/属性があるか
1. 積み順・論理分離・単一情報源・冗長エンコードを満たしたか
1. 本文・補足・強調が 3 値タイポグラフィスケール（`text-base` / `text-sm` / `text-lg`）に従い、任意値 rem（`text-[0.85rem]` / `text-[1.15rem]` 等）を本文用途に使っていないか
1. `[data-content-root]` 内の h1/h2/h3 が Notion 準拠のサイズ・装飾（h1 明色文字必須）に従っているか
1. 薄背景上で薄いグレー文字・黄色文字等、低コントラスト表現を使っていないか（`mark[data-comment-id]` の黄色背景は例外）
1. 表・図・steps と同内容の段落がないか
1. 専門用語の初出が `mark[data-term-id]` でマークされ、左注釈（`[data-annotation-panel]` / `#term-annotations`）と対応しているか（パターン別必須度を満たすこと）
1. 括弧内の長い説明と左注釈が重複していないか
1. 外部資料を根拠にした主張を `<a href="...">` でリンク化し、fragment 優先 URL を使っているか（[source-citations.md](source-citations.md)、パターン別必須度を確認）
1. 出典リンクと左注釈（`mark[data-term-id]`）を混同していないか
1. リンク化した出典文言を長文で繰り返していないか（**単一情報源**）
