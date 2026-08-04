---
name: kf-g-html-document-universal-single-file
description: Build a build-free, single-file interactive HTML document with text-selection comments, SVG connectors, and localStorage persistence for explanations, PR walkthroughs, business flows, and non-coding docs. Use this whenever the user wants a one-page HTML explanation, interactive documentation, annotated guide, or shareable static page—even if they do not say "single-file HTML". Does not provide backend sync, authentication, or Worker deployment.
---

# 単一 HTML インタラクティブドキュメント

ビルド不要の 1 ファイル HTML で、テキスト選択コメント付きの説明ページを生成する。

## 参照ファイル

| ファイル | 読むタイミング |
| --- | --- |
| [references/core-contract.md](references/core-contract.md) | コメントコアの DOM・データ・レイアウト・永続化を実装するとき |
| [references/content-patterns.md](references/content-patterns.md) | PR 説明・業務フロー・非コーディング向けの構成と CDN 選定 |
| [references/r2-static-delivery.md](references/r2-static-delivery.md) | R2 公開前提・Wrangler OAuth・版管理の確認 |
| [references/frontend-screenshot-comparison.md](references/frontend-screenshot-comparison.md) | PR レビュー + フロントエンド変更時の before/after 比較 |
| [references/pr-review-delivery.md](references/pr-review-delivery.md) | issue / PR 向け R2 配布の完了ゲート・validator・非コミット規則 |
| [scripts/verify-review-delivery.mjs](scripts/verify-review-delivery.mjs) | HTML / R2 URL / PR description の機械検証 |
| [scripts/convert-screenshot-to-avif.sh](scripts/convert-screenshot-to-avif.sh) | スクリーンショット PNG → AVIF 固定変換 |
| [assets/universal-single-file-template.html](assets/universal-single-file-template.html) | 実装の起点テンプレート |

## 生成ワークフロー

1. 依頼内容からパターンを選ぶ（[content-patterns.md](references/content-patterns.md)）
1. **次版 HTML の作成方針**（改訂・R2 配布時）:
   - **通常**: 直前版をコピーし、依頼された変更のみを加える。版間の連続性を保ち、差分を追跡しやすくする
   - **例外**: 全文書き直し、構造再設計、直前版が不適切な場合は、テンプレートまたは独立作成してよい。理由は生成 HTML 本文または操作記録に記載する
   - 既存 R2 オブジェクトは上書きしない。新しい `v{N}` オブジェクトキーでアップロードする
   - アップロード前にコピー元版とアップロード先版を確認する。完成 HTML の版ラベルとファイル名がアップロード先 `v{N}` と一致することを確認する
1. 初版または例外時はテンプレート HTML をコピーし、改訂時は直前版をコピーする。タイトルと `[data-content-root]` 内本文を差し替える
1. 必要な CDN のみ追加する（daisyUI v5 + `@tailwindcss/browser@4` は常時。Mermaid / Markmap / diff2html / Alpine.js は内容に応じて。PR レビュー用 HTML でフロントエンド変更かつ [before/after 比較](references/frontend-screenshot-comparison.md) の条件を満たす場合は `img-comparison-slider` を追加）
1. `<html>` に `data-theme` を設定し、ページ chrome と操作 UI は daisyUI コンポーネントクラス（`btn`, `card`, `alert`, `badge`, `collapse`, `steps` など）を使う。コメントコアは vanilla JS のまま維持する
1. コメントコア契約を満たす DOM ID・属性を維持する（[core-contract.md](references/core-contract.md)）
1. Mermaid を使う場合は SVG テキスト選択 CSS を入れる
1. 手動インフラ構築または CLI 配布を含む依頼では、[content-patterns.md](references/content-patterns.md) の「手動インフラ操作記録」を必ず本文に含める（**手動インフラ構築手順** と **目視確認手順** を分離）
1. ローカルで開き、選択→コメント→編集→再読み込み→削除→コピーを確認する
1. R2 配布時は [r2-static-delivery.md](references/r2-static-delivery.md) のチェックリストに従う
1. issue / PR 向けに HTML を生成・アップロードする場合は、次節「GitHub 連携」を完了し、[pr-review-delivery.md](references/pr-review-delivery.md) の完了ゲートを満たしてから description を確定する

## GitHub 連携（HTML 配布あり）

issue または PR 向けに HTML を生成し R2 へアップロードする場合のみ適用する。HTML 配布がない依頼では本節を適用しない。

### 手順

1. 詳細な計画・調査・検証結果・リスクなどは HTML 本文に記載する
1. R2 へ **新規バージョン** としてアップロードする（[r2-static-delivery.md](references/r2-static-delivery.md) の版管理ルール）
1. アップロード後、**実際の公開 URL** を確認する
1. 確認済みの最新 URL を `kf-g-github-issue-worktree-management` または `kf-g-github-pr-review-workflow` へ渡し、description を更新する

### description の形（issue / PR で見出しを分ける）

GitHub の description には詳細を載せず、最小サマリと用途別 HTML リンクのみを置く。

issue:

```markdown
## 概要
- <issue の最小サマリ>

## プランニング用資料
[v{N}](https://ai-html.hacksaw.work/<object-key>)
```

PR:

```markdown
## 概要
- <PR の最小サマリ>

## レビュー用資料
[v{N}](https://ai-html.hacksaw.work/<object-key>)
```

- リンクラベルは版付き HTML オブジェクト名から抽出した **`v{N}`（版番号）のみ**（例: `..._v2.html` → `[v2](...)`）。`最新版HTML` やファイル名全体は使わない
- テスト計画、リスク一覧、実装経緯、計画全文は description に書かない。HTML に置く
- 既存 workflow で PR comment が必要な項目（Summary、検証結果など）は comment に残す

### URL とラベルの扱い

- **確認済み URL**（`https://ai-html.hacksaw.work/<object-key>`）**と `v{N}`（版番号）のみ** description に載せる。プレースホルダ、推測 URL、未確認の版番号は禁止
- 最新 URL または `v{N}` が未確定の間は description を確定しない。アップロードと URL 確認後に更新する
- HTML を改訂したら **新しい `v{N}` オブジェクト** をアップロードし、description のリンクとラベルを新しい版へ差し替える（旧版は上書きしない）

生成成果物の Git 非コミット規則は [pr-review-delivery.md](references/pr-review-delivery.md) を参照。

## フロントエンド変更時の before/after スクリーンショット比較

PR レビュー用 HTML（[content-patterns.md](references/content-patterns.md) パターン A）かつフロントエンド変更を含む場合のみ適用する。

- **when:** UI・スタイル・レイアウト・表示挙動の変更を含む PR
- **condition:** agent がブラウザで対象画面のスクリーンショットを撮影できる（認証なし、または認証突破可能）
- **適用しない:** 撮影不能時は `img-comparison-slider` を読み込まず、説明テキスト・Mermaid・diff2html で補完する
- **必須:** 撮影可能時は R2 同一バケットへ AVIF 配布し、確認済み公開 URL のみ `src` に指定する（data URL 埋め込みは選択肢に含めない）

撮影・変換・R2 オブジェクト命名・容量ゲート・HTML 埋め込み手順は [frontend-screenshot-comparison.md](references/frontend-screenshot-comparison.md) を参照。

## 完了ゲート（issue / PR 向け HTML 配布）

issue / PR 向け R2 配布時は、upload 前と PR body 更新後の validator 合格が **必須**。手順を飛ばしたり、validator 失敗のまま upload / description 更新を確定してはならない。

```bash
node scripts/verify-review-delivery.mjs <html-file> [--frontend]
node scripts/verify-review-delivery.mjs <html-file> [--frontend] \
  --public-url https://ai-html.hacksaw.work/<object-key> \
  --pr-body-file <pr-body.md>
```

詳細手順・validator 検証範囲は [pr-review-delivery.md](references/pr-review-delivery.md) を参照。

## 出力チェックリスト

- [ ] 単一 `.html` のみ（npm・ビルド・Worker なし）
- [ ] `[data-content-root]` / `[data-comment-panel]` / `#connector-svg` / `#copy-all-btn` がある
- [ ] 選択ハイライト + 右（または下）コメントカード + SVG コネクタが動作する
- [ ] 各カードに `data-action="copy"` / `data-action="edit"` / `data-action="delete"` がある
- [ ] 編集: 引用は読み取り専用、本文のみ更新、空本文拒否、`保存` / キャンセル、永続化・再レイアウト
- [ ] カードは target Y 順、12px 以上のギャップ、線は実位置を指す
- [ ] `comments_${location.pathname}` で localStorage 永続化・復元・編集・削除が動く
- [ ] スクロール・リサイズでレイアウト更新
- [ ] 個別コピー: 動的 Markdown ヘッダー + 空行 + `> quote` + 空行 + comment
- [ ] 全件コピー: ヘッダー 1 回 + 各コメントを `\n\n---\n\n` 区切り、1.5 秒フィードバック
- [ ] 本文テキスト選択可能、コメント操作がキーボード可能
- [ ] デスクトップ右余白 + モバイルでも閲覧可能
- [ ] daisyUI v5 + `@tailwindcss/browser@4` CDN を読み込み、`<html data-theme="...">` と daisyUI コンポーネントクラスで UI を構成している
- [ ] バックエンド同期・認証を謳っていない
- [ ] 手動インフラ操作を含む依頼: 操作範囲、前提、Mermaid 等の構成図、**手動インフラ構築手順**（GCP / Zero Trust / R2 等）、**目視確認手順**（ブラウザ・DevTools・コメント操作）、CLI コマンド、失敗復旧、セキュリティ注意、操作ステータスと版情報を本文に記載した
- [ ] 次版作成: **通常**は直前版をコピーして変更を加えた。**例外**（全文書き直し、構造再設計、直前版が不適切）の場合はテンプレートまたは独立作成とし、理由を本文または操作記録に記載した
- [ ] R2 配布時: 版管理ルールに従い、既存オブジェクトを上書きせず新しい `v{N}` でアップロードした。コピー元版とアップロード先版を確認し、HTML の版ラベルとファイル名が `v{N}` と一致した
- [ ] R2 配布時: issue / PR description に用途別見出し（issue: `## プランニング用資料`、PR: `## レビュー用資料`）と、版付き R2 オブジェクト名から確認した `[v{N}](https://ai-html.hacksaw.work/<object-key>)` を記載した（HTML 配布ありの場合）
- [ ] PR レビュー用 HTML + フロントエンド変更: **when** と **condition（スクリーンショット撮影可能）** を確認した。撮影不能なら `img-comparison-slider` を読み込まない
- [ ] PR レビュー用 HTML + フロントエンド変更 + スクリーンショット撮影可能: `img-comparison-slider` を CDN で読み込み、修正前（`slot="first"`）・修正後（`slot="second"`）の before/after 比較を提示した
- [ ] before/after 画像: HTML 本体と同じ R2 バケットへ AVIF（`image/avif`）として `--remote` put し、確認済み公開 URL のみ `src` に指定した（data URL 埋め込みは使わない）。固定変換手順で PNG → AVIF 変換・検証済みで、容量ゲート（1 画像 2 MiB / 合計 5 MiB 推奨）を満たした
- [ ] issue / PR 向け R2 配布: [pr-review-delivery.md](references/pr-review-delivery.md) の upload 前・PR body 更新後 validator が合格した

## スコープ外

- Cloudflare Worker / Wrangler / API
- R2 アップロードコードの HTML 埋め込み
- コメントのサーバー同期・ログイン

## 最終確認

1. 上記チェックリストをすべて満たす
1. 不要 CDN を読み込んでいない
1. デモ文言を依頼内容に合わせて置換済み
