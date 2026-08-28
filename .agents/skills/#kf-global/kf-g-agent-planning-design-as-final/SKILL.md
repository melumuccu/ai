---
name: kf-g-agent-planning-design-as-final
description: Use this skill whenever creating or revising planning documents, design docs, issue/PR planning HTML, or any equivalent design text. Rewrite the published text as one complete final design, as if it had been planned that way from the start, for a reader with no prior conversation.
---

# プランニング・設計は最終形として書き直す

公開する設計の文章を、最終設計を最初からその形で計画した文書として書く。

## 原則

公開文は、会話の経緯を知らない新規参加者が通読できる最終設計だけを載せる。修正差分、検討の経緯、棄却した案の列挙、会話への言及は置かない。本 skill の存在や適用そのものは、プランニングや設計の文章に書かない。

単一 HTML の chrome・コメントコア・版の作り方は `kf-g-html-document-universal-single-file` に従う。設計テキストを公開するときは、その本文（`[data-content-root]`）を最終形として書き直す。対象は今公開する設計テキストに限る。

## 読み進め方

1. 公開する文章を、最終設計を最初からその形で計画した文書として全面的に書き直す。
1. 読者を会話の経緯を知らない新規参加者として扱い、経緯なしでも通る文だけを置く。
1. 最終設計の通読に必要な記述だけを置く。
1. 公開するプランニングや設計の文章には、設計内容だけを書く。

## 最終チェック

1. 公開文が最終設計として通読できる
1. 新規参加者が会話なしで理解できる
1. 公開文が修正差分、検討の経緯、棄却した案、会話への言及を含まない
1. 公開文が本 skill の存在や適用の記載を含まない
