---
name: kf-g-git-pr-red-green-stacked-pr
description: >
  Use when a bug fix or regression test must leave CI evidence that the test failed on the code before the fix
  (Red-Green Stacked PR: bottom PR with inverted-fail reproduction test, top PR with fix and normal test).
  Apply when the user mentions red-green stacked PR, test.fails reproduction PR, stacking red and green in CI,
  or proving a regression test actually failed pre-fix. Stack operations defer to gh-stack; test quality defers to tdd.
---

# Red-Green Stacked PR

不具合修正や回帰テストで、「修正前のコードでテストが本当に落ちていたか」を CI 履歴に残すための運用。
TDD の Red→Green を GitHub の stacked PR の2層に分け、各層を独立した CI 検証単位にする（概念の出典: [Red-Green Stacked PR のすすめ](https://zenn.dev/bmth/articles/red-green-stacked-pr)）。

## 関連 skill（詳細は各 skill を読む）

| skill | 役割 |
| --- | --- |
| [tdd](../../tdd/SKILL.md) | テストの書き方、シーム、Red→Green のループ |
| [gh-stack](../../gh-stack/SKILL.md) | ブランチの積み上げ、`submit` / `merge` / 非対話フラグ |

## 参照ファイル

- [references/overview.md](references/overview.md) — 着手時: 目的・2層の意味・CI が保証する範囲
- [references/workflow.md](references/workflow.md) — 着手時: 実装から PR 提出までの手順
- [references/inverted-fail-test.md](references/inverted-fail-test.md) — 着手時: 成否反転テストと PR 本文の書き方
- [references/limitations-and-fit.md](references/limitations-and-fit.md) — 着手時: 向き不向きと atomic commit との関係

## 読み進め方

1. [references/overview.md](references/overview.md) で2層スタックの意図を確認する
1. [tdd](../../tdd/SKILL.md) でシームとテスト名を決め、再現テストを書く
1. [references/inverted-fail-test.md](references/inverted-fail-test.md) で下層 PR 用の反転失敗テストを整える
1. [references/workflow.md](references/workflow.md) に沿って下層→上層のブランチとコミットを作る
1. [gh-stack](../../gh-stack/SKILL.md) で `init` → `submit` →（マージ時）`merge` を実行する
1. [references/limitations-and-fit.md](references/limitations-and-fit.md) で適用外かどうかを最終確認する

## 最終チェック

1. 下層 PR だけに反転失敗テストと `WORKAROUND` コメントがあり、実装変更は含めない
1. 上層 PR で反転を外し、同じアサーション・同じテスト名で実装を直している
1. スタックは [gh-stack](../../gh-stack/SKILL.md) で登録・提出し、マージはスタック単位で行う
1. PR 説明に「下層 CI = 現状で落ちる」「上層 CI = 修正後に通る」と対応が書かれている
