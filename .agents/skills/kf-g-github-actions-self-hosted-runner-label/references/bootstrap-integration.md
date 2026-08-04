# bootstrap との連携

## sibling skill との役割分担

| 関心事 | 担当 |
|--------|------|
| `runs-on` label 規約 / merge 前確認 | 本 skill |
| RUNNER_TOOL_CACHE / mise 分割 / GHA cache 非採用 | `kf-g-github-actions-self-hosted-ci-cache` |
| runner バイナリ install / launchd | host README |
| PJ 立ち上げ全体フロー / ルール適用表 | `kf-g-project-bootstrap-new-project-rules` |

## フェーズ 1: ヒアリング

bootstrap フェーズ 1 で **CI runner** を確認する。

| 選択肢 | 本 skill の適用 |
|--------|----------------|
| `ubuntu-latest` | 不適用 |
| Mac Studio self-hosted | **適用** |
| 混在 | job ごとに判断。self-hosted job には label 必須 |

## フェーズ 2: ルール適用表

CI runner = Mac Studio self-hosted を **適用** とした場合、ルール表に `self-hosted runner CI` 行が現れる。

| ルール | 条件 | 参照 | 概要 |
|--------|------|------|------|
| self-hosted runner CI | CI = Mac Studio self-hosted を **適用** | 本 skill | `runs-on: [self-hosted, <repo-slug>]` 固定。host runner 未登録時は merge 不可 |

## フェーズ 4: 実装時

1. host README に従い runner を登録する（workflow merge より先）
2. `.github/workflows/*.yml` の self-hosted job に `runs-on: [self-hosted, <repo-slug>]` を書く
3. mise / pnpm 重い job には sibling skill の bootstrap step を足す
4. bootstrap [checklist.md](../../kf-g-project-bootstrap-new-project-rules/references/checklist.md) の self-hosted 項目を確認する
