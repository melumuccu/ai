---
name: kf-g-code-how-what-why-why-not-principles
description: Use this index skill before creating, editing, or reviewing production code, test code, commit messages or logs, or code comments in this repository. Apply it to map How/What/Why/Why not principles to their authoritative SoT skills without duplicating detailed rules.
---

# How / What / Why / Why not — 責務マップ

この skill は4原則の入口。詳細規約は各 SoT skill へ委譲する。

## 4原則

| 成果物 | 原則 | 説明 | SoT |
| --- | --- | --- | --- |
| コード | How | コード自体が実現方法を示す | （本 skill の指針のみ） |
| テストコード | What | 呼び出し側から観測可能な結果、振る舞い、仕様、契約を内部実装に依存せず示す | [tdd/SKILL.md](../tdd/SKILL.md), [tdd/tests.md](../tdd/tests.md) |
| コミットログ | Why | なぜこのように実装・変更したかを示す | [kf-g-git-commit-japanese-commit-message](../kf-g-git-commit-japanese-commit-message/SKILL.md) |
| コードコメント | Why not | なぜ別案を採らなかったか、なぜ単純化・削除できないかを示す | [kf-g-code-comment-rules](../kf-g-code-comment-rules/SKILL.md) |

## 読み進め方

1. 作業対象（コード / テスト / commit / コメント）に対応する原則行を特定する
1. 該当 SoT skill を Read する
1. How（コード）は SoT を持たない。実装そのもので方法を示す

## 作業別の必須手順

### コードを書く・直す前

1. 本 skill で How の責務を確認する
1. 実装そのもので方法を示す（How をコメントや commit に逃がさない）

### テストを書く・直す前

1. 本 skill で What の責務を確認する
1. [tdd/SKILL.md](../tdd/SKILL.md) を Read する
1. 必要なら [tdd/tests.md](../tdd/tests.md) を Read する

### commit メッセージを書く前

1. 本 skill で Why の責務を確認する
1. [kf-g-git-commit-japanese-commit-message](../kf-g-git-commit-japanese-commit-message/SKILL.md) を Read する
1. commit 依頼時は [kf-g-git-commit-staged-only-rules](../kf-g-git-commit-staged-only-rules/SKILL.md) も併用する（canonical）
1. ユーザーが `/genshijin-commit` を明示した場合のみ [genshijin-commit](../genshijin-commit/SKILL.md) を使う

### コードコメントを書く・直す前

1. 本 skill で Why not の責務を確認する
1. [kf-g-code-comment-rules](../kf-g-code-comment-rules/SKILL.md) を Read する

## orchestrator 向け

implementation worker などへ委譲するとき、委譲指示 `skills` に `kf-g-code-how-what-why-why-not-principles` を列挙する。

## 最終チェック

1. 各成果物が対応する原則（How / What / Why / Why not）に沿っている
1. 詳細規約を本 skill に複製していない
1. 該当 SoT skill を Read 済みである
