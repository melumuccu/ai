---
name: kf-g-agent-orchestrator
description: Decomposes complex tasks into research, implementation, and verification workers, then synthesizes results. Use when the user invokes /kf-g-agent-orchestrator or asks for orchestrator-worker execution on multi-step or uncertain-scope work.
disable-model-invocation: true
---

# orchestrator（orchestrator-workers）

## 用語

- **起動バッチ**: orchestrator が 1 回の判断で同時起動する worker 群
- **orchestrator サイクル**: worker 起動 → 結果受取 → 統合 → 次判断、までの 1 周
- **再委譲**: 同一目的で worker をやり直すこと（resume 含む）
- **委譲指示**: orchestrator が worker 起動時に渡す構造化 prompt

## 前提

- worker: 本リポジトリ `.cursor/agents/` の `research-worker`、`implementation-worker`、`verification-worker`。
- worker skill: `.agents/skills/kf-g-agent-worker-common/`（全 worker 共通ルール）。
- 委譲指示テンプレート: [references/delegation-instruction.md](references/delegation-instruction.md)（orchestrator → worker）。

## orchestrator が委譲する条件

次の **いずれか** に当てはまるとき:

- 探索完了まで subtask が不明
- 独立した読取、または重ならない編集が複数必要
- 設計判断と大量 fetch / 編集を分離したい

**委譲しない** 条件:

- 単一ファイルで変更内容が自明
- 固定の 1 ステップコマンドや lookup
- ユーザーが当 skill の実行も worker 委譲も求めていない

## orchestrator の責務

1. 要件が曖昧なら goal と完了条件をユーザーと確認
1. 自前処理 vs 委譲を判断。 trivial な作業は自前
1. 1 起動バッチあたり 1〜3 worker。同一質問への重複 worker 禁止
1. 安全な場合のみ並列（読取専用、またはファイル所有が分離）
1. worker 報告を統合。矛盾は先に解消
1. 実装前に設計と scope を固定
1. 実装後は verification worker を必ず実行。implementation worker の主張だけで完了扱いしない
1. 根拠と残リスク付きでユーザーへ最終回答
1. 委譲前に、各 worker が参照すべき skill を `name` / `description` から判断し、委譲指示に明記する

## Skill 指定（orchestrator）

orchestrator が worker へ渡す skill は、orchestrator の判断で選ぶ。worker 自身での skill 探索・自動適用は禁止。

1. 委譲指示 `skills` に **必ず** `kf-g-agent-worker-common` を含める（特例で `none` のみ可）
1. 各 skill は `{name} — {path}` で列挙する（path 必須）
1. タスクに応じて追加 skill を列挙する（過剰指定しない）
1. worker は列挙された skill のみ参照する

追加 skill が必要と worker から `needs-escalation` された場合、orchestrator が再選定して再委譲する。

## orchestrator がしてはいけないこと

- research worker で済むのに大ファイル読取、広範囲検索、ログ直出し
- 設計・scope 未固定の実装
- コード変更後の verification worker 省略
- 1 起動バッチ 3 worker 超
- 想定外の orchestrator サイクル（下記「上限」参照）をユーザー承認なしで追加
- 同一 worker への再委譲 2 回超。超えたらユーザーへエスカレーション
- 委譲指示に `skills` を省略する、または `none` 以外で `kf-g-agent-worker-common` を欠く
- SKILL.md 全文を委譲指示に貼り、worker のコンテキストを不必要に膨らませる

## 上限

- **起動バッチ**: 最大 3 worker
- **再委譲**: worker あたり 1 回まで
- **orchestrator サイクル**: 通常 3（調査 → 実装 → 検証）。合計 5 超、または検証 fail 後の追加サイクルはユーザー承認を得る

## worker 選択

| 用途                                | worker                   | 実行                       |
| ----------------------------------- | ------------------------ | -------------------------- |
| Web fetch、ファイル読取、コード探索 | `/research-worker`       | 並列可、background 可      |
| 承認済み設計に沿った編集            | `/implementation-worker` | ファイル重複なし時のみ並列 |
| 主張・diff・テストの独立確認        | `/verification-worker`   | 実装後                     |

軽い codebase 探索のみなら built-in `explore` も可。

## 委譲手順

1. worker 委譲指示を書く（[delegation-instruction.md](references/delegation-instruction.md) 参照）。必要な事実だけ渡す
1. 明示起動: `/research-worker ...`、`/implementation-worker ...`、`/verification-worker ...`
1. 追加入力は **resume**（agent ID）優先。不要な cold start 回避
1. 予算超過、根拠欠落、prompt 再掲、未許可 skill 参照、worker skill 欠落、出力形式違反の報告は却下。委譲指示を再発行するか resume で修正

## 統合出力（ユーザー向け）

- 実施内容
- 主要な設計判断
- 根拠（path、URL、テスト結果）
- 検証結果
- 残リスク・フォローアップ

orchestrator の説明は短く。worker 詳細は構造化報告に任せ、逐語反復しない。
