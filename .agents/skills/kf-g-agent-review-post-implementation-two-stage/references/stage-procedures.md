# 2段階レビュー手順

**前提**: [SKILL.md](../SKILL.md) frontmatter `description` の対象条件を満たす場合のみ本手順を読む。

全体フロー・orchestrator 委譲: [orchestrator-guide.md](orchestrator-guide.md)

## 忖度防止

| 段階 | 必須手順 | 理由 |
| --- | --- | --- |
| 第1段階 | 入力を diff・scope・委譲指示に限定し、plan・issue 本文・acceptance・設計意図は stage2 入力として追加する | plan を知ると実装意図を推測し、指摘を弱めてしまうため |
| 第1段階 | plan 依存の疑いは **plan-dependent** として記録し、第2段階で disposition を付ける | plan 未読の段階では判断を保留させるため |
| 第2段階 | stage1 出力全文をそのまま引き継ぎ、disposition と根拠を追加する | 実装差分の事実と影響を根拠に評価する |
| 第2段階 | 同一 reviewer を `resume` で継続する | 第1段階の文脈と説明責任を維持する |

第1段階で plan 依存の疑いがある指摘は **plan-dependent** として残す。第2段階で plan と照合し、解消・継続・新規追加を判定する。

## 第1段階: 差分単独レビュー

### 入力

- レビュー対象 diff（`branch changes` または `uncommitted changes`）
- scope（files / directories）
- 第1段階 reviewer への委譲指示（plan 非共有）

### 入力の限定

第1段階入力は diff・実行結果・テスト・scope・委譲指示に限定する。

第2段階入力として追加する:

- plan 文書
- issue description / PR description の plan 節
- orchestrator の設計メモ
- acceptance 全文（plan 由来の完了条件）

### 着手前

1. diff と scope を確定する
1. stage1 入力を diff・実行結果・テスト等に限定し、plan は stage2 入力として追加する
1. orchestrator 側で第1段階 prompt に diff と scope のみを含める

### レビュー観点

差分だけから判定できる項目を優先する。

- バグ・リグレッション
- scope 外変更
- テスト欠落（diff から判断できる範囲）
- 可読性・保守性（客観的な問題）
- セキュリティ・性能の明らかな欠陥
- **設計の根本妥当性**（差分から判断できる範囲）
- **より単純な代替案**（差分から想起できる範囲）
- **不要な抽象化・複雑さ・間接化**
- **保守性・安全性・性能への実質影響**

上記品質観点は plan 未読でも **plan-independent** として指摘する。plan を読まないと確定できない疑い（要件意図・acceptance 充足）は **plan-dependent** として記録し、第2段階で disposition を付ける。

### plan-dependent の記録例

- 「acceptance 未確認のため、要件充足は判定保留」
- 「plan で指定された API 形状か不明。意図一致は第2段階で判定」

### plan-independent の品質指摘例

- 「3層抽象で1関数呼び出し。差分単独で保守コスト過大」
- 「同等処理を既存 util で置換可能。新規抽象化の根拠が diff に見えない」
- 「同期 I/O が hot path に入り、性能リスクが diff から読み取れる」

### 出力

- 指摘一覧（plan-independent / plan-dependent タグ付き）
- 停止理由（完了 / blocked）

出力形式: [review-output-format.md](review-output-format.md) の第1段階節。

### 停止条件

| 条件 | status | 第2段階 |
| --- | --- | --- |
| diff 全 scope をレビュー完了 | `completed` | 進む |
| 予算到達・進捗なし | `needs-escalation` | 停止。stage1 再起動 |
| diff 取得不能・scope 不明 | `blocked` | 停止 |

### 完了判定

- scope 内 diff をすべてレビューした
- 指摘に ID を付与した（`S1-001` 形式推奨）
- 各指摘に `plan-independent` または `plan-dependent` タグを付けた

### needs-escalation 時（予算到達・進捗なし）

1. レビュー済み scope と findings を artifact として報告に残す
1. 未レビュー scope を `unreviewed scope` として列挙する
1. stop reason に停止理由を書く
1. orchestrator へ報告し、stage1 再起動で全 scope レビュー完了を要求する

第2段階 plan 照合入力へ findings を昇格させない。stage1 が `completed` になった後にのみ stage2 を開始する。

出力形式: [review-output-format.md](review-output-format.md) の第1段階未完了報告節。

## 第2段階: plan 照合レビュー

### 入力

- 第1段階の出力（全文）
- plan 文書
- 同一 diff（必要なら再取得）

### 着手前

1. 第1段階と同一 subagent を `resume` で起動する
1. 第1段階出力全文を入力として渡す
1. plan 文書を初めて reviewer に共有する

### 照合手順

1. 第1段階指摘を ID 順に処理する
1. 各指摘で **plan 整合** と **品質・保守性・安全性・性能上の妥当性** を別々に判定する
1. 判定結果に応じて disposition を付ける
1. plan と diff を照合し、第1段階で見逃した指摘を追加する
1. plan 自体が過剰・複雑・不適切と判定される場合、`plan-mismatch-escalated` とは別に品質指摘（`S2-xxx` または `plan-aligned-quality-issue`）を残す
1. 統合レビューを出力する

### 二軸判定

各 stage1 指摘について、stage1 タグ（plan-independent / plan-dependent）に依存せず、次の2軸を独立記録する。

| 軸 | 判定内容 |
| --- | --- |
| plan 整合 | plan・acceptance・設計意図との一致 |
| 品質妥当性 | 保守性・安全性・性能・複雑さ・代替案の観点での妥当性 |

**品質軸の再判定（必須）**

1. 各指摘の指摘本文から品質次元（設計妥当性・代替案・不要複雑さ・実質影響）を読み取る
1. plan 整合判定とは独立に品質妥当性を再判定する
1. plan 整合かつ品質問題あり → `plan-aligned-quality-issue`。stage1 severity と指摘本文を維持する
1. plan-dependent タグの指摘でも品質次元を含む場合、上記手順を適用する

plan 整合と品質妥当性は独立判定とする。品質問題は専用 disposition で severity を維持する。

### disposition 一覧

| disposition | 意味 |
| --- | --- |
| `confirmed` | 第1段階指摘を plan 照合後も維持 |
| `context-added` | 指摘は維持。plan 文脈を追記（severity は維持） |
| `plan-mismatch-escalated` | plan 不整合を新たに確認。重大度維持または昇格 |
| `plan-aligned-quality-issue` | plan 整合かつ品質問題あり。stage1 severity を final severity として維持。維持根拠は品質・保守性・安全性・性能の観点とする |
| `plan-dependent-resolved` | plan-dependent 指摘について要件充足・意図一致を確認。品質妥当性が `n/a` または `resolved` の場合に付与。final severity は `n/a` または `resolved`（merge blocker カウント対象外）。指摘行は残し、判定理由を追記 |
| `factually-incorrect` | stage2 で検証可能な事実誤り（location・挙動・影響の誤認）を根拠付きで確認。指摘無効。final severity は `n/a`（merge blocker カウント対象外） |

### disposition 付与条件

**`plan-aligned-quality-issue`**

- plan 整合（plan・acceptance との一致）を確認した
- 品質・保守性・安全性・性能上の問題が残る
- stage1 severity と指摘本文を維持する
- notes に plan 引用と品質根拠の両方を記載する

**`plan-dependent-resolved`**

- plan-dependent 指摘に限定する
- plan 整合（要件充足・設計意図一致）を確認した
- 品質妥当性が `n/a` または `resolved`（品質問題なし）である
- 上記を満たす場合のみ、要件充足・意図一致の確認結果を disposition 根拠とする
- final severity は `n/a` または `resolved` とする（merge blocker カウント対象外）
- 品質問題が残る場合は `plan-aligned-quality-issue` とし、stage1 severity を final severity として維持する
- 判定理由（plan 引用）を指摘行に残す

**`factually-incorrect`**

- plan-independent 指摘に限定する
- stage2 で diff・plan 照合により、location・挙動・影響の誤認を根拠付きで確認した場合に付与する
- notes に誤認内容と確認根拠（diff 引用・plan 引用・実行結果等）を記載する
- final severity は `n/a`（指摘無効）。merge blocker カウント対象外とする
- disposition 変更先は `factually-incorrect` のみ。final severity を `n/a` とするのも本 disposition のみ

**`plan-independent` 指摘の disposition 変更**

- disposition 変更は `factually-incorrect` に限定する（上記条件を満たす場合）
- 品質根拠は指摘維持（`confirmed` / `context-added` / `plan-aligned-quality-issue`）の確認に用いる
- 事実誤り根拠が確認できる場合は `factually-incorrect` とし、final severity を `n/a` とする
- 品質根拠が確認できる場合は `confirmed` または `context-added` とし、stage1 severity を final severity として維持する

**plan 自体の品質問題**

- plan が過剰・複雑・不適切と判定される場合、`plan-mismatch-escalated`（plan 不整合）とは別行で品質指摘を残す
- 実装が plan 通りでも、過剰設計・不要複雑さは `plan-aligned-quality-issue` として severity を維持する

### 出力

- 第1段階指摘の継承表（維持 / 文脈追加 / plan 不整合で昇格）
- plan 照合で新規発見した指摘
- 総合判定（merge 可否、blocker の有無）

出力形式: [review-output-format.md](review-output-format.md) の第2段階節。

### 停止条件

| 条件 | status | 動作 |
| --- | --- | --- |
| 第1段階指摘すべてに disposition 付与 | `completed` | 統合レビュー出力 |
| plan 不在・第1段階出力欠落 | `blocked` | 第2段階を中断して報告 |
| 予算到達・進捗なし | `needs-escalation` | 中断報告。同一 reviewer を resume で stage2 再起動、または disposition 完了まで待つ |
| `resume` 不成立 | `blocked` | [resume 不成立時](#resume-不成立時) に従う |

### 第1段階指摘の扱い

- **必須**: 第1段階の指摘行を第2段階出力にすべて残す
- **必須**: `confirmed` / `context-added` / `plan-mismatch-escalated` / `plan-aligned-quality-issue` は stage1 severity を final severity として維持し、plan 引用と disposition で根拠を追記する
- **必須**: `plan-dependent-resolved` は final severity を `n/a` または `resolved` とし、plan 引用と disposition で根拠を追記する
- **必須**: `factually-incorrect` は final severity を `n/a` とし、notes に事実誤り根拠を記載する
- **必須**: disposition（`confirmed` / `context-added` / `plan-mismatch-escalated` / `plan-aligned-quality-issue` / `plan-dependent-resolved` / `factually-incorrect`）と根拠を付ける
- **必須**: 各指摘に plan 整合判定と品質妥当性判定を記録する

### 同一 reviewer 継続

- Task ツール: 第1段階 subagent の `agent_id` を `resume` に指定
- 第1段階完了後に同一 subagent を `resume` で第2段階へ起動する
- `resume` 成立を第2段階開始条件とする

### resume 不成立時

第2段階は同一 subagent の `resume` 必須。`resume` 不成立時は `blocked` として報告し、同一 reviewer 再起動を要求する。

**必須手順**:

- 同一 reviewer を `resume` で継続し、resume 成立を第2段階開始条件とする
- 第1段階出力全文を stage1 artifact として保持する
- `blocked` として報告し、同一 reviewer 再起動を要求する

**報告**: [review-output-format.md](review-output-format.md) の resume 不成立節に従う。

orchestrator は報告を受け取り、ユーザー判断または予算再割当後に第1段階から再起動する。

### 完了判定

- 第1段階の全指摘 ID に disposition がある
- 新規指摘（`S2-xxx`）があれば severity 付きで列挙
- blocker の有無と merge 可否を明示

### blocker 集計

stage2 最終 disposition と final severity 列に基づいて算出する。stage1 severity 列は集計に使わない。

| 区分 | disposition / 条件 |
| --- | --- |
| 集計対象 disposition | `confirmed`、`context-added`、`plan-mismatch-escalated`、`plan-aligned-quality-issue` |
| 除外 disposition | `factually-incorrect`、`plan-dependent-resolved` |
| 集計条件 | 集計対象 disposition かつ final severity 列が `blocker` の行（stage1 inheritance 表）。new findings は severity 列が `blocker` の行 |

出力形式の詳細: [review-output-format.md](review-output-format.md) の blocker count 集計節。
