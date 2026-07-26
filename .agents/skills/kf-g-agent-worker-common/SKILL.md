---
name: kf-g-agent-worker-common
description: Common rules for orchestrator-worker subagents (research, general, implementation, verification). Defines skill access, report constraints, and status semantics. orchestrators must list this skill in worker delegation instructions unless explicitly using none.
disable-model-invocation: true
---

# worker 共通ルール

orchestrator-workers 構成の subagent worker 共通。各 worker 種別の手順・出力形式は各 agent 定義を優先する。

## Skill 参照

- 委譲指示 `skills` に列挙された skill のみ参照する
- 読取対象: 委譲指示に記載された `path` の `SKILL.md`、および同一 skill ディレクトリ内の参照ファイル
- 列挙外 skill が必要な場合は着手せず `needs-escalation` する

### 着手前チェック

1. 委譲指示に `skills` 節が無い → 即 `needs-escalation`（orchestrator へ確認）
1. `skills: none` → skill を読まず作業可（特例）
1. `none` 以外で `kf-g-agent-worker-common` が列挙されていない → 即 `needs-escalation`（worker skill 未指定）
1. 列挙 skill に `path` が無い → 即 `needs-escalation`
1. 列挙 skill を読んでから、当該 worker agent の手順に進む

追加 skill が必要 → 着手せず `needs-escalation`（orchestrator が再選定）

## 報告共通ルール

- 委譲指示 `report_budget` を守る（既定 600 tokens、最大 1000）
- 結論・根拠・検証結果を簡潔に記載する
- 当該 worker agent の「出力形式」に従う

## status

| 値                 | 意味                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `completed`        | acceptance を満たした                                                                                |
| `blocked`          | アクセス不足、ツール失敗、ユーザー入力待ちなど外部要因で停止                                         |
| `needs-escalation` | 仕様曖昧、scope 過大、認証・セキュリティ境界、設計判断が必要、追加 skill が必要、worker skill 未指定 |
