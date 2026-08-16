# issue description 規約

## HTML 配布あり

**適用条件:** issue プランニング用 HTML を R2 へ配布した場合。

### 必須

- `## 概要` — issue の最小サマリ
- `## プランニング用資料` — 確認済み R2 URL のみ `[v{N}](https://ai-html.hacksaw.work/<object-key>)`
- 版ラベル `v{N}` は R2 オブジェクトキーの版番号と一致させる
- 確認済み公開 URL のみ記載する（未確認 URL は載せない）

### 順序

1. `## 概要`
1. `## プランニング用資料`

## HTML 配布なし

- HTML 配布がない通常の issue プランニングでは、実装着手前に issue description を更新する
- description にはプランニングで作成した Markdown をそのまま記載し、GitHub 投稿前のフットノート記法変換は `kf-g-agent-planning-structured-plan-output` に従う
- 既存 description がある場合は参考として読み、プランニングで作成した Markdown へ統合・上書きする
