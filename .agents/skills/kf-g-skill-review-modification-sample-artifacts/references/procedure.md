# 手順

**前提**: [SKILL.md](../SKILL.md) frontmatter `description` の適用条件を満たす場合のみ本手順を読む。

隔離ルール: [isolation-and-invariants.md](isolation-and-invariants.md)
成果物選定: [sample-artifact-selection.md](sample-artifact-selection.md)
固定プロンプト: [fixed-prompt-template.md](fixed-prompt-template.md)
レビュー依頼: [review-request.md](review-request.md)

## 着手条件

次をすべて満たしてから着手する。

1. 対象 skill（ディレクトリ名）が確定している
1. 改修意図（何を変え、何を維持するか）が 1 文以上で固定されている
1. ユーザが before/after サンプルで確認したい観点が列挙されている
1. 修正前 skill の内容をスナップショットできる状態である

## 改修意図を固定する

1. 対象 skill 名、改修理由、期待する出力変化をメモする
1. レビュー観点（例: 文体、構成、禁止事項の効き方）を列挙する
1. この内容を固定プロンプトとレビュー依頼に引き継ぐ

## 修正前 skill をスナップショットする

1. 着手時点の `SKILL.md` と `references/` を読み取り専用コピーとして保存する
1. 例: `cp -r .agents/skills/<target-skill> /tmp/skill-snapshot-<target-skill>-<timestamp>/`
1. Worker A（before）への唯一の skill 入力源とする
1. スナップショット取得後に本体 skill を改修してよい

## サンプル成果物種別と共通条件を固定する

1. [sample-artifact-selection.md](sample-artifact-selection.md) で成果物種別を 1 つ選ぶ
1. 対象内容（題材・入力データ・想定ユースケース）を 1 セット固定する
1. [fixed-prompt-template.md](fixed-prompt-template.md) で固定プロンプトを確定する
1. 固定プロンプトに、成果物種別・対象内容・入力をすべて含める

## 保存先を用意する

成果物の保存先:

```text
artifacts/skill-modification-review/<target-skill>/<timestamp>/{before,after}/
```

1. `<target-skill>` は対象 skill のディレクトリ名
1. `<timestamp>` は実行開始時刻（例: `2026-08-09T061300`）
1. `before/` と `after/` を事前に作成する
1. このディレクトリ配下は Git commit しない

## 同一ターンで 2 独立 worker を並列起動する

| worker | 入力 skill | 固定プロンプト | 出力先 |
| --- | --- | --- | --- |
| A（before） | スナップショット skill のみ | 同一 | `.../before/` |
| B（after） | 修正後 skill のみ | 同一 | `.../after/` |

1. orchestrator は同一ターンで Worker A と Worker B を並列起動する
1. 各 worker の委譲指示 `skills` には、当該 skill 版のみを列挙する
1. Worker A に修正後 skill を、Worker B にスナップショットを渡さない
1. 詳細は [isolation-and-invariants.md](isolation-and-invariants.md) を参照する

## 成果物を収集する

1. 両 worker の出力をそれぞれ `before/`、`after/` に保存する
1. ファイル名・拡張子・成果物種別が before / after で一致していることを確認する
1. 固定プロンプト文面と入力データを同ディレクトリの `prompt.txt`（または同等）に記録する

## ユーザへレビュー依頼する

1. [review-request.md](review-request.md) の形式で before / after を並置提示する
1. 改修意図とレビュー観点を添える
1. 承認・修正指示・却下のいずれかの返答を待つ

## 承認後に skill 修正を確定する

1. ユーザ承認後にのみ skill 改修を確定する（commit / PR / marketplace 更新など）
1. 修正指示があった場合は skill を直し、必要なら手順 2 以降を再実行する
1. 却下時は改修方針を見直し、スナップショットからやり直す
