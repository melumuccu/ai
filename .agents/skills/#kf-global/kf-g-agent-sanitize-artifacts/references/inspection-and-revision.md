# 検査と改訂

## What to Remove or Rewrite

次のような、不要な示唆を含む記述を探し、除去または書き換える。

- "As requested..."
- "Based on your instruction..."
- "We will not use..."
- "This avoids..."
- "Unlike the previous version..."
- "The user wanted..."
- "This document assumes..."
- "Because of the constraint..."
- "No Git/Homebrew/CLI/etc. is used..."
- "This was changed to..."
- "The prompt says..."
- "The conversation so far..."
- "This section was added because..."
- "To satisfy the requirement..."

機械的に削除しない。本来の読者が本当に知る必要がある場合だけ残す。

## Examples vs. Intent

ユーザーが意図伝達のために例を示した場合、artifact 自体がその例を必要としない限り artifact へコピーしない。

会話の例は通常、診断材料であり、最終コンテンツではない。

例から次を推定する。

- 望ましい抽象度
- 読者
- トーン
- 避けるべき漏洩の種類
- 除去すべき不自然な表現
- 重要な設計制約

例が artifact の主題にならないようにする。

## Constraints Are Usually Invisible

ユーザー制約は通常、artifact の設計へ反映し、明示的な免責として載せない。

悪い例:

> This guide does not use Git, Homebrew, or additional CLI tools.

良い例:

> Share the project folder using Google Drive.

後者は制約を適用しつつ、制作ルールとして露出しない。

## Inspection Checklist

artifact を検査するとき、次を確認する。

1. 会話を見ていない読者にも自然に読めるか
1. artifact の書き方を説明する文が残っていないか
1. ツール、除外、制約、回避した代替案への不要な言及がないか
1. prompt の例が成果物へ混入していないか
1. 複数回のフィードバックによる継ぎはぎの痕跡がないか
1. トーン、用語、前提が全体で一貫しているか
1. 見出しと注記が制作者向けではなく artifact の読者向けか
1. 制作過程に属するメタコメントが残っていないか
1. 免責や注意書きが読者に本当に必要な場合だけ含まれているか
1. artifact が単一の一貫した声で書かれているか

## Revision Strategy

説明より書き換えを優先する。

ユーザーが求めない限り、何を除去したかの報告を追加しない。

編集では artifact の本来の目的、技術的正確性、必要なユーザー向け要件を保つ。

制作残留物は、自然な artifact 設計へ変換して除去する。

例:

- "Do not use advanced terms" → より平易な表現へ
- "Avoid CLI black boxes" → 明確で具体的な手順へ
- "Use Google Drive, not Git" → Drive ベースの手順へ
- "Beginner-friendly" → ペース、定義、例へ
- "Do not mention X" → X について述べない（X を省略したと明言しない）

## Output Rules

artifact の改訂を求められた場合、改訂後 artifact 本体を出力する。

次のような制作コメントで前置きしない。

- "I removed the meta instructions."
- "I cleaned up the prompt leakage."
- "Here is the sanitized version."

必要な場合のみ、短いラベルを付けてよい。

改訂 artifact と変更サマリーの両方を求められた場合、artifact を先に、サマリーを後に置く。

## Quality Bar

改訂後 artifact は意図的で統一感があり、読者の文脈に自然に馴染むこと。

読者が、それらが成果物の一部である場合を除き、prompt 履歴、内部制約、修正会話を推測できないこと。
