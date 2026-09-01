# HTML 生成ワークフロー

配布モード確定後、HTML を生成するときの手順。配布は [delivery-policy.md](delivery-policy.md) に従う。

## 手順

1. 依頼内容からパターンを選ぶ（[content-patterns.md](content-patterns.md)）
1. 初版または例外時は [universal-single-file-template.html](../assets/universal-single-file-template.html) をコピーし、改訂時は直前版をコピーする
1. **次版の作成方針:**
   - **通常:** 直前版をコピーし、依頼された変更のみを加える
   - **例外:** 全文書き直し・構造再設計・直前版が不適切な場合はテンプレートまたは独立作成してよい。理由を HTML 本文またはパターン D の操作記録に記載する
1. タイトルと `[data-content-root]` 内本文を差し替える
1. 論理セクション・積み順・冗長エンコード・専門用語・出典リンクを [content-patterns.md](content-patterns.md) に従って構成する
1. **左注釈:** `#term-annotations` を HTML に静的埋め込みする（[core-contract.md](core-contract.md)）
1. **配布形式:** 単一 `.html` + 必要 CDN のみ（daisyUI v5 + `@tailwindcss/browser@4` は常時。Mermaid / Markmap / diff2html / Alpine.js / `img-comparison-slider` は内容に応じて）
1. `<html>` に `data-theme` を設定し、ページ chrome は daisyUI コンポーネントクラスを使う。**コメントコア:** vanilla JS を維持。Alpine は小 UI のみ
1. コメントコア契約を満たす DOM ID・属性を維持する（[core-contract.md](core-contract.md)）
1. 比較表は template のソート可能表契約を使う。固定ヘッダーは JS の fixed clone overlay とし、表ヘッダーは不透明背景を必須とする
1. **手順 UI:** daisyUI `steps` は使用禁止。順番のある内容は template の手順 UI パターン（番号付き `card` 等）に従う（[content-patterns.md](content-patterns.md)）
1. 視覚構造・可読性は [content-patterns.md](content-patterns.md) の「視覚構造・可読性・情報エンコード」に従う。DOM・コメントコア・左注釈の実装細部は template と [core-contract.md](core-contract.md) を正本とする
1. 生成 HTML を `artifacts/` に `_v{N}` 付きファイル名で保存する（[delivery-policy.md](delivery-policy.md)）
1. [checklist.md](checklist.md) の常時必須を満たす

## GitHub 連携

issue または PR 向けの description 更新は [pr-review-delivery.md](pr-review-delivery.md) に従う。

## スコープ外

Cloudflare Worker / Wrangler API 埋め込み、R2 アップロードコードの HTML 埋め込み、コメントのサーバー同期・ログイン。詳細は [r2-static-delivery.md](r2-static-delivery.md) の「HTML 側の範囲」を参照。
