# 非推奨パターン

## runs-on: self-hosted のみ

```yaml
runs-on: self-hosted
```

**問題**: Mac Studio 上に複数 repo の runner が共存すると、どの runner に流す意図か workflow から読み取れない。label 不一致時の queue 待ちも切り分けにくい。

**正**: `runs-on: [self-hosted, <repo-slug>]`

## label 不一致

| workflow | runner `--labels` | 結果 |
|----------|-------------------|------|
| `[self-hosted, gitdoc-v2]` | `self-hosted,macOS,ARM64,hacksaw-shop` | queue 待ち（永続） |
| `[self-hosted, gitdoc-v2]` | label なし `self-hosted` のみ | 意図しない runner に奪われる可能性 |

**正**: `<repo-slug>` を workflow と `config.sh --labels` の両方で一致させる。

## 共有 cache パス

repo ごとに runner プロセス・ディレクトリ・cache を分離する。`.env` の `MISE_DATA_DIR` / `PNPM_CONFIG_STORE_DIR` を repo 間で共有しない。

詳細: host README「3. cache 用 `.env` を用意」

## workflow merge が runner 登録より先

workflow だけ merge して runner 未登録 → 全 self-hosted job が queue 待ち。

**正**: host README のチェックリスト完了 → workflow merge。

## macOS label の単独使用

```yaml
runs-on: macOS
```

GitHub hosted runner と混同しやすい。self-hosted では `[self-hosted, <repo-slug>]` を使う。
