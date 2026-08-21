# 公式ドキュメント URL 記載

## 基本方針

- 参照した公式ドキュメント URL があるなら、コメントに残す
- URL は判断根拠の breadcrumb として残す。What の説明で埋めない
- URL コメントも Why not（却下した代替、削除不能理由）と組み合わせる

## 配置ルール

- 1ファイル全体に関係するドキュメントはファイル先頭周辺に置く
- 特定のコードだけに関係するドキュメントは、そのコードの直上に置く
- コメントは対象コードに近いほどよい。後ろの説明で読ませない

## 書き方

- URL は短く、直接貼る
- 1つのコメントに Why not と URL を並べてよい
- URL だけのコメントにしない

## 例

ファイル全体:

```ts
// 公式ドキュメント: https://example.com/sdk/auth
// 各エンドポイントへ refresh を散らすと失効時の再試行が二重化し、トークン更新の競合が起きるため一元化する。
export async function refreshToken() {}
```

局所:

```ts
// 公式ドキュメント: https://example.com/immich-api-assets
// Immich API の空 ID は 500 として返るため、上位へ転送せずここで入力エラーに正規化する。
if (!assetId) {
  return error(400, "assetId is required");
}
```

## 注意

- モジュールの What 説明（「このモジュールは認証更新を一元化する」など）を URL コメントに混ぜない
- URL は公式ドキュメントを優先する
