# issue / PR 向け R2 配布

issue または PR 向けに HTML を R2 配布するときの成果物の正本と配布手順。

## 成果物の正本

issue / PR 向けに生成する **レビュー用 HTML** と **before/after スクリーンショット**（PNG・AVIF 等）は、コミュニケーション・レビュー配布用の成果物。**成果物の正本:** レビュー HTML は R2。Git には skill ソースのみ。

| 区分 | 扱い |
| --- | --- |
| **R2 正本** | 生成済み PR レビュー HTML、before/after スクリーンショット、R2 upload 前の作業用コピー |
| **保管場所** | 一時ディレクトリまたは `.gitignore` 済み workspace 内（例: `tmp/`、`artifacts/`）。repository root への直置きは避ける |
| **配布** | 出力チェックリストで目視確認し、新規 `v{N}` オブジェクトキーで R2 へ put する |
| **PR description** | 確認済み R2 HTML の公開 URL のみ `[v{N}](URL)` でリンクする。生成ファイル本体は載せない |
| **Git 管理** | 本 skill の SKILL.md、`references/`、`scripts/`、`assets/` テンプレート、runbook 等の **ソース・支援ファイル** |

## 完了手順（issue / PR 向け HTML 配布）

issue または PR 向けに HTML を R2 配布するとき、次の順序で完了する。

### 手順

1. HTML を生成し、ローカルでコメントコアを目視確認する
1. [SKILL.md](../SKILL.md) の **出力チェックリスト** を満たす（HTML コア契約・daisyUI・コメント機能・版管理・PR description 形式など）
1. 出典リンクを含む場合は [source-citations.md](source-citations.md) に従う
1. 新規 `v{N}` として R2 へアップロードする（[r2-static-delivery.md](r2-static-delivery.md)）
1. **`https://ai-html.hacksaw.work/<object-key>`** をブラウザまたは HTTP で確認する
1. PR / issue description を更新する（issue: [issue description 規約](#issue-description-規約)、PR: [PR description 規約](#pr-description-規約) に従う）
1. description の URL がアップロード先 `v{N}` と一致することを目視確認する

## issue description 規約

### HTML 配布あり

**適用条件:** issue プランニング用 HTML を R2 へ配布した場合。

#### 必須

- `## 概要` — issue の最小サマリ
- `## プランニング用資料` — 確認済み R2 URL のみ `[v{N}](https://ai-html.hacksaw.work/<object-key>)`
- 版ラベル `v{N}` は R2 オブジェクトキーの版番号と一致させる
- 確認済み公開 URL のみ記載する（未確認 URL は載せない）

#### 順序

1. `## 概要`
1. `## プランニング用資料`

### HTML 配布なし

- HTML 配布がない通常の issue プランニングでは、実装着手前に issue description を更新する
- description にはプランニングで作成した Markdown をそのまま記載し、GitHub 投稿前のフットノート記法変換は `kf-g-agent-planning-structured-plan-output` に従う
- 既存 description がある場合は参考として読み、プランニングで作成した Markdown へ統合・上書きする

## PR description 規約

**適用条件:** PR レビュー用 HTML を R2 へ配布した場合（issue 起点かどうかにかかわらず）。

### 必須

- `## 概要` — PR の最小サマリ
- `## レビュー用資料` — 確認済み R2 URL のみ `[v{N}](https://ai-html.hacksaw.work/<object-key>)`
- 版ラベル `v{N}` は R2 オブジェクトキーの版番号と一致させる
- 確認済み公開 URL のみ記載する（未確認 URL は載せない）

### 条件付き

- ユーザーが対応すべきタスクがある場合のみ、`## ユーザー対応タスク` を置く。空セクションやダミーは置かない
- タスクは実行順のチェックボックスで記載し、各チェックボックス項目を親としてその配下に Bullet List で詳細かつ具体的な操作手順を書く。Web UI を見て操作するときに迷わないよう、画面名・ボタン名・入力欄などを具体的に書く

### 任意

- issue を閉じる意図がある場合のみ、末尾に `Closes #<issue-number>` を追加する

### 順序

1. `## 概要`
1. `## レビュー用資料`
1. 条件付きの `## ユーザー対応タスク`
1. 任意の `Closes #<issue-number>`
