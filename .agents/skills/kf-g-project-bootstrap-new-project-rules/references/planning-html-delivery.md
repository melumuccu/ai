# プランニング HTML 配布

新規 PJ 立ち上げの入口フロー（フェーズ 1〜3）で使うプランニング HTML の正本と配布手順。

## 正本とチャットの役割分担

| 区分 | 正本 | チャット |
| --- | --- | --- |
| PJ 概要の仮置き | プランニング HTML 本文 | 短いポインタと確認済み URL のみ |
| ルール適用表 | プランニング HTML 本文 | 表全文の貼付はしない |
| 要確認項目 | プランニング HTML 本文 | URL 提示後、HTML で解消できないブロッカーのみ質問可 |

## HTML 生成手順

1. `kf-g-html-document-universal-single-file` を読み、パターン C（非コーディング汎用ドキュメント）で HTML を生成する
1. 本文 `[data-content-root]` に PJ 概要、ルール適用表、要確認、各ルールの推奨理由を記載する
1. 作業用コピーは `artifacts/` 等の workspace 内に置く（repository root への直置きは避ける）
1. ローカルでコメントコアを目視確認する
1. R2 へ新規 `v{N}` として put し、公開 URL を HTTP で確認する
1. issue の `## プランニング用資料` に `[v{N}](https://ai-html.hacksaw.work/<object-key>)` を記載する
1. ユーザへ確認済み URL を先に提示し、資料を見たうえでの返信を待つ

## ルール適用表（HTML 本文テンプレート）

プランニング HTML 本文に載せる表の形式。正本は HTML。チャットへ表全文を貼らない。

```markdown
## ルール適用表（確認用）

| ルール        | 条件 | 推奨 | 理由               |
| ------------- | ---- | ---- | ------------------ |
| devcontainer  | オプション | 不適用 | デフォルトはローカル開発。必要時のみ導入 |
| mise 中心運用 | 汎用 | 適用 | tools / tasks 集約 |
| ...           | ...  | ...  | ...                |

### 要確認項目

- frontend の有無: プロンプト未記載のため要確認
- Vite+: frontend ありの場合に適用推奨
```

## AskQuestion の制限

- 確認済み HTML URL をユーザへ提示する**前**に AskQuestion しない
- URL を提示した**同じターン**に AskQuestion しない
- URL 提示**後**は、HTML 本文の要確認では解消できないブロッカーのみ AskQuestion してよい

## issue description 形式

issue プランニング HTML 配布後は、次の形式で description を更新する。

```markdown
## 概要
- <issue の最小サマリ>

## プランニング用資料
[v{N}](https://ai-html.hacksaw.work/<object-key>)
```

- 確認済み公開 URL のみ記載する
- 版ラベル `v{N}` は R2 オブジェクトキーと一致させる
