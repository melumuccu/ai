---
name: kf-g-html-document-universal-single-file
description: ユーザとのコミュニケーション用HTMLドキュメントを作成または改訂する際に使用。例えばPRや課題レビューHTML、注釈付きガイドなど。artifact (成果物) の一つとして扱われる。
disable-model-invocation: true
---

# 単一 HTML インタラクティブドキュメント

ビルド不要の 1 ファイル HTML で、テキスト選択コメント付きの説明ページを生成する。

## 実行手順

1. [delivery-policy.md](references/delivery-policy.md) を読み、配布モードを確定する
1. 明示呼出し時は、local-only 指定がなければ R2 配布を選択する
1. R2 配布時は [r2-static-delivery.md](references/r2-static-delivery.md) を読み、新規 `v{N}` を決定する
1. [generation-workflow.md](references/generation-workflow.md) に従い HTML を生成し `artifacts/` に保存する
1. [checklist.md](references/checklist.md) の常時必須を満たし、ローカル検証する
1. R2 配布時は `--remote` でアップロードし、公開 URL・Content-Type・表示・コメント機能を確認する
1. 完了報告で版番号付き確認済み URL（R2 時）またはローカルパスと未配布理由（ローカル時）を返す

## 参照ファイル

| ファイル | 読むタイミング |
| --- | --- |
| [delivery-policy.md](references/delivery-policy.md) | 着手時（配布モード確定） |
| [generation-workflow.md](references/generation-workflow.md) | HTML 生成 |
| [checklist.md](references/checklist.md) | 検証・完了判定 |
| [r2-static-delivery.md](references/r2-static-delivery.md) | R2 配布時 |
| [content-patterns.md](references/content-patterns.md) | 構成・CDN・視覚構造 |
| [core-contract.md](references/core-contract.md) | コメントコア・左注釈 |
| [source-citations.md](references/source-citations.md) | 出典リンク |
| [pr-review-delivery.md](references/pr-review-delivery.md) | issue / PR 向け配布 |
| [issue-description.md](references/issue-description.md) | issue description |
| [pr-description.md](references/pr-description.md) | PR description |
| [frontend-screenshot-comparison.md](references/frontend-screenshot-comparison.md) | PR レビュー + FE 変更の before/after |
| [skill-revision-guidance.md](references/skill-revision-guidance.md) | skill 改修時 |
| [universal-single-file-template.html](assets/universal-single-file-template.html) | 実装起点 |

## チェックリスト

[checklist.md](references/checklist.md) を配布モードに応じて適用する。

| 区分 | 適用条件 |
| --- | --- |
| **常時必須** | 常に（HTML 生成・validator・コメント・出典） |
| **R2 配布時** | R2 配布モード（版番号・`--remote`・Content-Type・表示確認・URL 返却） |
| **issue / PR 時** | issue / PR 向け R2 配布（description 更新） |

## 最終確認

1. 選択したチェックリスト区分をすべて満たす
1. 依頼内容に合わせてデモ文言を置換済み
1. R2 配布時は validator 実行と公開 URL 確認を完了し、確認済み URL を返す
1. ローカル配布時は R2 未実施である理由を報告する
