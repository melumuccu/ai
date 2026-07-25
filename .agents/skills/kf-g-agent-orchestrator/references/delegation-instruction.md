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

## builtin_subagents

`/builtin-subagent-worker` 委譲時のみ。1 件以上、最大 3 件。

各要素:

- `subagent_type` — 組み込み subagent 種別（explore, shell, generalPurpose 等）
- `goal` — 子 subagent の達成状態（1 文）
- `scope` — URLs / directories / files
- `acceptance` — 子 subagent の完了条件
- `run_in_background` — true | false

同一目的の重複禁止。worker は各要素の `goal` / `scope` / `acceptance` を Markdown 結合して子 prompt に渡す。並列起動はファイル編集競合がない場合のみ。

## permissions

- readonly | write allowed: <paths>

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

## report_budget

600 tokens（正当化時のみ最大 1000）
```

## 記載ルール

- `skills` は必須
- worker は委譲指示 `skills` 以外の skill を読んではならない
