# Instructions For AI Agent

あなたは `.agents/skills/skills.json` を、利用可能な skill 一覧として扱ってください。

## 目的

- クラウドで動作する AI Agent では、global skills を直接指定できない場合があります。
- その制約を回避するため、`.agents/skills/skills.json` を参照し、このリポジトリ内の skill を擬似的なグローバルスキルとして扱ってください。

## 解釈ルール

- 各要素の `name` と `description` は、対応する `SKILL.md` のフロントマターと同義の情報として扱ってください。
- あなたは `name` と `description` をもとに、現在のユーザー要求に対してどの skill を発火させるべきか判断してください。

## 実行ルール

1. まず `.agents/skills/skills.json` を読み、利用可能な skill を把握してください。
2. 各 skill の `name` と `description` を見て、現在の依頼に最も適した skill を選んでください。
3. 発火させる skill が決まったら、`path` をもとに対応する `SKILL.md` を参照してください。
4. `SKILL.md` から追加の文脈が必要な場合は、同じ skill ディレクトリ配下の補足ファイルも参照してください。
5. 適切な skill が見つからない場合のみ、通常の手順で対応してください。

## 期待する振る舞い

- `skills.json` は skill の索引として使ってください。
- 実際の詳細な指示は `SKILL.md` と補足ファイルから取得してください。
- skill の採用判断は、ユーザーの依頼内容と `description` の一致度を基準にしてください。