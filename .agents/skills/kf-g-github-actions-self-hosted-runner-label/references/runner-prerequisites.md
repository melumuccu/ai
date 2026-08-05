# merge 前の前提条件と troubleshooting

## 順序（必須）

1. host 側で runner を登録し、label を設定する
2. Settings → Actions → Runners で `<runner-name>` が Online であることを確認する
3. その後に workflow を merge する

**runner 側 label 未設定のまま workflow だけ merge すると、job がずっと queue 待ちになる。**

## host 運用手順

runner バイナリ取得、GitHub 登録、`.env` cache 分離、launchd 常駐、remove token 取得は host README が正本。

- パス: `~/projects/_github-selfhosted-actions-runner/README.md`
- 新 repo 追加手順: README「self-host runner 追加手順 (新 repo)」
- workflow 更新: README「5. リポジトリ workflow を更新」
- workflow 詳細規約: [`kf-g-github-actions-self-hosted-runner-label`](https://github.com/melumuccu/ai/tree/main/.agents/skills/kf-g-github-actions-self-hosted-runner-label)（`melumuccu/ai` リポジトリ）

## label 一致の確認

| 確認箇所 | 期待値 |
|----------|--------|
| `config.sh --labels` | `self-hosted,macOS,ARM64,<repo-slug>` |
| workflow `runs-on` | `[self-hosted, <repo-slug>]` |
| GitHub Settings → Runners | runner 名 `macstudio-<repo-slug>`、label `<repo-slug>` 表示 |

## troubleshooting: queue 待ち

**症状**: job が `Queued` のまま進まない。runner ログに job が来ない。

**原因候補**:

1. workflow の `<repo-slug>` label が runner の `--labels` と不一致
2. runner プロセスが停止（`launchctl list | grep actions.runner`）
3. 別 repo の runner に job が流れる設定になっていない（label なし `runs-on: self-hosted` は避ける）

**対処**:

1. Settings → Actions → Runners で label 一覧を確認
2. 不一致なら host README「再設定・削除するとき」に従い `./config.sh remove` → 再登録
3. workflow の `runs-on` を `[self-hosted, <repo-slug>]` に修正

## 動作確認

```bash
gh workflow run <workflow-name> --repo <owner>/<repo> --ref main
gh run list --repo <owner>/<repo> --workflow <workflow-name> --limit 1
```

GitHub Actions 画面で runner 名が `macstudio-<repo-slug>` になっていることを確認する。
