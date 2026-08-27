# gitleaks と pre-commit

## secret scan は gitleaks で標準化する

- `pre-commit` と `gitleaks` は brew ではなく `mise` で入れる。`mise install` を導入の基準にする。
- `GITLEAKS_LICENSE` は個人アカウント利用を前提に不要とし、既定では設定しない。Organization 向け要件が明確な場合だけ別途検討する。
- local の macOS でも `mise install` を前提にし、devcontainer 環境でも同じ `mise` の導線で入るように整える。

## GitHub Actions（self-hosted 適用時）

CI runner = Mac Studio self-hosted を **適用** とした場合、`.github/workflows/gitleaks.yml` 等の self-hosted job は `runs-on: [self-hosted, <repo-slug>]` に固定する。`<repo-slug>` は GitHub リポジトリ名と同一。

- 完全 workflow サンプルの正本: [`sample-files/.github/workflows/gitleaks.yml`](sample-files/.github/workflows/gitleaks.yml)
- `on:` の MUST（`pull_request` を置き、feature branch へのフィルタなし `push` は置かない）: [workflow-runs-on-label.md](../../kf-g-github-actions-self-hosted-runner-label/references/workflow-runs-on-label.md) の standalone gitleaks workflow の `on:` 節
- 規約詳細: [kf-g-github-actions-self-hosted-runner-label](../../kf-g-github-actions-self-hosted-runner-label/SKILL.md) の [workflow-runs-on-label.md](../../kf-g-github-actions-self-hosted-runner-label/references/workflow-runs-on-label.md)
- 参照実装: [gitdoc-v2 PR #64](https://github.com/melumuccu/gitdoc-v2/pull/64)
- host runner 未登録のまま workflow を merge しない（merge 前確認は上記 skill の [runner-prerequisites.md](../../kf-g-github-actions-self-hosted-runner-label/references/runner-prerequisites.md)）
- self-hosted + mise 環境では `mise run secrets:scan` で scan する

## local hook と Actions event の区別

local では commit 前と push 前の両方で gitleaks を走らせる。
GitHub Actions では event 二重（フィルタなし `push` と `pull_request`）を置かない。
この 2 つは別物であり、それぞれ独立に整理する。

## pre-commit framework の運用

- commit 前と push 前で hook の stage を分ける。
- `.pre-commit-config.yaml` では、gitleaks を `pre-commit` stage と `pre-push` stage の両方に置く。
- commit 前の gitleaks は `stages: [pre-commit]` の hook とする（`gitleaks git --pre-commit --staged`）。
- push 前の gitleaks は `stages: [pre-push]` の別 hook とする（`gitleaks git --redact --verbose`）。
- push 前の test 等は `stages: [pre-push]` の hook とする。
- 各 hook の `stages` を明示する。
- local hook の導入は、`pre-commit install` と `pre-commit install --hook-type pre-push` の両方を実行する。
- hook 導入手順は `mise run hooks-install` にまとめる。
- hook 設定の検証は `pre-commit validate-config` と `pre-commit run --hook-stage pre-push` で行う。
