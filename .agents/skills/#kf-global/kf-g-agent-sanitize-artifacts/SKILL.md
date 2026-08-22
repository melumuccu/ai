---
name: kf-g-agent-sanitize-artifacts
description: Inspect and revise generated artifacts so they read as natural, standalone deliverables, without leaking prompt instructions, conversation history, implementation constraints, or production process into user-facing content. Use when creating, revising, or publishing user-facing artifacts—including single-file HTML documents, issue/PR review pages, annotated guides, walkthroughs, and shareable static explanation pages—or when the user asks to inspect, clean up, sanitize, revise, polish, or quality-check artifacts.
---

# artifacts の洗浄

ユーザー向け artifacts を、会話履歴や制作過程の痕跡なしに自然な成果物として整える。

## 参照ファイル

| ファイル | 読むタイミング |
| --- | --- |
| [references/overview.md](references/overview.md) | 着手時。目的、原則、対象 artifacts、単一 HTML の扱いを確認するとき |
| [references/inspection-and-revision.md](references/inspection-and-revision.md) | 除去・書き換え・検査・改訂・出力ルールを実行するとき |

## 最小適用手順

1. [references/overview.md](references/overview.md) で目的と対象 artifacts を確認する
1. 対象 artifact を読み、会話由来の痕跡がないか [references/inspection-and-revision.md](references/inspection-and-revision.md) の検査チェックリストで確認する
1. 除去・書き換え方針に従い artifact を改訂する
1. 改訂後 artifact が単体で読めることを確認する
1. ユーザーが改訂 artifact の出力を求めている場合は、改訂後 artifact 本体を出力する

## 最終チェック

1. artifact が会話履歴や制作過程を露出していない
1. 単一 HTML ドキュメントを含む対象は、生成、改訂、公開の前に本 skill を適用した
1. 出力は改訂 artifact 本体が先（変更サマリーはユーザーが求めた場合のみ後置）
