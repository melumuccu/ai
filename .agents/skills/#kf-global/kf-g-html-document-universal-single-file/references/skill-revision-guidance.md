# skill 改修時の実装詳細集約方針

`kf-g-html-document-universal-single-file` を改修するとき、実装詳細をどこに置くかの指針。

## 正本の所在

- **実装例と説明の正本:** `assets/universal-single-file-template.html` 内のサンプル HTML
- **契約の短い記述:** `SKILL.md` と既存 reference（適用条件、正本への参照、禁止事項に限る）

## 方針 1: SKILL.md と reference への実装詳細の追加禁止

- `SKILL.md` や既存 reference に、CSS / JavaScript の長い説明を追加しない
- 実装に触れる記述は、「実装例と説明は template のサンプル HTML を正本とする」旨の短い契約に留める
- DOM 構造、データ属性、レイアウト挙動の詳細は reference に書かない

## 方針 2: 実装詳細は template サンプル HTML へ集約

次を `assets/universal-single-file-template.html` 内のサンプル HTML に集約する。

- HTML / CSS / JavaScript で表現できる典型実装
- DOM 構造とデータ属性の具体例
- 良い例・悪い例（コメントやセクション見出しで区別）
- 比較表、コメントコア、左注釈など、skill が扱う UI パターンごとの実装

## 方針 3: 検証手順も template 内の確認項目とする

- 実装の検証手順を `SKILL.md` や reference に詳細記載しない
- 確認項目・手順は template 内サンプル HTML のコメントまたは専用セクションに置く
- reference は「何を template で確認するか」を一文で指す程度に留める

## reference の役割（本ファイルを含む）

reference が担うのは次に限る。

- **正本の所在:** どのファイル・ブロックが実装の正本か
- **適用条件:** いつその reference を読むか
- **重複の禁止:** SKILL.md / reference / template のどこに何を書かないか

reference に実装コード、スタイル断片、手順の詳細列挙を置かない。

## 改修時チェックリスト

- [ ] 新規・変更した実装説明は template サンプル HTML にあるか
- [ ] `SKILL.md` / reference に CSS / JS の長文説明を追加していないか
- [ ] 検証手順の詳細を reference に書いていないか
- [ ] reference は正本・適用条件・重複禁止のいずれかに収まっているか
