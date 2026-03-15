# .agents/skills

このディレクトリには、各 skill の `SKILL.md` と、その一覧をまとめた `.agents/skills/skills.json` を配置します。

## skills.json を生成する目的

クラウドで動作する AI Agent は、global skills を直接指定できないことが多く、ローカル環境の skill をそのまま認識できない場合があります。

この問題に対応するために、`.agents/skills/skills.json` を AI Agent に参照させ、ローカルの skill 一覧を擬似的なグローバルスキルとして扱わせることを目的とします。

`skills.json` に含まれる `name` と `description` は、一般的な `SKILL.md` のフロントマターと同義の情報として扱います。AI Agent はこの情報を使って、現在のユーザー要求に対してどの skill を発火させるべきかを判断します。

発火させる skill が定まったら、AI Agent は `path` を使って対応する `SKILL.md` を参照し、必要に応じてその skill に付随する補足ファイルも読み込みます。

## 期待する利用フロー

1. AI Agent が `.agents/skills/skills.json` を読む
2. `name` と `description` を見て、どの skill を使うべきか判断する
3. 対象 skill の `path` をもとに `SKILL.md` を開く
4. 必要なら同じディレクトリ配下の補足ファイルも参照する

この仕組みにより、global skills を直接扱えない実行環境でも、ローカルに置いた skill 群を一覧化して AI Agent に認識させられます。