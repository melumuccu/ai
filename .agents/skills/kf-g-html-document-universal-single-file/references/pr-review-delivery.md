# issue / PR 向け R2 配布

issue または PR 向けに HTML を R2 配布するときの非コミット規則と完了手順。

## コミュ用ファイルの非コミット

issue / PR 向けに生成する **レビュー用 HTML** と **before/after スクリーンショット**（PNG・AVIF 等）は、コミュニケーション・レビュー配布用の成果物であり **Git へ commit しない**。正本は R2 のみとする。

| 区分 | 扱い |
| --- | --- |
| **commit 禁止** | 生成済み PR レビュー HTML、before/after スクリーンショット、R2 upload 前の作業用コピー |
| **保管場所** | 一時ディレクトリまたは `.gitignore` 済み workspace 内（例: `tmp/`、`artifacts/`）。repository root への直置きは避ける |
| **配布** | 出力チェックリストで目視確認し、新規 `v{N}` オブジェクトキーで R2 へ put する |
| **PR description** | 確認済み R2 HTML の公開 URL のみ `[v{N}](URL)` でリンクする。生成ファイル本体は載せない |
| **commit 可** | 本 skill の SKILL.md、`references/`、`scripts/`、`assets/` テンプレート、runbook 等の **ソース・支援ファイル** |

## 完了手順（issue / PR 向け HTML 配布）

issue または PR 向けに HTML を R2 配布するとき、次の順序で完了する。

### 手順

1. HTML を生成し、ローカルでコメントコアを目視確認する
1. [SKILL.md](../SKILL.md) の **出力チェックリスト** を満たす（HTML コア契約・daisyUI・コメント機能・版管理・PR description 形式など）
1. 出典リンクを含む場合は [source-citations.md](source-citations.md) に従う
1. 新規 `v{N}` として R2 へアップロードする（[r2-static-delivery.md](r2-static-delivery.md)）
1. **`https://ai-html.hacksaw.work/<object-key>`** をブラウザまたは HTTP で確認する
1. PR / issue description を更新する（issue: `## プランニング用資料`、PR: `## レビュー用資料` 配下に `[v{N}](確認済みURL)` のみ）
1. description の URL がアップロード先 `v{N}` と一致することを目視確認する

### PR description 形式

| 用途 | 見出し | リンク形式 |
| --- | --- | --- |
| issue プランニング | `## プランニング用資料` | `[v{N}](https://ai-html.hacksaw.work/<object-key>)` |
| PR レビュー | `## レビュー用資料` | `[v{N}](https://ai-html.hacksaw.work/<object-key>)` |

- 版ラベル `v{N}` は R2 オブジェクトキーの版番号と一致させる
- 確認済み公開 URL のみ記載する（未確認 URL は載せない）
