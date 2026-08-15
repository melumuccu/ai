# 目的と使う場面

## 目的

- 変更内容を短く読み切れるコミットメッセージにそろえる
- prefix、カテゴリ付き subject、本文の役割を分けて考える
- 日本語 subject と 5 文字固定 prefix の運用を統一する
- 本文の `概要`（What）と `Why`（判断理由）の分担を明確にする

## 概要と Why の分担

| 項目 | 原則 | 詳細 |
| --- | --- | --- |
| 概要 | What | 何を変えたか |
| Why | 判断理由 | なぜこのように実装・変更したか |

定義の正は [format.md](format.md)。How / What / Why / Why not 全体の入口は [kf-g-code-how-what-why-why-not-principles](../../kf-g-code-how-what-why-why-not-principles/SKILL.md)。

## 使う場面

- コミットメッセージを考えるとき
- prefix の選択に迷うとき
- 既存メッセージをこの規約へ合わせるとき
- 日本語 subject の書き方を確認するとき
- 変更内容から prefix を決めたいとき
- docs repo や AI agent 向けファイル更新で prefix を見極めたいとき
- 本文の粒度をそろえたいとき
