# コメント・注釈コア契約

単一 HTML ドキュメントに必ず含めるインタラクティブ UI の契約。CDN ライブラリに依存せず、ブラウザ標準 API で実装する。

## レイアウト（3 列）

| 列 | 要素 | 役割 |
| --- | --- | --- |
| 左 | `#annotation-rail` / `[data-annotation-panel]` | 著者定義の専門用語解説カード |
| 中央 | `[data-content-root]` | 本文・選択・オフセット計算の基準 |
| 右 | `#comment-rail` / `[data-comment-panel]` | 閲覧者のユーザーコメントカード |

- ルートコンテナ: `#layout-root`（3 列 flex、幅は `max-w-screen-2xl` 等）
- モバイル（lg 未満）: 左注釈（`#annotation-panel-mobile`）→ 本文 → 右コメント（`#comment-panel-mobile`）の縦積み
- コネクタ SVG（`#connector-svg` / `#connector-lines`）は **右コメント専用**（左注釈には描画しない）

テンプレート: [assets/universal-single-file-template.html](../assets/universal-single-file-template.html)

---

## 左注釈（専門用語）

### 役割と分離

| 項目 | 左注釈 | 右コメント |
| --- | --- | --- |
| 定義者 | 著者（HTML 生成時に静的埋め込み） | 閲覧者（テキスト選択で追加） |
| 永続化 | **なし**（localStorage しない） | `comments_${location.pathname}` |
| 閲覧者操作 | 閲覧・コピーのみ（任意） | 追加・編集・削除・コピー |
| マーク属性 | `data-term-id` | `data-comment-id` |
| SVG コネクタ | **なし**（ホバー／タップ時にカードのみ） | mark 右端 → カード左端 |

### 必須 DOM 識別子

| 要素 | ID / 属性 | 役割 |
| --- | --- | --- |
| 左レール | `#annotation-rail` | デスクトップ用 sticky 左余白 |
| 注釈パネル | `[data-annotation-panel]` | 用語カード配置先（`#annotation-panel` / `#annotation-panel-mobile`） |
| 用語データ | `#term-annotations` | `type="application/json"` の著者定義用語配列 |
| 用語マーク | `mark[data-term-id="{id}"]` | 本文内の専門用語ハイライト |

### データモデル

`#term-annotations` 内 JSON 配列（著者が HTML 生成時に埋め込む）:

```json
[
  {
    "id": "icp",
    "term": "ICP",
    "definition": "Ideal Customer Profile。最も価値を感じ、継続利用・紹介しやすい理想顧客像。"
  }
]
```

- `id`: 本文 `mark[data-term-id]` と対応する安定 ID
- `term`: カード見出しに表示する用語名
- `definition`: カード本文に表示する解説
- バックエンド同期・閲覧者による CRUD はスコープ外

### ライフサイクル

1. ページ load 時に `#term-annotations` を `JSON.parse` する
1. 各 `id` に対応する `[data-term-id="{id}"]` を本文から **すべて** 取得する
1. 用語マークにインタラクションを付与する（下記「表示トリガー」）
1. トリガー時に左パネルへ daisyUI `card`（用語名 + 定義）を **1 枚だけ** 生成する
1. トリガー解除時にカードを除去する
1. デスクトップで表示中は、カードを表示中の左レーン（sticky `#annotation-panel`）の最上に固定する（viewport 外に出さない）

- マーク未発見・JSON パース失敗は静かにスキップする
- 左カードにコピーボタンを置く場合は `definition` をコピーする
- **左注釈用 SVG コネクタは描画しない**（`data-connector="term"` / `connector-line-term` は使わない）

### 表示トリガー

**デスクトップ（lg 以上）:**

1. 同一 `data-term-id` の **すべての** `mark[data-term-id]` へ `mouseenter`（または `pointerenter`）で対応カードを表示する
1. `mouseleave`（または `pointerleave`）で非表示にする（**200ms 程度**の hide delay を許容）
1. ポインタがマークから左カードへ移っても消えない（カード側でも hide タイマーをキャンセルする）
1. 同時に表示する左カードは **常に 1 枚**（別用語へ移ったら差し替え）

**モバイル（lg 未満）:**

1. `click` または `focus` で対応カードをトグル表示する
1. パネル外タップ、または `Escape` で閉じる
1. 必要に応じて `position: fixed` のカードを使ってよい

### 左カード配置（デスクトップ）

- 左 `[data-annotation-panel]` 内に **1 枚** のカードを置く
- カードの縦位置は、表示中の左レーン（sticky `#annotation-panel`）の最上に固定する（`position: absolute; top: 0` 等）。用語マークの位置には追従しない
- 衝突回避レイアウトは不要（常に 1 枚のため）

---

## 右コメント（ユーザー）

### 必須 DOM 識別子

| 要素 | ID / 属性 | 役割 |
| --- | --- | --- |
| 本文ルート | `[data-content-root]` | 選択・オフセット計算の基準 |
| コメントパネル | `[data-comment-panel]` | カード配置先（デスクトップ用。モバイル複製可） |
| コネクタ SVG | `#connector-svg` / `#connector-lines` | ハイライトからカードへの線（左右共用） |
| コピー全件 | `#copy-all-btn` | ヘッダーの一括コピー |
| コピー成功表示 | `#copy-feedback` | 1.5 秒表示 |
| コメント dialog | `#comment-dialog` | 追加・編集用モーダル |

## データモデル（右コメント）

`localStorage` キー: `comments_${location.pathname}`

配列要素:

```json
{
  "id": "uuid",
  "quote": "選択された原文",
  "comment": "ユーザーコメント",
  "anchor": {
    "startOffset": 0,
    "endOffset": 0,
    "prefix": "直前24文字程度",
    "suffix": "直後24文字程度",
    "quote": "選択された原文"
  },
  "createdAt": "ISO8601"
}
```

- `id`: 削除・DOM 紐付け用の安定 ID
- `anchor`: 本文ルート内の文字オフセット + prefix/suffix による復元用同一性
- バックエンド同期・認証はスコープ外

## 選択とハイライトのライフサイクル（右）

1. ユーザーが `[data-content-root]` 内のテキストを選択する
1. ダイアログまたはインライン入力でコメントを受け取る
1. 選択範囲を `<mark data-comment-id="{id}">` でラップする
   - **1 コメント = 複数 `<mark>` 可**（同一 `data-comment-id`）。table / list 等でセル跨ぎ選択時はテキストノード単位に分割 wrap する
   - `surroundContents` のみ使用する。**`extractContents` fallback は禁止**（構造親直下テキストの wrap や DOM 破壊を防ぐ）
   - 構造親（`tr` / `table` / `tbody` / `thead` / `tfoot` / `ul` / `ol`）の**直接の子**テキストは wrap 禁止。`td` / `th` / `li` 内およびその子孫 inline 内は許可
   - 同一テキストノード内の部分選択: `splitText` で start 分割後、`endOffset` を相対値へ補正してから end 分割する
   - 下線付きの視認可能ハイライト（背景色 + underline）。左注釈 `data-term-id` と色を区別する
   - wrap 結果が 0 mark のときはサイレント失敗せず、ユーザ向けエラーを表示する
1. 対応するコメントカードをパネルに追加する
1. レイアウトと SVG コネクタを再計算する（**先頭 mark** = `marks[0]` を基準）

編集時（`data-action="edit"`）:

1. 既存コメントダイアログを **編集モード** で開く
1. 引用（`quote`）は読み取り専用で表示する
1. コメント本文を既存値で事前入力する
1. 送信ボタンは `保存`、キャンセルは変更なしで閉じる
1. 空文字・空白のみの本文は拒否する
1. 成功時は同一 `id` の `comment` のみ更新し、`quote` / `anchor` / ハイライトは維持する
1. `localStorage` に保存し、カード（デスクトップ・モバイル）を再描画する
1. 衝突回避と SVG コネクタを再計算する

削除時:

1. 当該 `data-comment-id` の **すべての** `<mark>` を unwrap して原文テキストを復元する
1. カード DOM を除去する
1. `localStorage` から当該 ID を除外して保存する
1. 残りカードのレイアウトと線を再計算する

## 衝突回避アルゴリズム（右コメント）

右コメントパネルのみに適用する。左注釈は常に 1 枚のホバー／タップカードのため衝突回避しない。

1. 各コメントエントリの `targetY` を、対応ハイライト（**先頭 mark** = `marks[0]`）のビューポート上端 + `scrollY` とする
1. `targetY` 昇順（同値は `createdAt`）でソートする
1. 先頭カードから順に配置する
   - 希望位置 = ハイライトの `getBoundingClientRect().top` をパネル基準に変換した値
   - 実際の top = `max(希望位置, 前カードの bottom + 12px)`（いずれもパネル相対座標）
1. 最小ギャップ **12px** を維持する
1. SVG 線は **実際に配置されたカード位置** の中心へ向ける

スクロール・リサイズ時は `requestAnimationFrame` で右コメント位置を再計算し、表示中の左カードは最上固定を維持する。

## コネクタ座標系（右コメント専用）

- `#connector-svg` は `position: fixed; inset: 0` でビューポート全体を覆う
- `pointer-events: none` で本文選択を妨げない
- **右コメント**（`data-connector="comment"` / `connector-line-comment`）: ハイライト右端中央 → カード左端中央
- 左注釈には SVG 線を描かない
- スクロール後も `getBoundingClientRect()` ベースで再描画する

## 永続化・復元（右コメントのみ）

- 保存: コメント追加・編集・削除のたびに全件を JSON 配列として書き込む
- 復元: ページ load 時に配列を読み、各 `anchor` から Range を復元してハイライトとカードを再構築する
- オフセット不一致時は `quote` + `prefix`/`suffix` で fuzzy 再検索する
- `JSON.parse` 失敗・非配列・項目欠落は静かに無視する（既存表示を壊さない）
- **左注釈は永続化しない**（著者が HTML に静的埋め込み）

## コピー形式（右コメント）

コピー用 Markdown ヘッダー（個別・全件共通で先頭 1 回）:

```text
# [HTML_FILE_NAME.html](HTML_FILE_URL) へのコメント
```

- `HTML_FILE_NAME`: 現在ページ URL の最終パスセグメント（`decodeURIComponent`、失敗時 `document.html`）
- `HTML_FILE_URL`: クエリ・ハッシュを除いた現在の HTML URL
- ホスト名や版番号（v3/v4 等）をハードコードしない

個別（`data-action="copy"`）:

```text
# [example.html](https://example.com/path/example.html) へのコメント

> 引用テキスト

コメント本文
```

全件（`#copy-all-btn`）:

```text
# [example.html](https://example.com/path/example.html) へのコメント

> quote1

comment1

---

> quote2

comment2
```

- 全件コピーではヘッダーを **先頭 1 回のみ** 付与する（各コメントブロック内では繰り返さない）
- コメント間の区切りは `\n\n---\n\n` を厳密に使う
- クリップボード API 失敗時は hidden textarea + `execCommand('copy')` にフォールバック
- `#copy-feedback` を 1.5 秒表示する

## カード操作ボタン（右コメント）

各コメントカード（デスクトップ・モバイル複製含む）に次を並べる:

| 属性 | ラベル | 動作 |
| --- | --- | --- |
| `data-action="copy"` | コピー | 個別コピー形式でクリップボードへ |
| `data-action="edit"` | 編集 | 編集モードでダイアログを開く |
| `data-action="delete"` | 削除 | ハイライト解除・永続化から除外 |

## レスポンシブ・アクセシビリティ

- 本文は `select-text` を維持し、すべてのテキストが選択可能
- デスクトップ（lg 以上）: 左・右レール `sticky` で 3 列余白を確保
- 狭い画面: 本文 → 右コメント（本文下）の縦積み。左注釈カードは用語タップ時に表示（fixed 可）
- 右コメントハイライト: `tabindex="0"`, `role="button"`, Enter/Space で対応カードへフォーカス
- 左注釈ハイライト: デスクトップはホバー、モバイルは click/focus トグルで解説カードを表示
- カード操作ボタン: キーボードフォーカス可能、`focus:ring` を付与
- コピー成功: `aria-live="polite"` で通知

## Mermaid テキスト選択

Mermaid を使う場合、次の CSS を必ず含める:

```css
.mermaid svg text,
.mermaid svg tspan {
  user-select: text;
  -webkit-user-select: text;
  cursor: text;
  pointer-events: auto;
}
```

## 失敗時の扱い

| 状況 | 動作 |
| --- | --- |
| localStorage 不可 | 警告ログのみ。セッション内コメントは動作、永続化はスキップ |
| 復元時に Range 未発見 | 当該項目をスキップ |
| 左注釈 JSON パース失敗 / マーク未発見 | 当該用語をスキップ |
| クリップボード拒否 | textarea フォールバック。それも失敗なら無言 |
| 選択が本文外 | ダイアログを開かない |
| wrap 結果 0 mark | ユーザ向けエラーを表示（サイレント失敗禁止） |
