---
name: kf-g-html-document-universal-single-file
description: ユーザとのコミュニケーション用HTMLドキュメントを作成または改訂する際に使用。例えばPRや課題レビューHTML、注釈付きガイドなど。artifact (成果物) の一つとして扱われる。
disable-model-invocation: true
---

# 単一 HTML インタラクティブドキュメント

ビルド不要の 1 ファイル HTML で、テキスト選択コメント付きの説明ページを生成する。

## 参照ファイル

| ファイル                                                                                     | 読むタイミング                                                                                                                              |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [references/core-contract.md](references/core-contract.md)                                   | コメントコアと左注釈の DOM・データ・レイアウト・永続化を実装するとき                                                                        |
| [references/content-patterns.md](references/content-patterns.md)                             | PR 説明・業務フロー・非コーディング向けの構成、CDN 選定、視覚構造・可読性                                                                   |
| [references/source-citations.md](references/source-citations.md)                             | 外部資料を根拠に `[data-content-root]` 本文を書く／出典リンクをリンク化するとき                                                             |
| [references/r2-static-delivery.md](references/r2-static-delivery.md)                         | R2 公開前提・Wrangler OAuth・版管理の確認                                                                                                   |
| [references/frontend-screenshot-comparison.md](references/frontend-screenshot-comparison.md) | PR レビュー + フロントエンド変更時の before/after 比較                                                                                      |
| [references/pr-review-delivery.md](references/pr-review-delivery.md)                         | issue / PR 向け R2 配布の成果物正本・完了手順                                                                                               |
| [references/issue-description.md](references/issue-description.md)                           | issue description 規約（HTML 配布あり / なし）                                                                                              |
| [references/pr-description.md](references/pr-description.md)                                 | PR description 規約                                                                                                                         |
| [scripts/convert-screenshot-to-avif.sh](scripts/convert-screenshot-to-avif.sh)               | スクリーンショット PNG → AVIF 固定変換                                                                                                      |
| [references/skill-revision-guidance.md](references/skill-revision-guidance.md)               | skill 本体・reference・template を改修するとき。実装詳細の正本を template サンプル HTML に集約する判断に使う                                |
| [assets/universal-single-file-template.html](assets/universal-single-file-template.html)     | 実装の起点テンプレート                                                                                                                      |

## 視覚構造・可読性

[content-patterns.md](references/content-patterns.md) の「視覚構造・可読性・情報エンコード」に従う。DOM・コメントコア・左注釈の実装細部は [assets/universal-single-file-template.html](assets/universal-single-file-template.html) と [core-contract.md](references/core-contract.md) を正本とする。

比較表は template のソート可能表契約を使い、表示値とソート値を分離し、意味のある列を初期ソートする。固定ヘッダーは JS の fixed clone overlay とし、表ヘッダーは不透明背景を必須とする。実装例と説明は template を正本とする。

## 生成ワークフロー

1. 依頼内容からパターンを選ぶ（[content-patterns.md](references/content-patterns.md)）
1. 生成した HTML は作業セッションの artifacts の一つとして扱う
1. **次版 HTML の作成方針**（改訂・R2 配布時）:
   - **通常**: 直前版をコピーし、依頼された変更のみを加える
   - **例外**: 全文書き直し、構造再設計、直前版が不適切な場合はテンプレートまたは独立作成してよい。理由を生成 HTML 本文または依頼主題のインフラ操作記録（[content-patterns.md](references/content-patterns.md) パターン D）に記載する
   - **版管理:** 改訂ごとに新規 `v{N}` で put。既存版は保持（[r2-static-delivery.md](references/r2-static-delivery.md)）
   - アップロード前にコピー元版とアップロード先版を確認し、HTML の版ラベルとファイル名が `v{N}` と一致することを確認する
1. 初版または例外時はテンプレート HTML をコピーし、改訂時は直前版をコピーする。タイトルと `[data-content-root]` 内本文を差し替える
1. 論理セクション・積み順・冗長エンコード・専門用語・出典リンクを [content-patterns.md](references/content-patterns.md) に従って構成する
1. **左注釈データ:** `#term-annotations` を HTML に静的埋め込みする（[core-contract.md](references/core-contract.md)）
1. **配布形式:** 単一 `.html` + 必要 CDN のみ（daisyUI v5 + `@tailwindcss/browser@4` は常時。Mermaid / Markmap / diff2html / Alpine.js / `img-comparison-slider` は内容に応じて）
1. `<html>` に `data-theme` を設定し、ページ chrome は daisyUI コンポーネントクラスを使う。**コメントコア:** vanilla JS を維持。Alpine は小 UI のみ
1. コメントコア契約を満たす DOM ID・属性を維持する（[core-contract.md](references/core-contract.md)）
1. 依頼の主題がインフラ操作（ホスト構築、mount、Access、当該プロジェクトのオブジェクトストレージ運用そのもの等）であるとき、[content-patterns.md](references/content-patterns.md) のパターン D を `[data-content-root]` に含める。適用条件の正本は content-patterns.md
1. 当該生成 HTML を R2 へ公開する作業は [r2-static-delivery.md](references/r2-static-delivery.md) の内部ワークフローとして実行する（put・object-key・公開 URL 確認は読者向け成果物へ転記しない）。`[data-content-root]` には依頼主題だけを書く
1. ローカルで開き、選択→コメント→編集→再読み込み→削除→コピーを確認する
1. R2 配布時は [r2-static-delivery.md](references/r2-static-delivery.md) のチェックリストに従う
1. issue / PR 向けに HTML を生成・アップロードする場合は、次節「GitHub 連携」を完了し、[pr-review-delivery.md](references/pr-review-delivery.md) の完了手順を満たしてから description を確定する

## GitHub 連携（HTML 配布あり）

**適用条件:** issue または PR 向けに HTML を生成し R2 へアップロードするときのみ本節に従う。

### 手順

1. 詳細な計画・調査・検証結果・リスクなどは HTML 本文に記載する
1. R2 へ **新規バージョン** としてアップロードする（[r2-static-delivery.md](references/r2-static-delivery.md) の版管理ルール）
1. アップロード後、**実際の公開 URL** を確認する
1. 確認済みの最新 R2 URL を PR / issue workflow へ渡し、description を更新する（記載対象は確認済み資料リンク `[v{N}](URL)` のみ。put コマンド・object-key 説明・公開 URL 確認手順は転記しない）

- 既存 workflow で PR comment が必要な項目（Summary、検証結果など）は comment に残す
- **成果物の正本:** レビュー HTML は R2。Git には skill ソースのみ（[pr-review-delivery.md](references/pr-review-delivery.md)）

## フロントエンド変更時の before/after スクリーンショット比較

**適用条件:** PR レビュー用 HTML（[content-patterns.md](references/content-patterns.md) パターン A）かつフロントエンド変更を含むときのみ本節に従う。**撮影不能時の代替:** 説明・Mermaid・diff2html（slider は省略）。

撮影・変換・R2 オブジェクト命名・容量ゲート・HTML 埋め込み手順は [frontend-screenshot-comparison.md](references/frontend-screenshot-comparison.md) を参照。

## 完了手順（issue / PR 向け HTML 配布）

issue / PR 向け R2 配布時は、出力チェックリストと [pr-review-delivery.md](references/pr-review-delivery.md) の手順を満たしてから upload / description を確定する。

| 項目 | 確認方法 |
| --- | --- |
| HTML コア契約・daisyUI・コメント機能等 | 出力チェックリスト（目視 / ローカル操作） |
| 出典リンク | [source-citations.md](references/source-citations.md) に従いリンク化・fragment 優先を確認 |
| R2 URL・PR description | アップロード後の公開 URL 確認と description 目視 |

詳細は [pr-review-delivery.md](references/pr-review-delivery.md) を参照。

## 出力チェックリスト

- [ ] **artifacts:** 生成 HTML を作業セッションの artifacts の一つとして扱った
- [ ] **配布形式:** 単一 `.html` + 必要 CDN のみ
- [ ] **コア契約:** [core-contract.md](references/core-contract.md) と [assets/universal-single-file-template.html](assets/universal-single-file-template.html) を満たす
- [ ] **比較表:** template のソート可能表契約を満たす（ヘッダーは不透明背景で tbody が透過しない）
- [ ] **視覚構造:** [content-patterns.md](references/content-patterns.md) の積み順・論理分離・冗長エンコード・タイポグラフィ・見出し階層
- [ ] **daisyUI steps:** template の steps 契約を満たす（[universal-single-file-template.html](assets/universal-single-file-template.html)）
- [ ] **Mermaid 向き:** flowchart で TD / LR を選べる場合は TD を基本としたか（[content-patterns.md](references/content-patterns.md) § Mermaid 図の向き）
- [ ] **専門用語・左注釈:** パターン別必須度を満たす（[content-patterns.md](references/content-patterns.md) § 専門用語・左注釈）
- [ ] **出典リンク:** 外部根拠を `<a href>` でリンク化（[source-citations.md](references/source-citations.md)）
- [ ] **版管理:** 改訂ごとに新規 `v{N}` で put。既存版は保持（[r2-static-delivery.md](references/r2-static-delivery.md)）
- [ ] **R2 配布:** issue / PR description に用途別見出しと確認済み `[v{N}](https://ai-html.hacksaw.work/<object-key>)` を記載（issue: [issue-description.md](references/issue-description.md)、PR: [pr-description.md](references/pr-description.md)）
- [ ] **before/after:** 適用条件を満たす場合は [frontend-screenshot-comparison.md](references/frontend-screenshot-comparison.md) に従う
- [ ] **手動インフラ:** 依頼主題がインフラ操作のとき [content-patterns.md](references/content-patterns.md) パターン D を `[data-content-root]` に含める
- [ ] **本文と資料リンク:** `[data-content-root]` は依頼主題のみ。当該 HTML の公開手順（put・object-key・公開 URL 確認）は内部ワークフローとして実行し、issue / PR description には確認済み資料リンク `[v{N}](https://ai-html.hacksaw.work/<object-key>)` のみ置く（[r2-static-delivery.md](references/r2-static-delivery.md)）
- [ ] validator 合格

## スコープ外

Cloudflare Worker / Wrangler API 埋め込み、R2 アップロードコードの HTML 埋め込み、コメントのサーバー同期・ログイン。当該 HTML の公開手順（put・object-key 説明・公開 URL 確認手順・R2 配布記録）は読者向け成果物（HTML・issue・PR・comment）の対象外。エージェントは [r2-static-delivery.md](references/r2-static-delivery.md) の内部ワークフローとして実行する。`[data-content-root]` は依頼主題のみ。issue / PR description に置くのは確認済み資料リンクのみ。詳細は [r2-static-delivery.md](references/r2-static-delivery.md) の「HTML 側の範囲」を参照。

## 最終確認

1. 上記チェックリストをすべて満たす
1. 依頼内容に合わせてデモ文言を置換済み
1. R2 配布時は validator 実行と公開 URL 確認を完了
