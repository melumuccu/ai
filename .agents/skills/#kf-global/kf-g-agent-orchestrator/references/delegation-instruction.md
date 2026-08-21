# worker 委譲指示（orchestrator → worker）

委譲ごとにコピーして埋める。不要な節は省略。

報告形式は各 worker の agent 定義の「出力形式」に従う。共通ルールは worker skill（`.agents/skills/kf-g-agent-worker-common/`）に従う。

```markdown
## goal

<達成状態を 1 文>

## scope

- URLs:
- directories:
- files:

## inputs

- 既知事実と確定済み設計判断

## permissions

- readonly | write allowed: <paths>

`/general-worker` 委譲時は **必須**。`readonly` または `write allowed: <paths>` のいずれかを明示する。

| permissions              | 許可範囲                                                |
| ------------------------ | ------------------------------------------------------- |
| `readonly`               | Web fetch、Read/Grep/Glob、readonly Shell、browser 読取 |
| `write allowed: <paths>` | 上記 + scope 内編集、指定検証コマンド                   |

許可範囲外の操作が必要な場合は worker が `needs-escalation` する。

## constraints

- 触らない対象:
- 並列競合メモ:

## acceptance

- 完了条件:
- 実行する検証:

## budget

- time_budget: <soft budget。例: 5分。hard timeout ではない>
- max_tool_calls: <全ツール呼出上限。例: 10回。実装と diff 確認を含む>
- max_retries_per_hypothesis: <同一仮説の再試行上限。例: 1回。証拠なし反復禁止>
- checkpoint_interval: <checkpoint 更新タイミング。例: 変更完了時と検証完了時>
- stop_conditions: <作業停止条件。例: 予算到達 / 同一失敗反復 / 進捗なし>
  - 予算到達（time_budget / max_tool_calls）
  - 同一失敗の反復（max_retries_per_hypothesis 超）
  - 進捗なし

到達時は作業を停止し `needs-escalation` で partial result / checkpoint を返す。

## skills

- none（特例のみ）
- または `- {name} — {path}` を1つ以上指定

`path` は `SKILL.md` への path（プロジェクトローカル skill は `./` からの相対 path、グローバル skill は `~/` からの相対 path）。

基本的には worker skill（`kf-g-agent-worker-common`）を含める。その上でタスク固有 skill を追加してよい。

## report_sections

（任意。`/general-worker` 向け）

- 追加で含める見出し名（例: `findings`, `screenshots`, `next_steps`）

## report_budget

600 tokens（正当化時のみ最大 1000）
```

## 記載ルール

- `skills` は必須
- `/general-worker` 委譲時は `permissions` も必須
- 長時間 worker 委譲時は `budget` を指定し、具体的上限を worker へ渡す
- worker は委譲指示 `skills` に列挙された skill のみ参照する
