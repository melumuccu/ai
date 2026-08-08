# 隔離と不変条件

**前提**: Worker A / B を起動する前に本ファイルを読み、委譲指示を組み立てる。

## 独立 subagent の要件

1. Worker A（before）と Worker B（after）は別 subagent として起動する
1. 同一ターンで並列起動し、互いの出力を参照させない
1. 各 worker は 1 skill 版のみを入力として受け取る
1. orchestrator が両 worker の固定プロンプト文面を同一に保つ

## 不変条件

| 条件 | 内容 |
| --- | --- |
| skill 隔離 | 修正前 skill と修正後 skill を同一 subagent に渡さない |
| 1 worker = 1 版 | 各 worker の `skills` 列挙は当該 skill 版 1 つのみ |
| プロンプト統一 | before / after で固定プロンプト・入力・成果物種別を同一にする |
| 差分の意味 | 目視差分は skill 改修由来のみとする |
| 承認前確定禁止 | ユーザ承認前に skill 改修を確定しない |

## 禁止事項

- 修正前 skill と修正後 skill を同一 subagent に渡す
- Worker A に修正後 skill を、Worker B にスナップショットを混在させる
- before / after でプロンプト、対象内容、成果物種別を揃えない
- 1 worker に複数 skill 版または比較指示（「before と after を両方見て」）を渡す
- Worker A の出力を Worker B の入力に使う（連鎖生成）
- ユーザ承認前に skill を commit / merge / marketplace 確定する

## 委譲時の skill 列挙ルール

### Worker A（before）

```text
skills:
  - <snapshot-skill-path>   # スナップショットのみ。修正後 skill を含めない
  - kf-g-agent-worker-common  # worker 種別に応じた共通 skill
```

1. スナップショットディレクトリへの `path` を指定する
1. 修正後 skill の `path` を列挙しない
1. 比較用に after skill を読む指示を prompt に含めない

### Worker B（after）

```text
skills:
  - <post-change-skill-path>   # 修正後 skill のみ。スナップショットを含めない
  - kf-g-agent-worker-common
```

1. 作業 tree 上の修正後 skill への `path` を指定する
1. スナップショットの `path` を列挙しない

### orchestrator prompt で渡すもの

- 固定プロンプト全文（両 worker 同一）
- 成果物保存先（`before/` または `after/`）
- 成果物種別とファイル名

### orchestrator prompt で渡さないもの

- もう一方 worker の skill 内容や出力
- before / after 比較の結論
- 改修意図の詳細（差分汚染を避けるため、レビュー観点の最小限のみ worker に渡す）

## 隔離破りの検出

次に該当したら手順を中断し、委譲指示を組み直す。

1. 同一 worker の `skills` に 2 版以上の skill が列挙されている
1. 固定プロンプトが worker 間で異なる
1. 成果物種別または入力データが worker 間で異なる
