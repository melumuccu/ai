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
| [references/r2-static-delivery.md](references/r2-static-delivery.md) | R2 公開前提・localStorage 制約の確認 |
| [assets/universal-single-file-template.html](assets/universal-single-file-template.html) | 実装の起点テンプレート |

## 生成ワークフロー

1. 依頼内容からパターンを選ぶ（[content-patterns.md](references/content-patterns.md)）
1. テンプレート HTML をコピーし、タイトルと `[data-content-root]` 内本文を差し替える
1. 必要な CDN のみ追加する（Tailwind は常時。Mermaid / Markmap / diff2html / Alpine.js は内容に応じて）
1. コメントコア契約を満たす DOM ID・属性を維持する（[core-contract.md](references/core-contract.md)）
1. Mermaid を使う場合は SVG テキスト選択 CSS を入れる
1. ローカルで開き、選択→コメント→再読み込み→削除→コピーを確認する
1. R2 配布時は [r2-static-delivery.md](references/r2-static-delivery.md) のチェックリストに従う
1. issue / PR 向けに HTML を生成・アップロードする場合は、次節「GitHub 連携」を完了してから description を確定する

## GitHub 連携（HTML 配布あり）

issue または PR 向けに HTML を生成し R2 へアップロードする場合のみ適用する。HTML 配布がない依頼では本節を適用しない。

### 手順

1. 詳細な計画・調査・検証結果・リスクなどは HTML 本文に記載する
1. R2 へ **新規バージョン** としてアップロードする（[r2-static-delivery.md](references/r2-static-delivery.md) の版管理ルール）
1. アップロード後、**実際の公開 URL** を確認する
1. 確認済みの最新 URL を `kf-g-github-issue-worktree-management` または `kf-g-github-pr-review-workflow` へ渡し、description を更新する

### description の形（issue / PR 共通）

GitHub の description には詳細を載せず、最小サマリと最新 HTML リンクのみを置く。

```markdown
## 概要
- <issue または PR の最小サマリ>

## 最新版HTML
[最新版のHTMLを開く](<確認済み latest R2 URL>)
```

- テスト計画、リスク一覧、実装経緯、計画全文は description に書かない。HTML に置く
- 既存 workflow で PR comment が必要な項目（Summary、検証結果など）は comment に残す

### URL の扱い

- **確認済み URL のみ** description に載せる。プレースホルダや推測 URL は禁止
- 最新 URL が未確定の間は description を確定しない。アップロードと URL 確認後に更新する
- HTML を改訂したら **新しい `vN` オブジェクト** をアップロードし、description のリンクを最新 URL に差し替える（旧版は上書きしない）

## 出力チェックリスト

- [ ] 単一 `.html` のみ（npm・ビルド・Worker なし）
- [ ] `[data-content-root]` / `[data-comment-panel]` / `#connector-svg` / `#copy-all-btn` がある
- [ ] 選択ハイライト + 右（または下）コメントカード + SVG コネクタが動作する
- [ ] カードは target Y 順、12px 以上のギャップ、線は実位置を指す
- [ ] `comments_${location.pathname}` で localStorage 永続化・復元・削除が動く
- [ ] スクロール・リサイズでレイアウト更新
- [ ] 個別コピー `> quote` + 改行 + comment、全件は `---` 区切り、1.5 秒フィードバック
- [ ] 本文テキスト選択可能、コメント操作がキーボード可能
- [ ] デスクトップ右余白 + モバイルでも閲覧可能
- [ ] バックエンド同期・認証を謳っていない
- [ ] R2 配布時: 版管理ルールに従い、確認済み最新 URL を GitHub description に渡した（HTML 配布ありの場合）

## スコープ外

- Cloudflare Worker / Wrangler / API
- R2 アップロードコードの HTML 埋め込み
- コメントのサーバー同期・ログイン

## 最終確認

1. 上記チェックリストをすべて満たす
1. 不要 CDN を読み込んでいない
1. デモ文言を依頼内容に合わせて置換済み
