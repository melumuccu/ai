---
name: kf-g-project-bootstrap-new-project-rules
description: Use this skill when starting a new project and defining baseline repository rules, especially for optional devcontainer setup, mise-first tooling, pnpm security settings, Vite+ workflows, kiso.css adoption, pre-push test gates, and project-local post-edit lint/format hooks that run after AI agent file edits.
---

# 新規プロジェクト立ち上げルール

この SKILL.md は**入口**。詳細は `references` 配下の該当ファイルを読む。

**重要**: 新規 PJ の **scaffold と設定ファイル作成**は、本 skill の [入口フロー](#入口フロー) を完了し、ユーザがルール適用を承認するまで開始しない。入口フロー中は、`kf-g-html-document-universal-single-file` による `artifacts/` への**プランニング HTML** 作成と **R2 公開**を行う（これらは scaffold 禁止の例外）。

## この skill を使う場面

- 新しい PJ を作る
- 新規リポジトリの初期構成を決める
- devcontainer や mise を含む開発基盤を最初から整える
- frontend の標準 toolchain を決める
- pnpm の supply chain 対策を初期設定へ組み込みたい
- secret scan を初期設定へ組み込みたい
- AI エージェント編集後の lint/fmt 自動実行を初期設定へ組み込みたい
- push 前に全テスト実行で品質ゲートを掛けたい

## 入口フロー

新規 PJ 立ち上げは、次の手順を順に進める。フェーズ 4（scaffold）の承認前に devcontainer 作成・scaffold・設定ファイル追加などの実作業を始めない。

1. **issue を作成する**（まだ無ければ）。description には issue の最小サマリのみ載せる
1. **PJ 概要を仮置きする**。プロンプトと [合理デフォルト](#合理デフォルト) を起点に不足分を埋め、不明点は「要確認」とする。**確認済み HTML URL を提示する前に AskQuestion しない**
1. **`kf-g-html-document-universal-single-file` でプランニング HTML を生成する**（パターン C）。ルール適用表・要確認・推奨理由を HTML 本文に載せる（[planning-html-delivery.md](references/planning-html-delivery.md)）
1. **R2 公開し、確認済み URL を issue の `## プランニング用資料` に載せる**
1. **ユーザへ確認済み URL を先に提示する**。チャットは短いポインタと URL に留め、表全文を貼って質問攻めしない
1. **ユーザが資料を見て判断・返信するまで待つ**
1. **全ルールの適用 / 不適用が確定したら**フェーズ 4（scaffold）に進む

### フェーズ 1: PJ 概要の仮置き

プロンプトに含まれる情報を起点に PJ 概要を仮置きする。未記載項目は質問せず、[合理デフォルト](#合理デフォルト) を適用するか「要確認」とする。

**確認済み HTML URL を提示する前に AskQuestion しない。**

把握対象（仮置き用）:

| 項目            | 例                                                        |
| --------------- | --------------------------------------------------------- |
| PJ 名 / 目的    | 社内ダッシュボード、CLI ツール、API サーバ                |
| リポジトリ種別  | 新規 / 既存空リポジトリ / monorepo 追加                   |
| 提供形態        | Web UI / API のみ / CLI / ライブラリ / 複合               |
| 主要言語・FW    | TypeScript, Go, Python など                               |
| frontend の有無 | ブラウザ向け UI を提供するか                                |
| frontend FW     | SvelteKit / React / なし など                               |
| devcontainer    | 利用するか（**デフォルト: なし**）                          |
| 開発環境        | CI 先（GitHub Actions 等）、ローカル runtime 管理方針     |
| CI runner       | `ubuntu-latest` / Mac Studio self-hosted / 混在             |
| 特記事項        | monorepo 構成、既存 toolchain 継続、Vite+ 非採用理由 など |

### 合理デフォルト

プロンプトに未記載の項目は、次を起点に仮置きする。判断不能なものは「要確認」とする。

- **devcontainer**: デフォルトは**不適用**（利用する明示が無ければ導入しない）
- **frontend の有無**: 未記載なら**要確認**
- **frontend FW**: frontend ありと仮定できる場合のみ推定。それ以外は**要確認**
- **CI**: 未記載なら **GitHub Actions** を想定
- **CI runner**: 未記載なら **`ubuntu-latest`** を想定
- **mise 中心運用・gitleaks・pre-commit / pre-push**: 原則**適用**推奨（frontend なし PJ でも backend 向けに調整）
- **pnpm / Vite+ / kiso.css 等 frontend 向けルール**: frontend ありと確定するまで**要確認**または不適用

### フェーズ 2: ルール適用表の作成

[ルール一覧](#ルール一覧) を全件走査し、PJ 概要に基づいて各ルールの**推奨**（適用 / 不適用 / 要確認）を決める。

- **適用**: 条件を満たし、標準方針どおり導入する
- **不適用**: 条件を満たさない、または PJ 方針上不要
- **要確認**: 条件付きルールで、ユーザ判断が必要

**正本はプランニング HTML**（[planning-html-delivery.md](references/planning-html-delivery.md)）。ルール適用表・要確認・推奨理由を HTML 本文に載せる。チャットは短いポインタと確認済み URL のみ提示してよい。

### フェーズ 3: ユーザ確認・調整

主手段はプランニング HTML と issue への返信とする。

1. 確認済み HTML URL をユーザへ先に提示する
1. ユーザが HTML を読み、推奨の承認・変更・追加要件を返信するまで待つ
1. 返信を反映して HTML を改訂する場合は、新規 `v{N}` で R2 再公開し、issue の `## プランニング用資料` を更新する
1. **全ルールについて適用 / 不適用が確定するまで**フェーズ 3 を繰り返す

AskQuestion は、**確認済み HTML URL を提示したあと**かつ **HTML 本文の要確認では解消できないブロッカーのみ**に限る。**URL 提示前・提示と同ターンの AskQuestion は禁止**。

### フェーズ 4: 承認後に作成開始

ユーザがルール適用を承認したら、初めて scaffold と設定ファイル作成に入る。

1. 承認済み表の **適用** 行に対応する参照ファイルを読み、実装する（[読み進め方](#読み進め方)）
1. **不適用** とされたルールに該当するファイル・設定は作らない
1. 完了前に [checklist.md](references/checklist.md) を、承認済みルールに合わせて確認する

承認済み表は作業ログとして短く残す（どのルールを適用 / 不適用にしたか）。

---

## ルール一覧

全ルールを列挙する。フェーズ 2 ではこの表をベースに、PJ ごとの適用 / 不適用を決める。

| ルール                 | 条件                        | 参照                                                        | 概要                                                                 |
| ---------------------- | --------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| devcontainer           | オプション（デフォルト: 不適用） | [devcontainer-mise.md](references/devcontainer-mise.md)     | 利用時のみ `.devcontainer/devcontainer.json` を作成。実行場所を統一  |
| mise 中心運用          | 汎用                        | [devcontainer-mise.md](references/devcontainer-mise.md)     | `mise.toml` に tools / env / tasks を集約                            |
| user settings 確認     | devcontainer 適用時         | [devcontainer-mise.md](references/devcontainer-mise.md)     | `dev.containers.*`, `dotfiles.*` を確認し重複設定を避ける            |
| サンプルファイル起点   | 汎用                        | [devcontainer-mise.md](references/devcontainer-mise.md)     | `references/sample-files/` を初期ファイルの起点にする                |
| gitleaks               | 汎用                        | [gitleaks-pre-commit.md](references/gitleaks-pre-commit.md) | secret scan を GitHub Action と pre-commit の両方で導入              |
| self-hosted runner CI  | CI = Mac Studio self-hosted を **適用** | [kf-g-github-actions-self-hosted-runner-label](../kf-g-github-actions-self-hosted-runner-label/SKILL.md) | workflow の `runs-on` を `[self-hosted, <repo-slug>]` に固定。host runner 未登録時は merge 不可 |
| pre-commit / pre-push  | 汎用                        | [gitleaks-pre-commit.md](references/gitleaks-pre-commit.md) | `pre-commit`, `gitleaks` を mise 管理。local hook を有効化           |
| pre-push 全テスト       | コード編集あり              | [pre-push-test.md](references/pre-push-test.md)             | push 前に `mise run test` で全テスト実行。1 件でも失敗したら push 拒否 |
| pnpm 固定              | frontend あり               | [frontend-pnpm.md](references/frontend-pnpm.md)             | package manager を pnpm に固定                                       |
| pnpm supply chain      | frontend あり               | [frontend-pnpm.md](references/frontend-pnpm.md)             | `pnpm-workspace.yaml` にセキュリティ設定                             |
| Vite+                  | frontend あり               | [frontend-vite-plus.md](references/frontend-vite-plus.md)   | build / dev / check / test を Vite+ 流儀に寄せる                     |
| Svelte / SvelteKit     | frontend + Svelte 採用      | [frontend-vite-plus.md](references/frontend-vite-plus.md)   | 最新安定版を使用                                                     |
| kiso.css               | frontend UI あり            | [frontend-vite-plus.md](references/frontend-vite-plus.md)   | reset CSS を pnpm で導入し entry で最初に読み込む                    |
| Oxlint / Oxfmt         | frontend あり               | [lint-fmt-hooks.md](references/lint-fmt-hooks.md)           | frontend の linter / formatter。未対応時は代替を調査                 |
| lint / format コマンド | コード編集あり              | [lint-fmt-hooks.md](references/lint-fmt-hooks.md)           | `package.json` scripts と `mise run` task に載せる                   |
| 編集後 lint/fmt hooks  | コード編集あり              | [lint-fmt-hooks.md](references/lint-fmt-hooks.md)           | AI エージェント編集後に project hooks で lint/fmt 実行               |
| Tab 補完後 hook        | コード編集あり + ツール対応 | [lint-fmt-hooks.md](references/lint-fmt-hooks.md)           | 利用ツールが対応していれば設定（任意）                               |
| mise 日常 task 一式    | 汎用                        | [devcontainer-mise.md](references/devcontainer-mise.md)     | install / dev / check / test / build / lint / format / hooks-install |

### 条件の読み方

| 条件                        | 適用判定                                                                |
| --------------------------- | ----------------------------------------------------------------------- |
| 汎用                        | 原則すべての新規 PJ で適用推奨                                          |
| オプション（デフォルト: 不適用） | 標準では不適用。ユーザが明示的に利用を選んだ場合のみ適用           |
| devcontainer 適用時         | devcontainer ルールが **適用** と確定している場合のみ適用               |
| frontend あり               | ブラウザ向け UI または frontend パッケージを含む                        |
| frontend UI あり            | ユーザー向け画面・スタイルを提供する frontend                           |
| frontend + Svelte 採用      | frontend があり、Svelte / SvelteKit を採用する                          |
| コード編集あり              | ソースコードをリポジトリで管理・編集する                                |
| コード編集あり + ツール対応 | 編集後 lint/fmt hooks を適用し、かつ Cursor 等が Tab 補完後 hook を提供 |
| CI = Mac Studio self-hosted 適用時 | フェーズ 1 で CI runner = Mac Studio self-hosted を選んだ場合のみ **self-hosted runner CI** ルールを適用 |

frontend なし PJ では pnpm / Vite+ / kiso.css / Oxlint・Oxfmt 等 frontend 向けルールは**不適用**。lint / format コマンド・編集後 hooks は backend 言語に合わせて選定して適用する。

## 読み進め方

承認後の実装手順は `references` 側が正本。SKILL.md は入口とルール選定のみ担う。

1. [入口フロー](#入口フロー) を完了する。
1. [ルール一覧](#ルール一覧) で **適用** となった各行の「参照」列のファイルを読み、実装する。
1. 完了前に [checklist.md](references/checklist.md) を、承認済みルールに合わせて確認する。

## 出力方針

- 入口フロー完了前は、**scaffold と設定ファイルの作成**を始めない。プランニング HTML の生成と R2 公開は入口フロー中に**必須**とする。
- 入口フロー中は、方針説明と確認済み HTML URL の提示に留める。ルール適用表の正本はプランニング HTML とする。
- 承認後は方針説明だけで止めず、承認済みルールに対応するファイルを作る。
- 承認済みルール適用表を短く残す。

## 参照ファイル

| ファイル | 読むタイミング |
| --- | --- |
| [planning-html-delivery.md](references/planning-html-delivery.md) | プランニング HTML 生成・R2 配布・AskQuestion 制限を確認するとき |
| [checklist.md](references/checklist.md) | フェーズ 4 完了前の最終確認 |
| ルール一覧の各参照 | フェーズ 4 で **適用** 行の実装 |
