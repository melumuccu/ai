# R2 静的配信ベースライン

生成物は **単一 HTML ファイル** を Cloudflare R2 に置き、ビルドなしで公開する。

## 配信前提

- オブジェクトは `Content-Type: text/html` でアップロードする
- 本 repository の公開先は **`https://ai-html.hacksaw.work/<object-key>`**（カスタムドメイン `ai-html.hacksaw.work`）。latest 版リンクもこの URL を使う
- バケット名: **`ai-html`**
- GCP プロジェクト名: **`ai-html`**（Google OAuth 同意画面・OAuth クライアント ID をここで設定。ユーザー申告。クリック履歴は未記録）
- Cloudflare Zero Trust: Google OAuth ログイン方式を設定。Access ポリシーで許可ユーザーを制限（ユーザー申告。ポリシー値・メール・client ID・シークレット・redirect URI は記録していない）
- Cloudflare Access は **有効**。公開 URL へのアクセスは Access 認証後に HTML を表示する
- 公開 URL は **オブジェクト URL を明示** する（バケットルートの index 挙動に依存しない）
- HTML 公開経路: **Wrangler CLI のみ**（Dashboard Upload / Upload objects は使わない）

## 版管理（上書き禁止）

`v{N}` は **版番号**（例: `v1`, `v2`）を表すプレースホルダ。

- 同一内容の改訂でも、既存オブジェクトは **上書きしない**
- 改訂のたびに **新しい `v{N}` オブジェクト** としてアップロードする（例: `2026-08-03_今回の対応概要_v1.html` → `..._v2.html` → `..._v3.html` → `..._v4.html`）
- 初版は `v1` とする。版番号は単調増加させ、欠番や再利用はしない
- issue / PR の description に載せるリンクは、常に **最新版の確認済み URL**（`https://ai-html.hacksaw.work/<object-key>`）と **`v{N}` ラベル** に差し替える
- 旧版 URL は R2 上に残す（履歴参照用）。削除や上書きはしない
- Bucket Lock は本 repository では任意。現状未適用

### 次版 HTML の作成方針

- **通常**: 次版を作るときは直前版をコピーし、依頼された変更のみを加える。版間の連続性を保ち、差分を追跡しやすくする
- **例外**: 全文書き直し、構造再設計、直前版が不適切な場合は、テンプレートまたは独立作成してよい。理由は生成 HTML 本文または操作記録に記載する
- **アップロード前検証**: コピー元版とアップロード先版を確認する。完成 HTML の版ラベルとファイル名がアップロード先 `v{N}` と一致することを確認する

## GitHub description へのリンク反映

HTML 配布ありの issue / PR では、description は最小サマリと用途別 HTML リンクのみとする（詳細は [SKILL.md](../SKILL.md) の「GitHub 連携」参照）。

1. 新バージョンを R2 へアップロードする
1. **`https://ai-html.hacksaw.work/<object-key>`** をブラウザまたは HTTP で確認する
1. オブジェクト名から版番号を抽出し、リンクラベルを `[v{N}]` にする（例: `..._v4.html` → `[v4](https://ai-html.hacksaw.work/..._v4.html)`）
1. issue には `## プランニング用資料`、PR には `## レビュー用資料` の直下にリンクを置く
1. URL または `v{N}` が未確定の間はリンクを置かない。確認後に description を更新する
1. 新版アップロード時は、旧リンクと旧ラベルを新版へ差し替える

## HTML 側でやらないこと

- R2 アップロードコード
- 署名 URL 生成
- Worker 経由の API
- 認証・バックエンド同期

コメントは端末ローカルのみ。共有が必要ならコピー機能でテキスト出力する。

## 手動インフラ構築 runbook（本 repository）

Dashboard のラベルは Cloudflare UI 更新で変わることがある。破壊的操作の前に、表示ラベルを目視で確認する。

インフラを手動作成・設定した場合、または再現性のために必要な場合は、HTML 本文に **手動インフラ構築手順** を含める。**今回の構築内容（ユーザー申告を含む）** と **再現用クリック手順** を区別する。クリック履歴が取れない項目は捏造せず、一般的な再構築手順として記述する。

### GCP プロジェクトと Google OAuth（再現用）

**今回の構築内容:** GCP プロジェクト名 `ai-html` を作成し、Google OAuth 同意画面と OAuth クライアント ID（Web アプリケーション）を設定した（ユーザー申告。詳細クリック履歴は未記録）。

**再現用クリック手順:**

1. GCP Console → プロジェクトセレクタ → **New Project** → プロジェクト名 `ai-html` → **Create**
1. **APIs & Services** → **OAuth consent screen** を設定
1. **Credentials** → **Create Credentials** → **OAuth client ID** → **Web application**
1. Cloudflare Zero Trust が表示する redirect URI を **そのまま使用** する（推測・捏造しない）
1. client secret は Cloudflare の保護されたフォームにのみ入力する（HTML やチャットに貼らない）

### Cloudflare Zero Trust / Access（再現用）

**今回の構築内容:** Google OAuth ログイン方式を設定。Access ポリシーで許可ユーザーを制限（ユーザー申告。ポリシー値・メールは未記録）。

**再現用クリック手順:**

1. Cloudflare Dashboard → **Zero Trust** → **Settings** / **Authentication** → **Login methods** → **Google**
1. GCP の client ID / secret を入力して保存
1. **Access** → **Applications** → **Add application** → **Self-hosted**
1. public hostname `ai-html.hacksaw.work` を指定
1. 意図したユーザー/メールセレクタで **Allow** ポリシーを作成し保存・公開（実際のメールアドレスは記載しない）

### R2 バケットとカスタムドメイン（再現用）

**今回の構築内容:** R2 バケット `ai-html`、カスタムドメイン `ai-html.hacksaw.work` を設定（ユーザー申告）。

**再現用クリック手順:**

1. Cloudflare Dashboard → **R2 object storage** → **Create bucket** → バケット名 `ai-html`
1. バケット **Settings** → **Custom Domains** → **Add** `ai-html.hacksaw.work`
1. 接続・検証し **Active** を確認

Dashboard Upload / Upload objects は **公開経路に含めない**。

## R2 画像オブジェクト（before/after スクリーンショット）

PR レビュー HTML で **確認済み公開 URL** 方式を選んだ場合、before/after 画像を HTML 本体とは **別オブジェクト** としてアップロードする。

**R2 upload 形式は AVIF 標準。** 撮影元は PNG を保持し、配布前に固定スクリプトで AVIF へ変換する。WebP / JPEG / PNG を R2 upload 形式の第一候補やフォールバックとして使わない。AVIF を使えない例外はユーザー承認がある場合のみ。

### 前提

| 項目 | 値 |
| --- | --- |
| バケット | `ai-html` |
| 公開 URL | `https://ai-html.hacksaw.work/<object-key>` |
| 公開経路 | Wrangler CLI のみ |
| 版管理 | HTML 本体と同じ `v{N}` prefix。既存 key **上書き禁止** |
| Access | HTML と同様、Access 認証後に取得・目視確認 |

### オブジェクトキー命名

HTML 本体キーと **同じバケット・同じ版 prefix**（HTML キーから `.html` を除いた basename）に、**撮影対象 slug** と画像種別 suffix を付ける。

```
HTML:   <日付>_<概要>_v{N}.html
before: <html_basename>_<target>_before.avif
after:  <html_basename>_<target>_after.avif
```

- `html_basename` = HTML オブジェクトキーから `.html` を除いた部分
- `<target>` = **撮影対象 slug**（validator では `--screenshot-target TARGET` で指定）。英数字・ハイフン・アンダースコアのみ（例: `home`, `settings-modal`）
- 拡張子は **`.avif` 固定**。before / after は **同一拡張子** とする。キー拡張子と `--content-type` は **`image/avif`** で一致させる
- 既存 key の上書き禁止（HTML・画像とも）

例（`--screenshot-target home`）:

- HTML: `2026-08-04_スクリーンショット比較デモ_v2.html`
- before: `2026-08-04_スクリーンショット比較デモ_v2_home_before.avif`
- after: `2026-08-04_スクリーンショット比較デモ_v2_home_after.avif`

### Content-Type

| 拡張子 | `--content-type` |
| --- | --- |
| `.avif` | `image/avif`（**必須**） |

### PNG → AVIF 固定変換

**実行前提:** `ffmpeg`（`libaom-av1` encoder）と `ffprobe` が PATH にあること。不在時はユーザーへ導入を依頼し停止する。

```bash
scripts/convert-screenshot-to-avif.sh artifacts/before.png artifacts/before.avif
scripts/convert-screenshot-to-avif.sh artifacts/after.png artifacts/after.avif
```

- 入力 `.png`、出力 `.avif` のみ。出力先が既存なら上書きせず失敗
- ffmpeg 引数: `-frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 18 -b:v 0`
- 変換後: `ffprobe` で codec `av1` と寸法一致、`file` で AVIF 実体確認、目視比較。元 PNG は削除しない

**失敗時:** ffmpeg / libaom-av1 不足、変換エラー、寸法不一致、2 MiB 超過（repository 推奨上限）→ ユーザーへ報告し判断を待つ

### CLI upload（画像）

**put / get は必ず `--remote` を付ける。** Wrangler の local default バケットと混同しない。

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

**期待結果:** コマンド成功。Dashboard オブジェクト一覧に新 key が表示される（既存 key は変更されない）

### size / Content-Type / 公開 URL 確認

validator は R2 画像 URL を **ネットワーク取得しない**。以下でローカル確認する。

**get + MIME + サイズ:**

```bash
npx wrangler@latest r2 object get ai-html/<object-key> --file=/tmp/check-image --remote
file --mime-type /tmp/check-image
wc -c /tmp/check-image
```

**期待結果:** MIME がキー拡張子と一致（例: `.avif` → `image/avif`）。サイズが repository 推奨（1 画像 2 MiB 以下）に収まる

**公開 URL 確認:**

1. `https://ai-html.hacksaw.work/<html-object-key>` を Access 認証後に開く
2. `img-comparison-slider` 内の before/after 画像が表示されることを確認
3. DevTools → **Network** で画像リクエストが 200、Content-Type が **`image/avif`** であることを確認
4. HTML `src` のオブジェクトキーが `{html_basename}_{target}_before.avif` / `{html_basename}_{target}_after.avif` と一致することを確認

## CLI 配布 runbook（本 repository）

HTML 公開は **Wrangler CLI のみ**。

### 前提確認と版選択

| 項目 | 値 |
| --- | --- |
| バケット | `ai-html` |
| カスタムドメイン | `ai-html.hacksaw.work` |
| 公開 URL 形式 | `https://ai-html.hacksaw.work/<object-key>` |
| 今回のアップロード対象 | 新規 `v{N}` のみ（例: `2026-08-03_今回の対応概要_v4.html`） |
| 上書き禁止 | `v1`, `v2`, `v3` など既存オブジェクトは変更しない |

**画面操作:** Cloudflare Dashboard → 左メニュー **R2 object storage** → **Overview** → バケット **`ai-html`** をクリック

**期待結果:** バケット内オブジェクト一覧が表示される。既存 `v1` / `v2` / `v3` が残っている

**失敗時:** バケットが見えない場合はアカウント・権限を確認する。別バケット名を推測して操作しない

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

### CLI からのアップロード（唯一の公開経路）

**ターミナル:**

```bash
npx wrangler@latest r2 object put ai-html/2026-08-03_今回の対応概要_v4.html \
  --file=artifacts/2026-08-03_今回の対応概要_v4.html \
  --content-type=text/html \
  --remote
```

**入力値:** 上記 object key と `--content-type=text/html` を必ず指定する

**期待結果:** コマンドが成功し、Dashboard のオブジェクト一覧に同キーが表示される

**失敗時:**

- `403` / 認証エラー → OAuth 手順をやり直す
- キー typo → 404 になるため、Dashboard のキー名と完全一致を確認する

## 目視確認手順（本 repository）

公開後のブラウザ検証。**手動インフラ構築手順** とは分離する。

1. バケット **`ai-html`** → **Settings** / **Custom domains** → **`ai-html.hacksaw.work`** が **Active** であることを確認
1. ブラウザで `https://ai-html.hacksaw.work/<object-key>` を開く
1. Cloudflare Access ログイン画面が出たら組織アカウントで認証する
1. HTML が表示されたら、本文選択 → コメント追加 → **編集保存** → 再読み込みで永続化を確認する
1. 個別コピー・全件コピーが動的 Markdown ヘッダー付き形式になることを確認する
1. DevTools → **Network** → 対象 HTML レスポンス → **Content-Type: text/html** を確認する

**期待結果:** Access 後にページが表示され、コメントコア（追加・編集・削除・コピー）が動作する。`Content-Type` は `text/html`

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
- **旧版保護:** `v1` / `v2` / `v3` を削除・上書きしない
- **シークレット:** API トークン、Access シークレット、OAuth client secret、R2 認証情報を HTML やチャットに貼らない
- **Access:** 公開 HTML は Access 有効のまま運用する（意図的な無効化は別途合意）
- **Bucket Lock:** 本 repository では任意。現状未適用

## デプロイ前チェック

1. ファイルをローカルで `file://` または簡易 HTTP で開き、コメント追加・編集・再読み込み・削除・コピーを確認
1. daisyUI / Mermaid 等、使用 CDN がネットワーク到達可能か確認
1. **R2 upload 前** に [verify-review-delivery.mjs](../scripts/verify-review-delivery.mjs) を実行する（フロントエンド before/after 比較ありなら `--frontend`。R2 AVIF 必須なら `--r2-required --html-object-key <object-key> --screenshot-target <target>` も付ける）。legacy data URL 埋め込み時のみ 1 画像 2 MiB / 合計 5 MiB の推奨上限も検証する

```bash
node scripts/verify-review-delivery.mjs <html-file> [--frontend]
```

1. validator 合格後、**新規 `v{N}` として** CLI でアップロードし、既存オブジェクトを上書きしていないことを確認
1. アップロード後、**`https://ai-html.hacksaw.work/<object-key>`** で Access 認証後に目視確認手順を実施
1. PR description を更新したら、確認済み URL と body ファイルで validator を再実行する

```bash
node scripts/verify-review-delivery.mjs <html-file> [--frontend] \
  --public-url https://ai-html.hacksaw.work/<object-key> \
  --pr-body-file <pr-body.md>
```

1. 再検証合格後に description を確定する

## Cloudflare 操作（Wrangler OAuth）

R2 へのアップロード・確認は **OAuth 認証済み Wrangler CLI** で行う。

1. 操作前に `npx wrangler@latest whoami` で認証状態を確認する
1. バケット **`ai-html`** へのアクセス権も確認する
1. 認証切れ・未ログインの場合は `npx wrangler@latest login --use-keyring` を実行する
1. ログイン後、再度 `whoami` とバケットアクセスを確認してから続行する
1. **チャットで API トークン・シークレットを要求しない**

Worker デプロイや HTML への R2 アップロードコード埋め込みは **本 skill のスコープ外**。

## 生成 HTML への反映

インフラ操作を含む依頼では、[content-patterns.md](content-patterns.md) の「手動インフラ操作記録」に従い、上記 runbook の要点（全体図、**手動インフラ構築手順**、**目視確認手順**、CLI コマンド、失敗時、セキュリティ、操作ステータス）を HTML 本文に記載する。
