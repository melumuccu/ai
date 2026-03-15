## 1. skills の参照

最初に、https://github.com/melumuccu/skills リポジトリ内の `.agents/skills/prompt-for-agent.md` の内容を参照し、その指示を現在の作業方針として採用してください。

そのうえで、このリポジトリの `.agents/skills/skills.json` を、利用可能な skills の一覧として認識してください。

## 2. skills の使用ルール

- `.agents/skills/skills.json` に含まれる `name` と `description` をもとに、 {ユーザーからの作業指示} に対して使うべき skill を判断してください。
- 必要な skill があると判断した場合は、必ず `.agents/skills` 配下の skill を使用してください。
- 使用する skill が決まったら、`path` をもとに対応する `SKILL.md` を参照してください。
- `SKILL.md` だけで不十分な場合は、同じディレクトリ配下の補足ファイルも参照してください。

## 3. 作業の進め方

1. `.agents/skills/prompt-for-agent.md` の指示を理解する
2. `.agents/skills/skills.json` を読み、候補となる skill を把握する
3. {ユーザーからの作業指示} に対して必要な skill を判断する
4. 必要なら対象の `SKILL.md` と補足ファイルを読む
5. skill の指示に従って {ユーザーからの作業指示} を処理する

## 4. {ユーザーからの作業指示} の遂行

以下に続くユーザー指示を処理してください。

---

# ユーザーからの作業指示

ここにユーザーの依頼を続けて入力する
