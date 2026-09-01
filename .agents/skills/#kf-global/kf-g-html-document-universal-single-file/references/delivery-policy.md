# 配布モード

[SKILL.md](../SKILL.md) の実行手順 1 で読み、配布モードを確定する。

## 既定動作

1. skill が明示的に呼び出された場合、既定を **R2 配布** とする。skill 呼出し自体を外部配布の許可とみなす。
1. 依頼に「ローカルのみ」「R2不要」「アップロードしない」のいずれかがある場合だけ **ローカル配布** とする。
1. R2 配布では既存版を上書きせず、新規 `v{N}` を使う。
1. 認証・権限・公開確認に失敗した場合は **未配布** として報告する。URL を捏造しない。
1. R2 配布の完了報告には確認済み `[v{N}](URL)` を必ず含める。
1. ローカル配布の完了報告には、R2 未実施である理由とローカルファイルパスを含める。

## ローカル成果物

生成 HTML は **作業セッションの artifacts** の一つとして扱う。

| 項目 | ルール |
| --- | --- |
| **配置** | workspace 内の `artifacts/` 配下（`.gitignore` 済み推奨）。`docs/` や repository root への直置きは避ける |
| **ファイル名** | R2 object-key と同じ basename（例: `2026-08-31_対応概要_v1.html`）。版番号 `_v{N}` を必ず含める |
| **版管理** | 改訂ごとに `_v{N}` を単調増加。欠番・再利用しない。R2 配布時はローカルファイル名と R2 key の `v{N}` を一致させる |

R2 配布前の作業用コピー、before/after 画像、変換中間ファイルも `artifacts/` に置く。

## R2 配布モード

R2 配布を選択したときは [r2-static-delivery.md](r2-static-delivery.md) を読み、次を実行する。

1. 新規 `v{N}` を決定する
1. `artifacts/` に版番号付き HTML を保存する
1. Wrangler CLI（`--remote`）で `ai-html` バケットへ put する
1. `https://ai-html.hacksaw.work/<object-key>` の Content-Type・表示・コメント機能を確認する
1. 完了報告で版番号付き確認済み URL を返す

put コマンド・object-key 説明・公開 URL 確認手順は読者向け成果物（HTML・issue・PR・comment）へ転記しない。`[data-content-root]` には依頼主題だけを書く。

## ローカル配布モード

ローカル配布を選択したときは R2 へ put しない。

1. `artifacts/` に版番号付き HTML を保存する
1. ローカルでコメントコアを確認する
1. validator を実行する
1. 完了報告にローカルパスと R2 未実施理由を記載する

## issue / PR 向け

issue または PR 向けに HTML を生成した場合、R2 配布モードでは description 更新まで完了条件に含める。

- issue: [issue-description.md](issue-description.md)
- PR: [pr-description.md](pr-description.md)
- 手順の正本: [pr-review-delivery.md](pr-review-delivery.md)
