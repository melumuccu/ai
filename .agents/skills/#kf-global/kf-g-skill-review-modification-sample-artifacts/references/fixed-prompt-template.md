# 固定プロンプトテンプレート

**前提**: [sample-artifact-selection.md](sample-artifact-selection.md) で成果物種別と同一対象内容を固定した後、本テンプレートを埋めて Worker A / B に同一文面を渡す。

## テンプレート

```markdown
## 生成依頼（before/after 比較用・固定）

あなたは implementation-worker です。列挙された skill のみを参照し、次の条件でサンプル成果物を 1 つ生成してください。

### 対象 skill

`<TARGET_SKILL_NAME>`

### 成果物種別

`<ARTIFACT_TYPE>`（例: 単一 HTML ファイル / Markdown ファイル / TypeScript コード断片）

### 題材

`<SUBJECT>`（例: issue #50 の PR description 草案）

### 入力データ

```
<INPUT_DATA>
```

### 制約（skill 改修以外は固定）

- 文字数・形式: `<CONSTRAINTS>`
- 禁止: 列挙 skill 以外を参照しない。比較用の before/after 情報を要求しない

### 出力

1. 上記条件に従い、成果物を 1 つ生成する
2. 指定パス `<OUTPUT_PATH>` に保存する
3. 使用した skill 名と成果物種別を報告に含める
```

## プレースホルダ

| プレースホルダ | 内容 |
| --- | --- |
| `<TARGET_SKILL_NAME>` | 対象 skill のディレクトリ名 |
| `<ARTIFACT_TYPE>` | 選定した成果物種別（拡張子含む） |
| `<SUBJECT>` | 固定した題材 |
| `<INPUT_DATA>` | 固定した入力データ全文 |
| `<CONSTRAINTS>` | 文字数、見出し構成など skill 改修外の制約 |
| `<OUTPUT_PATH>` | `artifacts/skill-modification-review/<target-skill>/<timestamp>/before/` または `.../after/` 配下のファイルパス |

## 運用ルール

1. Worker A と Worker B に同一文面（`<OUTPUT_PATH>` 以外）を渡す
1. `<OUTPUT_PATH>` のみ worker ごとに `before/` / `after/` で変える
1. 確定した固定プロンプトを `artifacts/.../prompt.txt` に保存する
1. プロンプトを worker 起動後に変更しない
