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

| permissions | 許可範囲 |
| --- | --- |
| `readonly` | Web fetch、Read/Grep/Glob、readonly Shell、browser 読取 |
| `write allowed: <paths>` | 上記 + scope 内編集、指定検証コマンド |

許可範囲外の操作が必要な場合は worker が `needs-escalation` する。

## constraints

- 触らない対象:
- 並列競合メモ:

## acceptance

- 完了条件:
- 実行する検証:

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
- worker は委譲指示 `skills` に列挙された skill のみ参照する
