---
name: kf-g-agent-orchestrator
description: Delegates all execution to workers, then synthesizes results for design and planning. Use when the user invokes /kf-g-agent-orchestrator or asks for orchestrator-worker execution on multi-step or uncertain-scope work.
disable-model-invocation: true
---

# orchestrator（orchestrator-workers）

## 用語

- **起動バッチ**: orchestrator が 1 回の判断で同時起動する worker 群
- **orchestrator サイクル**: worker 起動 → 結果受取 → 統合 → 次判断、までの 1 周
- **再委譲**: 同一目的で worker をやり直すこと（resume 含む）
- **委譲指示**: orchestrator が worker 起動時に渡す構造化 prompt

## 前提

- worker: subagents を指す。
- worker skill: `.agents/skills/kf-g-agent-worker-common/`（全 worker 共通ルール）。
- 委譲指示テンプレート: [references/delegation-instruction.md](references/delegation-instruction.md)（orchestrator → worker）。

## orchestrator のルール

orchestrator は **worker 委譲と、その報告に基づく設計・プランニングのみ** 行う。対象リポジトリの探索・実装・検証は worker に委譲する。

- すべての実作業は worker へ委譲する
- 1 回の worker 起動処理あたり 1〜5 worker（分割方針に従う）。同一質問へは 1 worker のみ起動する
- 安全な場合のみ並列（読取専用、またはファイル所有が分離）

### 分割方針

起動前に独立作業単位を列挙し、重複参照・依存・無理分割がなければその数（上限 5）で起動する。

**独立作業単位の例**: 異なる file / directory / URL 調査、依存なし複数 file 実装、異なる検証対象。

**起動数**

1. 独立単位を数える
1. ≥5 → 優先度上位 5 件起動（残りは次サイクル）
1. 1〜4 → その数で起動（5 へ満たす分割禁止）
1. 1 → 1 worker

**5 未満に留める条件**（該当時分割禁止）:

- 同一 file / 同一 URL・Web サイト参照重複
- 前後依存で並列不可
- 作業小さく並列コスト > 利益
- 人為細分化（同一 file 文言検討を複数 worker へ重複委譲等）

**「可能なら 5」**: 独立単位 ≥5 かつ上記禁止に該当しない → 5 worker 優先。該当しない → 1〜4 許容、無理に 5 へ増やさない。

**所有分離**: 調査は参照範囲、実装は file 所有、検証は検証対象を worker ごとに分離する。verification worker は実装統合後に別起動する。

### orchestrator が行なってよいこと

- 設計・プラン・方針の作成
- 当 skill のメタデータと委譲指示テンプレの Read
- worker に渡す skill の `name` / `description` の確認

対象リポジトリのファイル探索・読取は直接行わず、探索 worker に委譲する。

### 作業の流れ (例)

1. 要件が曖昧なら goal と完了条件をユーザーと確認
1. 委譲前に、各 worker が参照すべき skill を `name` / `description` から判断し、委譲指示に明記する
1. worker 報告を統合。矛盾は先に解消
1. 実装前に設計と scope を固定
1. 実装後は verification worker を必ず起動し、implementation worker の主張を独立確認する
1. 根拠と残リスク付きでユーザーへ最終回答

## orchestrator が worker へ委譲すること

次の作業は worker へ委譲する。規模・簡単さによる例外なし。

- browser 操作（cursor-ide-browser MCP 含む）
- WebSearch / WebFetch
- Read / Glob / Grep / コード探索
- Shell / コマンド実行
- ファイル編集・削除
- テスト・lint・検証実行
- 組み込み subagent の起動（Task ツール）
- 上記に該当する調査・実装・検証の実作業全般

## Skill 指定（orchestrator）

orchestrator が worker へ渡す skill を選定し、委譲指示に列挙する。

1. 委譲指示 `skills` に **必ず** `kf-g-agent-worker-common` を含める（特例で `none` のみ可）
1. 各 skill は `{name} — {path}` で列挙する（path 必須）
1. タスクに必要な skill のみ列挙する
1. ユーザー向け artifacts を生成または改訂する委譲では `kf-g-agent-sanitize-artifacts` を skills に列挙する。単一 HTML インタラクティブドキュメント（issue / PR レビュー、説明ページ等）は artifacts に含まれる
1. worker は列挙された skill のみ参照する

追加 skill が必要と worker から `needs-escalation` された場合、orchestrator が再選定して再委譲する。

## 上限

- **起動バッチ**: 最大 5 worker
- **再委譲**: worker あたり 1 回まで
- **orchestrator サイクル**: 通常 3（調査 → 実装 → 検証）。合計 5 超、または検証 fail 後の追加サイクルはユーザー承認を得る

## worker 選択

| 用途                                                               | worker                   | 実行                       |
| ------------------------------------------------------------------ | ------------------------ | -------------------------- |
| Web fetch、ファイル読取、コード探索                                | `/research-worker`       | 並列可、background 可      |
| 承認済み設計に沿った編集                                           | `/implementation-worker` | ファイル重複なし時のみ並列 |
| 主張・diff・テストの独立確認                                       | `/verification-worker`   | 実装後                     |
| 定義済み worker に当てはまらない作業（browser、Shell、混合作業等） | `/general-worker`        | permissions / scope に従う |

**選定優先順位**: 専門 worker（research / implementation / verification）が適合する場合は専門 worker を選ぶ。どれにも当てはまらない場合のみ `/general-worker` を使う。

### worker model

worker subagent 起動時、`model` は次の優先順位で決める。

1. **対象 worker の agent 定義**（`.agents/{worker名}.md`）の frontmatter に `model` がある → それを使う
1. **`model` 未定義** → `.agents/general-worker.md` の frontmatter `model` を fallback として使う

- orchestrator は worker 起動時、上記優先順位に従って `model` を指定する
- fallback 元の model 名を本 skill 内に固定値として書かない（`.agents/general-worker.md` を参照する）

## 委譲手順

1. worker 委譲指示を書く（[delegation-instruction.md](references/delegation-instruction.md) 参照）。必要な事実だけ渡す。複数 worker 並列時は constraints の `並列競合メモ` に file / URL 所有を明記する
1. 明示起動: `/research-worker ...`、`/general-worker ...`、`/implementation-worker ...`、`/verification-worker ...`
1. 追加入力は **resume**（agent ID）優先。不要な cold start 回避
1. 報告に不備（予算超過、根拠欠落、prompt 再掲、未許可 skill 参照、worker skill 欠落、出力形式違反）がある場合は委譲指示を再発行するか resume で修正

## 統合出力（ユーザー向け）

- 実施内容
- 主要な設計判断
- 根拠（path、URL、テスト結果）
- 検証結果
- 残リスク・フォローアップ

orchestrator の説明は短く。worker 詳細は構造化報告に任せる。
