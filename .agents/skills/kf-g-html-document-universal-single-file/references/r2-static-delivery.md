# R2 静的配信ベースライン

生成物は **単一 HTML ファイル** を Cloudflare R2 に置き、ビルドなしで公開する。

## 配信前提

- オブジェクトは `Content-Type: text/html` でアップロードする
- 本 repository の公開先は **`https://ai-html.hacksaw.work/<object-key>`**（カスタムドメイン `ai-html.hacksaw.work`）。latest 版リンクもこの URL を使う
- バケット名: **`ai-html`**
- Cloudflare Access は **有効**。公開 URL へのアクセスは Access 認証後に HTML を表示する
- 公開 URL は **オブジェクト URL を明示** する（バケットルートの index 挙動に依存しない）

## 版管理（上書き禁止）

`v{N}` は **版番号**（例: `v1`, `v2`）を表すプレースホルダ。

- 同一内容の改訂でも、既存オブジェクトは **上書きしない**
- 改訂のたびに **新しい `v{N}` オブジェクト** としてアップロードする（例: `2026-08-03_今回の対応概要_v1.html` → `..._v2.html` → `..._v3.html`）
- 初版は `v1` とする。版番号は単調増加させ、欠番や再利用はしない
- issue / PR の description に載せるリンクは、常に **最新版の確認済み URL**（`https://ai-html.hacksaw.work/<object-key>`）と **`v{N}` ラベル** に差し替える
- 旧版 URL は R2 上に残す（履歴参照用）。削除や上書きはしない

## GitHub description へのリンク反映

HTML 配布ありの issue / PR では、description は最小サマリと用途別 HTML リンクのみとする（詳細は [SKILL.md](../SKILL.md) の「GitHub 連携」参照）。

1. 新バージョンを R2 へアップロードする
1. **`https://ai-html.hacksaw.work/<object-key>`** をブラウザまたは HTTP で確認する
1. オブジェクト名から版番号を抽出し、リンクラベルを `[v{N}]` にする（例: `..._v3.html` → `[v3](https://ai-html.hacksaw.work/..._v3.html)`）
1. issue には `## プランニング用資料`、PR には `## レビュー用資料` の直下にリンクを置く
1. URL または `v{N}` が未確定の間はリンクを置かない。確認後に description を更新する
1. 新版アップロード時は、旧リンクと旧ラベルを新版へ差し替える

## HTML 側でやらないこと

- R2 アップロードコード
- 署名 URL 生成
- Worker 経由の API
- 認証・バックエンド同期

コメントは端末ローカルのみ。共有が必要ならコピー機能でテキスト出力する。

## 手動インフラ操作 runbook（本 repository）

Dashboard のラベルは Cloudflare UI 更新で変わることがある。破壊的操作の前に、表示ラベルを目視で確認する。

### 前提確認と版選択

| 項目 | 値 |
| --- | --- |
| バケット | `ai-html` |
| カスタムドメイン | `ai-html.hacksaw.work` |
| 公開 URL 形式 | `https://ai-html.hacksaw.work/<object-key>` |
| 今回のアップロード対象 | 新規 `v{N}` のみ（例: `2026-08-03_今回の対応概要_v3.html`） |
| 上書き禁止 | `v1`, `v2` など既存オブジェクトは変更しない |

**画面操作:** Cloudflare Dashboard → 左メニュー **R2 object storage** → **Overview** → バケット **`ai-html`** をクリック

**期待結果:** バケット内オブジェクト一覧が表示される。既存 `v1` / `v2` が残っている

**失敗時:** バケットが見えない場合はアカウント・権限を確認する。別バケット名を推測して操作しない

### カスタムドメイン状態確認

**画面操作:** バケット **`ai-html`** → **Settings**（または **Custom domains**）→ **`ai-html.hacksaw.work`** の行を確認

**入力値:** ドメイン `ai-html.hacksaw.work`

**期待結果:** ドメインが **Active**（または同等の有効表示）。Access ポリシーが有効

**失敗時:** DNS 未設定・証明書待ちの場合はドメイン設定を完了してからアップロードする

### Dashboard からのアップロード（主経路）

**画面操作:** **R2 object storage** → **Overview** → **`ai-html`** → **Upload**（または **Upload objects**）

**入力値:**

| 項目 | 値 |
| --- | --- |
| ファイル | ローカルの `artifacts/<object-key>.html` |
| Object key | 例: `2026-08-03_今回の対応概要_v3.html` |
| Content-Type | `text/html` |

**期待結果:** オブジェクト一覧に新キーが追加される。既存 `v1` / `v2` はそのまま

**失敗時:**

- 同名キーが既にある → 版番号を上げた **新キー** を使う（上書きしない）
- Content-Type が `application/octet-stream` → メタデータを `text/html` に修正して再アップロード

### Wrangler OAuth 認証

**ターミナル:**

```bash
npx wrangler@latest login --use-keyring
npx wrangler@latest whoami
npx wrangler@latest r2 bucket list
```

**期待結果:**

- `whoami` でログイン済みアカウントが表示される
- `r2 bucket list` に **`ai-html`** が含まれる

**失敗時:**

- 未ログイン → ブラウザ OAuth を完了してから `whoami` を再実行
- バケットが見えない → アカウント切替・権限を確認。API トークンやシークレットをチャットに貼らない

### CLI からのアップロード（代替経路）

**ターミナル:**

```bash
npx wrangler@latest r2 object put ai-html/2026-08-03_今回の対応概要_v3.html \
  --file=artifacts/2026-08-03_今回の対応概要_v3.html \
  --content-type=text/html
```

**入力値:** 上記 object key と `--content-type=text/html` を必ず指定する

**期待結果:** コマンドが成功し、Dashboard のオブジェクト一覧に同キーが表示される

**失敗時:**

- `403` / 認証エラー → 手順 4 をやり直す
- キー typo → 404 になるため、Dashboard のキー名と完全一致を確認する

### Access 認証付きブラウザ検証

**画面操作:**

1. ブラウザで `https://ai-html.hacksaw.work/2026-08-03_今回の対応概要_v3.html` を開く
1. Cloudflare Access ログイン画面が出たら組織アカウントで認証する
1. HTML が表示されたら、本文選択→コメント追加→再読み込み→削除を確認する
1. DevTools → **Network** → 対象 HTML レスポンス → **Content-Type: text/html** を確認する

**期待結果:** Access 後にページが表示され、コメントコアが動作する。`Content-Type` は `text/html`

**失敗時:**

| 症状 | 対処 |
| --- | --- |
| 404 | object key の typo、未アップロード、別バケットを確認 |
| 302 Access ループ | セッション・ポリシー・ドメイン設定を確認 |
| 古い内容 | ブラウザキャッシュを無効化して再読み込み |
| 認証失敗 | Access ポリシーと許可ユーザー/グループを確認 |
| HTML がダウンロードされる | Content-Type を `text/html` に修正 |

### 失敗復旧とセキュリティ

- **版重複:** 既存キーと衝突したら版番号を上げ、新オブジェクトとして再アップロードする
- **旧版保護:** `v1` / `v2` を削除・上書きしない
- **シークレット:** API トークン、Access シークレット、R2 認証情報を HTML やチャットに貼らない
- **Access:** 公開 HTML は Access 有効のまま運用する（意図的な無効化は別途合意）
- **Bucket Lock:** 本 repository では任意。現状未適用でも可

## デプロイ前チェック

1. ファイルをローカルで `file://` または簡易 HTTP で開き、コメント追加・再読み込み・削除を確認
1. daisyUI / Mermaid 等、使用 CDN がネットワーク到達可能か確認
1. **新規 `v{N}` として** アップロードし、既存オブジェクトを上書きしていないことを確認
1. アップロード後、**`https://ai-html.hacksaw.work/<object-key>`** で Access 認証後に同様に確認

## Cloudflare 操作（Wrangler OAuth）

R2 へのアップロード・確認は **OAuth 認証済み Wrangler CLI** で行う。

1. 操作前に `npx wrangler@latest whoami` で認証状態を確認する
1. バケット **`ai-html`** へのアクセス権も確認する
1. 認証切れ・未ログインの場合は `npx wrangler@latest login --use-keyring` を実行する
1. ログイン後、再度 `whoami` とバケットアクセスを確認してから続行する
1. **チャットで API トークン・シークレットを要求しない**

Worker デプロイや HTML への R2 アップロードコード埋め込みは **本 skill のスコープ外**。

## 生成 HTML への反映

インフラ操作を含む依頼では、[content-patterns.md](content-patterns.md) の「手動インフラ操作記録」に従い、上記 runbook の要点（全体図、クリック経路、入力値、期待結果、失敗時、検証、セキュリティ、操作ステータス）を HTML 本文に記載する。
