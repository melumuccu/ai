# 境界と他 skill との関係

## この skill が担うこと

- 設計または実装を終え、一次回答したあとの検証起動
- 指摘を自己改善へつなげるオーケストレーション

評価姿勢の詳細は `kf-g-agent-review-adversarial-evaluation`、実装後プログラミングレビューの段階手順は `kf-g-agent-review-post-implementation-two-stage` が担う。

## 置換・統合しない skill

- **`kf-g-agent-review-adversarial-evaluation` と統合しない**
  - ユーザー依頼そのものが助言、レビュー、評価、第二意見であるときはそちら
  - 本 skill は一次回答後の自己検証から、設計分としてそちらを呼び出す
- **`kf-g-agent-review-post-implementation-two-stage` と置換しない**
  - 実装後の 2 段階レビュー、plan 盲検はそちらの責務
  - 本 skill は一次回答のあとにそちらを起動する
- **`kf-g-agent-research-report-only-unless-approved` と統合しない**
  - 編集禁止、許可待ちゲートはそちら

## 適用しない場面

- **事実照会のみ**（評価対象がない質問）
- **ユーザー依頼そのものがレビュー**であるとき。その場合は `kf-g-agent-review-adversarial-evaluation` を使う
- **一次回答前**。未回答なら先に一次回答し、そのあとで本 skill の手順へ進む
