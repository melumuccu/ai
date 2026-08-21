# レビュー出力形式

**前提**: [SKILL.md](../SKILL.md) frontmatter `description` の対象条件を満たす場合のみ本出力形式を使用する。

## 第1段階出力

```markdown
## stage

1 — blind diff review

## status

completed | blocked | needs-escalation

## findings

| id | tag | severity | location | finding | suggested action |
| --- | --- | --- | --- | --- | --- |
| S1-001 | plan-independent | blocker | `path:L42` | ... | ... |
| S1-002 | plan-dependent | question | `path:L10` | plan 未確認のため判定保留 | 第2段階で plan 照合 |

### severity

- `blocker`: merge 阻止
- `risk`: 修正推奨
- `nit`: 任意
- `question`: 確認事項

## stop reason

<完了 / blocked / 予算到達 等>
```

## 第1段階未完了報告（needs-escalation 時）

stage1 全 scope レビュー未完了時。第2段階 plan 照合入力には使わない。artifact として報告に残す。

```markdown
## stage

1 — blind diff review (incomplete)

## status

needs-escalation

## reviewed scope

- `path/to/reviewed/file.ts`
- ...

## unreviewed scope

- `path/to/unreviewed/file.ts`
- ...

## findings

| id | tag | severity | location | finding | suggested action |
| --- | --- | --- | --- | --- | --- |
| S1-001 | plan-independent | risk | `path:L10` | ... | ... |

## stop reason

予算到達。scope の <N> 件中 <M> 件をレビュー済み。

## restart request

stage1 を再起動し、全 scope レビュー完了（`completed`）後に stage2 を開始する。
```

## 第2段階出力

```markdown
## stage

2 — plan alignment review

## status

completed | blocked | needs-escalation

## stage1 inheritance

| id | stage1 severity | disposition | final severity | plan alignment | quality validity | notes |
| --- | --- | --- | --- | --- | --- | --- |
| S1-001 | blocker | confirmed | blocker | n/a | issue remains | plan 照合後も維持 |
| S1-002 | risk | plan-aligned-quality-issue | risk | aligned | issue remains | plan §3 通りだが3層抽象は保守コスト過大。final severity 維持 |
| S1-003 | question | plan-dependent-resolved | n/a | aligned | n/a | plan §2 と意図一致。要件充足を確認。final severity `n/a` |
| S1-005 | question | plan-aligned-quality-issue | question | aligned | issue remains | stage1 は plan-dependent。plan §5 通りだが過剰抽象。final severity 維持 |
| S1-004 | risk | context-added | risk | aligned | issue remains | plan 文脈追記。final severity 維持 |
| S1-006 | blocker | factually-incorrect | n/a | n/a | n/a | L42 は diff に存在せず。指摘無効。stage1 blocker → final severity `n/a` |
| S1-007 | risk | plan-mismatch-escalated | risk | mismatch | issue remains | plan §6 要件未達。final severity 維持 |

### disposition 一覧

| disposition | 意味 |
| --- | --- |
| `confirmed` | 第1段階指摘を plan 照合後も維持 |
| `context-added` | 指摘は維持。plan 文脈を追記（severity は維持） |
| `plan-mismatch-escalated` | plan 不整合を新たに確認。重大度維持または昇格 |
| `plan-aligned-quality-issue` | plan 整合かつ品質問題あり。stage1 severity を final severity として維持。指摘本文も維持 |
| `plan-dependent-resolved` | plan-dependent 指摘について要件充足・意図一致を確認。品質妥当性が `n/a` または `resolved` の場合に付与。final severity は `n/a` または `resolved`（merge blocker カウント対象外） |
| `factually-incorrect` | stage2 で検証可能な事実誤りを根拠付きで確認。指摘無効。final severity は `n/a`（merge blocker カウント対象外） |

### 判定欄

| 列 | 値 | 意味 |
| --- | --- | --- |
| stage1 severity | blocker / risk / nit / question | 第1段階で付与した severity。集計には使わない |
| final severity | blocker / risk / nit / question / n/a / resolved | stage2 確定 severity。blocker 集計はこの列を使う |
| plan alignment | aligned / mismatch / n/a | plan・acceptance との一致 |
| quality validity | issue remains / resolved / n/a | 品質・保守性・安全性・性能上の妥当性 |

### 品質軸再判定（必須）

- stage1 タグに依存せず、各指摘で品質妥当性を再判定する
- plan-dependent タグの指摘でも品質次元を含む場合、品質妥当性を再評価する
- plan 整合かつ `quality validity: issue remains` → `plan-aligned-quality-issue`。stage1 severity を final severity として維持する
- `plan-dependent-resolved` は plan 整合（要件充足・意図一致）の確認に限定する。品質妥当性が `n/a` または `resolved` の場合に付与する。final severity は `n/a` または `resolved` とする
- plan-independent 指摘の disposition 変更は `factually-incorrect` のみ。根拠付きの事実誤り確認と notes 記載が必須
- `factually-incorrect` は final severity を `n/a` とし、merge blocker カウント対象外とする

## new findings

| id | severity | location | finding | suggested action |
| --- | --- | --- | --- | --- |
| S2-001 | risk | `path:L88` | plan scope 外の変更 | scope 修正または plan 更新 |
| S2-002 | risk | plan §4 | plan 自体が過剰抽象を要求 | plan 簡素化を検討 |

## summary

- blockers: <count>
- risks: <count>
- merge recommendation: approve | request-changes | blocked

### blocker count 集計

stage2 最終 disposition と final severity 列に基づいて算出する。stage1 severity 列は集計に使わない。

| 区分 | disposition / 条件 |
| --- | --- |
| 集計対象 disposition | `confirmed`、`context-added`、`plan-mismatch-escalated`、`plan-aligned-quality-issue` |
| 除外 disposition | `factually-incorrect`、`plan-dependent-resolved` |
| 集計条件 | 集計対象 disposition かつ final severity 列が `blocker` の行（stage1 inheritance 表）。new findings は severity 列が `blocker` の行 |

merge recommendation は品質 blocker（`plan-aligned-quality-issue` 含む）を反映する。

## stop reason

<完了 / blocked / 予算到達 等>
```

## resume 不成立時の報告

第2段階は同一 subagent の `resume` 必須。`resume` 不成立時は `blocked` として報告し、同一 reviewer 再起動を要求する。

```markdown
## status

blocked — stage2 resume unavailable

## stage1 artifact

<第1段階出力全文>

## resume failure

- agent_id: <第1段階 subagent ID>
- reason: <resume 失敗理由>

## restart request

2段階レビューを最初から再起動する。第1段階 reviewer を新規起動し、完了後に同一 subagent を resume で第2段階へ。
同一 reviewer を resume で継続する。resume 不成立時は blocked として報告し、同一 reviewer 再起動を要求する。
```

## 必須出力条件

- 第2段階出力に第1段階 findings 表（stage1 inheritance）をすべて含める
- 第1段階指摘ごとに disposition・plan alignment・quality validity・根拠を付ける
- stage1 タグに依存せず品質妥当性を再判定する
- plan-dependent タグの指摘で品質問題が残る場合、`plan-aligned-quality-issue` とし stage1 severity を final severity として維持する
- final severity は disposition と根拠で説明する
- `plan-aligned-quality-issue` は stage1 severity を final severity として維持する
- `plan-dependent-resolved` は plan 整合（要件充足・意図一致）の確認に限定する。品質妥当性が `n/a` または `resolved` の場合に付与する。final severity は `n/a` または `resolved` とする
- plan-independent 指摘の disposition 変更は `factually-incorrect` のみ。notes に事実誤り根拠を記載する
- `factually-incorrect` は final severity を `n/a` とする
- `blockers: <count>` は stage2 最終 disposition と final severity 列に基づいて算出する。集計対象 disposition（`confirmed` / `context-added` / `plan-mismatch-escalated` / `plan-aligned-quality-issue`）かつ final severity が `blocker` の行を数える。除外 disposition（`factually-incorrect` / `plan-dependent-resolved`）は集計対象外。stage1 severity 列ではなく disposition 列と final severity 列を集計する
- 第1段階の plan-dependent 指摘は第2段階入力全文を添付したうえで disposition を付ける
