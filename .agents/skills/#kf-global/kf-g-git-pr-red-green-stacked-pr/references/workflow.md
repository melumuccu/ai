# 手順

前提: リポジトリで stacked PR が有効。[gh-stack](../../../gh-stack/SKILL.md) の Setup と非対話フラグを読んでから進める。

1. **ブランチ名を決める**

   下から順に2本。例: `test/repro-<topic>`（下層）、`fix/<topic>`（上層）。

1. **下層（PR 1）だけを実装する**

   1. [tdd](../../../tdd/SKILL.md) に沿い、仕様の形の再現テストを1本（または最小のセット）書く
   1. 実装コードは変更しない
   1. [inverted-fail-test.md](inverted-fail-test.md) に沿い成否反転と `WORKAROUND` コメントを付ける
   1. ローカルで「反転付きなら Green」「反転を外せば Red」になることを確認する
   1. 下層ブランチに commit する

1. **上層（PR 2）を積む**

   1. 下層ブランチの上に上層ブランチを切る（スタックの2段目）
   1. 不具合を直す最小の実装変更を入れる
   1. 反転修飾子と `WORKAROUND` コメントを外し、通常のテストに戻す
   1. テスト名とアサーションは下層と同一に保つ（上層 diff でテストを「通るように書き換えた」印象を避ける）
   1. 上層ブランチに commit する

1. **スタックを GitHub に出す**

   [gh-stack](../../../gh-stack/SKILL.md) の Core loop に従う。

   1. 下層から順に `gh stack init <bottom> <top>`（未登録なら）
   1. `gh stack submit --auto`（必要なら `--open`、エージェントは `--remote` 等の非対話要件を守る）
   1. 各 PR の説明に次を書く:
      - 下層: 反転テストにより「現状コードで失敗すること」を CI が検証した旨
      - 上層: 実装修正と反転解除のみで、同一テストが通る旨
      - スタック番号とマージ順（下から）

1. **レビューとマージ**

   1. レビュアーはスタック画面で2 PR の CI と Files changed を並べて Red→Green を確認する
   1. マージは `gh stack merge <top-pr> --yes` 等でスタック単位に行い、下層だけが先に `main` に入り反転テストが残る状態を避ける
   1. [kf-g-git-commit-japanese-commit-message](../kf-g-git-commit-japanese-commit-message/SKILL.md) 等、リポジトリの commit 規約に従う

## エージェント向け注意

- 下層と上層の関心事を混ぜない（下層に fix を入れない、上層でテストの意味を変えない）
- スタック操作の詳細・トラブル時は [gh-stack](../../../gh-stack/SKILL.md) の references を開く
