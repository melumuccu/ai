# R2 静的配信ベースライン

生成物は **単一 HTML ファイル** を Cloudflare R2 に置き、ビルドなしで公開する。

## 配信前提

- オブジェクトは `Content-Type: text/html` でアップロードする
- 本 repository の公開先は **`https://ai-html.hacksaw.work/<object-key>`**（カスタムドメイン `ai-html.hacksaw.work`）。latest 版リンクもこの URL を使う
- 公開 URL は **オブジェクト URL を明示** する（バケットルートの index 挙動に依存しない）

## Cloudflare 操作（Wrangler OAuth）

R2 へのアップロード・確認は **OAuth 認証済み Wrangler CLI** で行う。

1. 操作前に `npx wrangler@latest whoami` で認証状態を確認する
1. バケットへのアクセス権も確認する
1. 認証切れ・未ログインの場合は、ユーザーに `npx wrangler@latest login` の実行を依頼する
1. ログイン後、再度 `whoami` とバケットアクセスを確認してから続行する
1. **チャットで API トークン・シークレットを要求しない**

Worker デプロイや HTML への R2 アップロードコード埋め込みは **本 skill のスコープ外**。

## HTML 側でやらないこと

- R2 アップロードコード
- 署名 URL 生成
- Worker 経由の API
- 認証・バックエンド同期

コメントは端末ローカルのみ。共有が必要ならコピー機能でテキスト出力する。

## 版管理（上書き禁止）

`v{N}` は **版番号**（例: `v1`, `v2`）を表すプレースホルダ。

- 同一内容の改訂でも、既存オブジェクトは **上書きしない**
- 改訂のたびに **新しい `v{N}` オブジェクト** としてアップロードする（例: `2026-08-03_今回の対応概要_v1.html` → `..._v2.html`）
- 初版は `v1` とする。版番号は単調増加させ、欠番や再利用はしない
- issue / PR の description に載せるリンクは、常に **最新版の確認済み URL**（`https://ai-html.hacksaw.work/<object-key>`）と **`v{N}` ラベル** に差し替える
- 旧版 URL は R2 上に残す（履歴参照用）。削除や上書きはしない

## GitHub description へのリンク反映

HTML 配布ありの issue / PR では、description は最小サマリと用途別 HTML リンクのみとする（詳細は [SKILL.md](../SKILL.md) の「GitHub 連携」参照）。

1. 新バージョンを R2 へアップロードする
1. **`https://ai-html.hacksaw.work/<object-key>`** をブラウザまたは HTTP で確認する
1. オブジェクト名から版番号を抽出し、リンクラベルを `[v{N}]` にする（例: `..._v2.html` → `[v2](https://ai-html.hacksaw.work/..._v2.html)`）
1. issue には `## プランニング用資料`、PR には `## レビュー用資料` の直下にリンクを置く
1. URL または `v{N}` が未確定の間はリンクを置かない。確認後に description を更新する
1. 新版アップロード時は、旧リンクと旧ラベルを新版へ差し替える

## デプロイ前チェック

1. ファイルをローカルで `file://` または簡易 HTTP で開き、コメント追加・再読み込み・削除を確認
1. 使用 CDN がネットワーク到達可能か確認
1. **新規 `v{N}` として** アップロードし、既存オブジェクトを上書きしていないことを確認
1. アップロード後、**`https://ai-html.hacksaw.work/<object-key>`** で同様に確認
