---
name: kf-g-skill-naming-creation-organization-rules
description: Use this skill when creating, naming, renaming, or organizing skills in this repository. Always use it when you need to decide rules for skill directory names, propose names that follow the existing convention, organize skills so related entries stay close together, or distinguish local skills from external ones.
---

# skills の作成整理規約

このスキルは、このリポジトリで skills を追加、改名、整理するときに、命名規約と配置方針を一貫して適用するためのものです。

## このスキルを使う場面

次のような依頼ではこのスキルを使ってください。

- 新しい skill を作りたい
- skill のディレクトリ名を決めたい
- 既存 skill の名前が規約に合っているか見直したい
- skills をカテゴリ順に並びやすく整理したい
- 外部 skill と自作 skill を区別したい
- 英語 frontmatter の付け方を決めたい

## このリポジトリでの前提

### 外部 skill と自作 skill を区別する

- `skills-lock.json` に含まれる skill は外部リポジトリ由来として扱う
- 外部 skill は今後の更新取り込みを前提にしているため、原則としてディレクトリ名や中身を直接変更しない
- 自作 skill は `.agents/skills/` 配下へ追加する

### 一覧で近い skill が並ぶことを重視する

- `.agents/skills/` がアルファベット順で表示されたとき、同じ主題領域の skill が近くに並ぶように命名する
- 名前の先頭付近に大カテゴリを置き、一覧上で主題領域が揃うようにする

## 命名規約

### 基本形

ディレクトリ名は、主題領域を表す大カテゴリから始め、必要に応じて下位カテゴリと短い英語概要を続ける。

- 例: `large-category-subcategory-subsubcategory-short-summary`
- frontmatter の英語ルールは、後述の「frontmatter は英語で統一する」セクションに従う。

### 大カテゴリは必須

- 大カテゴリは拡張子ではなく、skill の主題領域を表す名詞にする
- 例: `markdown`, `skill`, `git`, `python`, `shell`, `research`

### 下位カテゴリは任意

- 大カテゴリの後ろには、必要な場合のみ下位カテゴリを追加してよい
- 大中小の3階層固定にはしない
- まずは大カテゴリ + 1個程度の下位カテゴリで足りるかを優先して考える
- 分類のためだけに不要なカテゴリを増やさない

### 英語概要は末尾に置く

- 末尾には skill の内容がひと目で分かる短い英語概要を置く
- できるだけ名詞句または短い機能名で止める
- 長文化しすぎない

良い例:

- `change-review-checkpoints`
- `paper-summary`
- `log-analysis`
- `comparison-table-formatting`

避ける例:

- `review-changes-clearly-for-humans`
- `read-papers-and-organize-key-points`
- `investigate-logs-and-list-possible-causes`

### frontmatter は英語で統一する

- `description` は skill の用途とトリガー条件を説明する 1 文から 2 文程度の英語文にする
- 本文や通常出力を日本語にしてもよいが、frontmatter に日本語は使わない

## 大カテゴリの決め方

### 既存の大カテゴリをなるべく再利用する

新しい skill を作るときは、まず既存の skill 名を見て、大カテゴリとして自然に使える語がないか確認してください。

現時点で再利用しやすい例:

- `markdown`
- `skill`

### 既存に無ければ新規追加してよい

作成する skill に合う大カテゴリが既存に存在しない場合は、新しい大カテゴリを作ってよいです。

追加候補の例:

- `git`
- `python`
- `shell`
- `research`
- `docs`
- `agent`
- `prompt`

### 主題領域として不自然な語は大カテゴリにしない

- 動詞や一時的な用途名を大カテゴリにしない
- 大カテゴリは、似た skill をまとめて並べるための軸として機能する名詞にする

## 命名手順

skill 名を決めるときは、次の順で考えてください。

1. その skill が主に扱う主題領域を決める。
1. 既存 skill に使える大カテゴリがあるか確認し、あれば再利用する。
1. 足りなければ、新しい大カテゴリを短い英語名詞で追加する。
1. 必要な場合のみ下位カテゴリを1つから2つ追加する。
1. 末尾に、短い英語概要を置く。
1. frontmatter の `description` を英語で書く。
1. 長すぎないか、一覧で見て意味が分かるか確認する。

## 命名例

次のような名前を基準にしてください。

`melumuccu/ai` での例:

- `kf-g-markdown-table-comparison-table-formatting`
- `kf-g-markdown-link-internal-link-organization`
- `kf-g-skill-review-skill-description-review`
- `kf-g-skill-tuning-description-optimization`
- `kf-g-git-commit-japanese-commit-message`
- `kf-g-git-review-change-review-checkpoints`
- `kf-g-python-test-pytest-test-addition`
- `kf-g-shell-log-log-analysis`
- `kf-g-research-paper-paper-summary`

それ以外のリポジトリでの例:

- `kf-pj-markdown-list-ordered-list-cross-reference`
- `kf-pj-skill-review-skill-description-review`
- `kf-pj-git-commit-japanese-commit-message`
- `kf-pj-shell-log-log-analysis`

## 整理と改名の方針

### 外部 skill は整理対象から外す

- `skills-lock.json` にある外部 skill は、命名規約の適用対象にしない
- 外部 skill の変更が必要な場合は、自作 skill で補完することを優先する

### 自作 skill のみ規約に合わせて整理する

- 自作 skill の追加、改名、再配置を行うときは、この規約に従う
- 同系統の skill が並ぶことを優先して、大カテゴリの粒度を揃える

### 変更後は一覧情報も更新する

- `.claude-plugin/marketplace.json` を使っている場合は、skill の追加・名前変更・削除を反映して plugin の分類も更新する


## 出力時の方針

- ユーザーが名前案だけを求めている場合は、候補名を複数提示する
- ユーザーが作成まで求めている場合は、規約に沿ったディレクトリ名と `SKILL.md` を用意する
- `SKILL.md` を作るときは、frontmatter の `description` を英語で書く
- 必要であれば、なぜその大カテゴリを選んだかを短く説明する
- 過剰に細かいカテゴリ分けは避ける

## 最終チェック

返す前に次を確認してください。

- 大カテゴリが主題領域として自然な名詞になっている
- 下位カテゴリが不要に増えすぎていない
- 末尾の英語概要が短く分かりやすい
- frontmatter の `description` が英語になっている
- 外部 skill と自作 skill を混同していない
- skill の追加や改名後に一覧更新が必要か確認している
