# issue / PR 向け R2 配布（完了ゲート・validator）

issue または PR 向けに HTML を R2 配布するときの機械検証と非コミット規則。

## コミュ用ファイルの非コミット

issue / PR 向けに生成する **レビュー用 HTML** と **before/after スクリーンショット**（PNG・AVIF 等）は、コミュニケーション・レビュー配布用の成果物であり **Git へ commit しない**。正本は R2 のみとする。

| 区分 | 扱い |
| --- | --- |
| **commit 禁止** | 生成済み PR レビュー HTML、before/after スクリーンショット、R2 upload 前の作業用コピー |
| **保管場所** | 一時ディレクトリまたは `.gitignore` 済み workspace 内（例: `tmp/`、`artifacts/`）。repository root への直置きは避ける |
| **配布** | upload 前に validator で検証し、新規 `v{N}` オブジェクトキーで R2 へ put する |
| **PR description** | 確認済み R2 HTML の公開 URL のみ `[v{N}](URL)` でリンクする。生成ファイル本体は載せない |
| **commit 可** | 本 skill の SKILL.md、`references/`、`scripts/`、`assets/` テンプレート、validator、runbook 等の **ソース・支援ファイル** |

## 完了ゲート（issue / PR 向け HTML 配布）

issue または PR 向けに HTML を R2 配布するとき、次の順序と機械検証を **必須** とする。手順を飛ばしたり、validator 失敗のまま upload / description 更新を確定してはならない。

### 手順

1. HTML を生成し、ローカルでコメントコアを目視確認する
1. **R2 upload 前** に validator を実行する（フロントエンド変更 + スクリーンショット比較ありなら `--frontend` を付ける）

```bash
node scripts/verify-review-delivery.mjs <html-file> [--frontend]
```

1. 合格後、新規 `v{N}` として R2 へアップロードする（[r2-static-delivery.md](r2-static-delivery.md)）
1. **`https://ai-html.hacksaw.work/<object-key>`** をブラウザまたは HTTP で確認する
1. PR description を更新する（`## レビュー用資料` 配下に `[v{N}](確認済みURL)` のみ）
1. **PR body 更新後** に validator を再実行する

```bash
node scripts/verify-review-delivery.mjs <html-file> [--frontend] \
  --public-url https://ai-html.hacksaw.work/<object-key> \
  --pr-body-file <pr-body.md>
```

1. 再検証も合格して初めて description を確定する

### validator の検証範囲

| オプション | 検証内容 |
| --- | --- |
| （常時） | doctype、`data-theme`、daisyUI / Tailwind CDN、コメントコア DOM・`data-action`・localStorage key |
| `--frontend` | `img-comparison-slider` CDN、`slot="first"` / `"second"`、width 100%、画像 src（data URL または確認済み R2 URL）、data URL 容量（1 画像 2 MiB / 合計 5 MiB）、撮影条件（viewport・branch・URL）。R2 URL はネットワーク取得せず CLI 確認手順を出力 |
| `--r2-required` | `data:image/` 禁止。`slot="first"` / `"second"` の src が `https://ai-html.hacksaw.work/` の確認済み R2 URL かつ `.avif` 拡張子であること |
| `--html-object-key` | HTML オブジェクトキーが `_vN.html` 形式であること。`--r2-required` と併用時は、画像 src の R2 オブジェクトキーが `{html_basename}_before.avif` / `{html_basename}_after.avif` と一致すること |
| `--public-url` | URL が `https://ai-html.hacksaw.work/` で、オブジェクトキーに `_vN.html` を含む |
| `--pr-body-file` | body に `## レビュー用資料` と、確認済み URL に一致する `[vN](URL)` がある |
| `--check-sources` | `[data-content-root]` 内の外部 `http://` / `https://` 出典 `<a href>` のページ到達性（HEAD、失敗時 GET）。404 等で fail。fragment 有無は必須 fail にしない。同一 origin+path+query は重複チェックしない。デフォルト off（opt-in）。出典リンクを含む HTML で推奨。出典リンクの執筆ルールは [source-citations.md](source-citations.md) |

失敗時は列挙された項目を修正し、該当ステップからやり直す。
