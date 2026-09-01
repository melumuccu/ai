# 出力チェックリスト

配布モードは [delivery-policy.md](delivery-policy.md) で確定する。該当セクションのみを適用する。

## 常時必須

HTML 生成とローカル検証。R2 の有無にかかわらず満たす。

- [ ] **artifacts:** 生成 HTML を `artifacts/` 配下に `_v{N}` 付きファイル名で保存した
- [ ] **配布形式:** 単一 `.html` + 必要 CDN のみ
- [ ] **コア契約:** [core-contract.md](core-contract.md) と [universal-single-file-template.html](../assets/universal-single-file-template.html) を満たす
- [ ] **比較表:** template のソート可能表契約を満たす（ヘッダーは不透明背景で tbody が透過しない）
- [ ] **視覚構造:** [content-patterns.md](content-patterns.md) の積み順・論理分離・冗長エンコード・タイポグラフィ・見出し階層
- [ ] **手順 UI:** daisyUI `steps` を使っていない。順番のある内容は template の手順 UI パターン（自作 UI）に従った
- [ ] **Mermaid 向き:** flowchart で TD / LR を選べる場合は TD を基本とした
- [ ] **専門用語・左注釈:** パターン別必須度を満たす（[content-patterns.md](content-patterns.md) § 専門用語・左注釈）
- [ ] **出典リンク:** 外部根拠を `<a href>` でリンク化（[source-citations.md](source-citations.md)）
- [ ] **手動インフラ:** 依頼主題がインフラ操作のとき [content-patterns.md](content-patterns.md) パターン D を `[data-content-root]` に含める
- [ ] **本文:** `[data-content-root]` は依頼主題のみ。公開手順（put・object-key・URL 確認）は転記しない
- [ ] **コメント機能:** 選択→追加→編集→再読み込み→削除→コピーをローカルで確認した
- [ ] **validator:** 合格

## R2 配布時

[delivery-policy.md](delivery-policy.md) で R2 配布を選択したときのみ。

- [ ] **版番号:** 新規 `v{N}` を決定し、ローカルファイル名・HTML 版ラベル・R2 object-key が一致する
- [ ] **upload:** Wrangler CLI（`--remote`）で `Content-Type: text/html` を指定して put した
- [ ] **公開確認:** Access 認証後に表示・コメント機能・Network の Content-Type を確認した
- [ ] **URL 返却:** 完了報告に確認済み `[v{N}](https://ai-html.hacksaw.work/<object-key>)` を含めた
- [ ] **before/after:** 適用条件を満たす場合は [frontend-screenshot-comparison.md](frontend-screenshot-comparison.md) に従う

認証・権限・公開確認に失敗した場合は未配布として報告し、URL を捏造しない。

## issue / PR 時のみ

issue または PR 向けに HTML を R2 配布したときのみ。

- [ ] **description:** 確認済み `[v{N}](URL)` を所定見出し直下に記載した（issue: [issue-description.md](issue-description.md)、PR: [pr-description.md](pr-description.md)）
- [ ] **正本:** レビュー HTML の正本は R2。Git には skill ソースのみ（[pr-review-delivery.md](pr-review-delivery.md)）
