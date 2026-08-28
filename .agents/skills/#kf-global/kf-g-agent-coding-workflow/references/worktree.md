# worktree の配置

issue 着手時は `~/projects/_worktrees/<repo-name>/` 配下に worktree を作る。

| 項目 | 形式 |
| --- | --- |
| branch | `issue-<issue-number>-<slug>` |
| path | `~/projects/_worktrees/<repo-name>/issue-<issue-number>-<slug>` |

## 手順

1. repository 名と issue 番号、短い slug を確定する
1. 上表の branch 名と path を組み立てる
1. その path に worktree を作成し、以後の変更はその中だけで行う
