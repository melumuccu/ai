# R2 静的配信ベースライン

生成物は **単一 HTML ファイル** を Cloudflare R2 に置き、ビルドなしで公開する。Worker・Wrangler・API は **本 skill のスコープ外**。

## 配信前提

- オブジェクトは `Content-Type: text/html` でアップロードする
- 公開 URL は **オブジェクト URL を明示** する（バケットルートの index 挙動に依存しない）
- 公開方法:
  - カスタムドメイン付きパブリックバケット、または
  - レート制限付き `r2.dev` サブドメイン

## 公式参照

- パブリックバケット: https://developers.cloudflare.com/r2/buckets/public-buckets/
- CORS: https://developers.cloudflare.com/r2/buckets/cors/
- オブジェクトアップロード: https://developers.cloudflare.com/r2/objects/upload-objects/
- localStorage（origin スコープ）: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

## localStorage の制約

- `localStorage` は **origin 単位**（スキーム + ホスト + ポート）
- 同じ HTML でも URL パスが違えば `comments_${location.pathname}` は別キー
- R2 のカスタムドメインを変えるとコメントは引き継がれない
- プライベートブラウジング・ストレージ拒否時は永続化不可（[core-contract.md](core-contract.md) の失敗時扱い）

## HTML 側でやらないこと

- R2 アップロードコード
- 署名 URL 生成
- Worker 経由の API
- 認証・バックエンド同期

コメントは端末ローカルのみ。共有が必要ならコピー機能でテキスト出力する。

## デプロイ前チェック

1. ファイルをローカルで `file://` または簡易 HTTP で開き、コメント追加・再読み込み・削除を確認
1. 使用 CDN がネットワーク到達可能か確認
1. アップロード後、**実際の公開 URL** で同様に確認
1. CORS は HTML 単体表示では通常不要。別 origin から fetch する場合のみ [CORS ドキュメント](https://developers.cloudflare.com/r2/buckets/cors/) を参照
