# フロントエンド変更時の before/after スクリーンショット比較

PR レビュー用 HTML（[content-patterns.md](content-patterns.md) パターン A）を生成するときのみ適用する。

**when:** 対象 PR がフロントエンド（UI・スタイル・レイアウト・表示挙動）の変更を含む

**condition（スクリーンショット撮影可能）:** AI agent がブラウザで対象画面のスクリーンショットを撮影できること。次のいずれかを満たす:

- 認証なしで対象 URL にアクセスできる
- 認証を突破できる（ログイン手順・テスト用資格情報・既存セッション・開発用 bypass 等）

**適用しない:** 上記 condition を満たさない場合（本番限定・VPN 必須・2FA で agent が撮影不能など）は `img-comparison-slider` を読み込まない。代替として変更箇所の説明テキスト・Mermaid・diff2html でレビューを補完する。

## 画像参照方式

before/after 画像は **HTML 本体と同じ R2 バケット**（`ai-html`）へアップロードし、**確認済み公開 URL**（`https://ai-html.hacksaw.work/<object-key>`）のみ `src` に指定する。

**前提:** condition（スクリーンショット撮影可能）を満たす場合にのみ適用する。撮影不能時は本節を使わず、上記「適用しない」の代替手段に従う。

**判断基準:**

- **認証・公開可否**: 画像 `src` はレビュアーが HTML を開いたとき **追加認証なし** で取得できる必要がある。VPN 限定・ログイン必須・未確認 URL は使わない
- **R2 必須**: HTML 本体と同じバケットへ画像を put し、アップロード後に HTTP で取得できる **確認済み公開 URL** のみ使う（[r2-static-delivery.md](r2-static-delivery.md) の公開前提に従う）。画像用オブジェクトキーは HTML と別でもよい

## img-comparison-slider と画像形式

`img-comparison-slider` は `<img slot="first">` / `<img slot="second">` を表示する **custom element** である。画像形式を独自に制限しない。対応形式は **ブラウザの `<img>` 要素がデコードできる形式** に従う（例: PNG、JPEG、WebP、AVIF など。利用ブラウザの対応状況に依存する）。

## 撮影・変換・形式選定

| 段階 | 扱い |
| --- | --- |
| **撮影** | Playwright 等のブラウザ自動化では **PNG** を保持する（lossless、UI キャプチャ向け）。撮影元は変換入力として残す |
| **R2 upload** | **AVIF 標準**。`Content-Type: image/avif` を必ず指定する。WebP / JPEG / PNG を R2 upload 形式の第一候補やフォールバックとして使わない |
| **変換** | 配布前に [固定変換手順](#固定変換手順) のスクリプトで PNG → AVIF する。**変換後に目視比較** し、codec / 寸法 / サイズを確認する。元 PNG は削除しない |
| **例外** | AVIF を使えない場合は **ユーザー承認** を得てから別形式を選ぶ（通常フローでは想定しない） |

## 固定変換手順

**実行前提:** `ffmpeg`（`libaom-av1` encoder 内蔵）と `ffprobe` が PATH にあること。不在時はユーザーへ導入を依頼し、変換・アップロードを停止する。

**固定スクリプト:**

```bash
scripts/convert-screenshot-to-avif.sh INPUT_PNG OUTPUT.avif
```

- 入力: `.png` のみ。出力: `.avif` のみ
- 出力先が既存なら **上書きせず失敗** する
- 内部 ffmpeg 引数: `-frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 18 -b:v 0`
- 変換後: `ffprobe` で codec `av1` と width / height を検証し、`file` で AVIF 実体を確認する
- 元 PNG は削除しない

**変換後検証（目視 + CLI）:**

1. 変換前 PNG と AVIF を並べて目視比較（文字・細線の劣化がないこと）
2. `ffprobe` で codec `av1`、元 PNG と同一の width / height であること
3. `file --mime-type` で `image/avif` 相当であること
4. `wc -c` で repository 推奨上限（1 画像 2 MiB 以下）に収まること

**失敗時（ユーザー依頼）:**

- `ffmpeg` / `libaom-av1` / `ffprobe` が見つからない → ユーザーに ffmpeg（libaom 有効）の導入を依頼し停止
- 変換失敗、寸法不一致、AVIF 実体確認失敗 → エラー内容を報告し、再変換またはユーザー判断を待つ
- 2 MiB 超過 → CRF 調整は固定スクリプト外。ユーザー承認のうえ解像度調整等を検討する

## R2 画像オブジェクト（確認済み公開 URL 方式）

HTML 本体とは **別オブジェクト** として R2 に put する。HTML 本体と **同じバケット**（`ai-html`）・**同じ版 prefix**（HTML オブジェクトキーから `.html` を除いた basename）を使い、**撮影対象 slug** と画像種別を suffix に付ける。

| 項目 | ルール |
| --- | --- |
| バケット | `ai-html`（HTML 本体と **同一**） |
| 公開 URL | `https://ai-html.hacksaw.work/<object-key>` |
| HTML オブジェクトキー | `{日付}_{概要}_v{N}.html`（例: `2026-08-04_スクリーンショット比較デモ_v2.html`） |
| 撮影対象 slug | 英数字・ハイフン・アンダースコアのみ（validator: `--screenshot-target TARGET`）。例: `home`, `settings-modal` |
| 画像オブジェクトキー | `{html_basename}_{target}_before.{ext}` / `{html_basename}_{target}_after.{ext}`（`html_basename` = HTML キーから `.html` を除いた部分） |
| 版管理 | HTML と同じ `v{N}`。既存 key **上書き禁止**、欠番・再利用禁止 |
| 命名例 | `2026-08-04_スクリーンショット比較デモ_v2_home_before.avif`、`..._v2_home_after.avif` |
| 拡張子 | **`.avif` 固定**。before / after は **同一拡張子**（キー拡張子と `--content-type` を一致させる） |
| Content-Type | **`image/avif` 必須** |
| HTML 側 | **確認済み R2 URL のみ** `src` に記載。put 後に `--remote` で get / 公開 URL で目視確認する |

**upload 例（AVIF）:**

```bash
npx wrangler@latest r2 object put ai-html/2026-08-04_スクリーンショット比較デモ_v2_home_before.avif \
  --file=artifacts/before.avif \
  --content-type=image/avif \
  --remote

npx wrangler@latest r2 object put ai-html/2026-08-04_スクリーンショット比較デモ_v2_home_after.avif \
  --file=artifacts/after.avif \
  --content-type=image/avif \
  --remote
```

**size / Content-Type 確認（validator は R2 URL をネットワーク取得しない。CLI で確認）:**

```bash
npx wrangler@latest r2 object get ai-html/<object-key> --file=/tmp/check-image --remote
file --mime-type /tmp/check-image
wc -c /tmp/check-image
```

詳細 runbook は [r2-static-delivery.md](r2-static-delivery.md) の「R2 画像オブジェクト」を参照。

## 容量ゲート（repository 推奨上限）

Cloudflare R2 の object 上限（例: 5 TB）とは **別物**。本 repository の **推奨上限** として次を採用する。

| 対象 | 推奨上限 |
| --- | --- |
| R2 画像オブジェクト **1 枚** | **2 MiB 以下**（推奨） |
| R2 画像 **合計**（before + after） | **5 MiB 以下**（推奨） |

超過時は [固定変換手順](#固定変換手順) の CRF 固定（18）のまま解像度調整等を検討する（ユーザー承認が必要な場合あり）。R2 画像のサイズ確認は上記 `wrangler r2 object get --remote` + `wc -c` で行う。

**注:** 新規 HTML では data URL 埋め込みを使わない（R2 必須）。legacy data URL HTML を通常 validator（`--frontend` のみ）で検証する間は、従来の data URL 容量上限（1 画像 2 MiB / 合計 5 MiB）も適用される。

## 手順

1. 変更前（base branch）と変更後（PR branch）の **同一 URL・同一ビューポート** でスクリーンショットを撮影する
1. [画像参照方式](#画像参照方式) に従い、**確認済み公開 URL（R2 同一バケット）** で参照する
1. `<head>` に CDN で custom element を読み込む:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/img-comparison-slider@8/dist/styles.css" />
<script defer src="https://cdn.jsdelivr.net/npm/img-comparison-slider@8/dist/index.js"></script>
```

1. 概要セクション直後、または該当 UI 変更セクションに比較スライダーを配置する（`slot="first"` = 修正前、`slot="second"` = 修正後）:

```html
<img-comparison-slider class="w-full max-w-4xl">
  <img slot="first" width="100%" src="<before-image-url>" alt="修正前" />
  <img slot="second" width="100%" src="<after-image-url>" alt="修正後" />
</img-comparison-slider>
```

1. キャプションに撮影 URL・ビューポート・branch 名を記載し、レビュアーが再現できるようにする
