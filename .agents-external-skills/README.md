# `.agents-external-skills`

`npx skills add` と marketplace の external plugin 向け配信用コピー。

skill 本文の原本は [`.agents/skills`](../.agents/skills/README.md) にある。
ここへは `skills-lock.json` のキーだけを実体コピーする。
原本の場所であり、外部 skill の編集先ではない。

## 二重に実ファイルを持つ理由

latest `skills add` は、`.agents/skills` 配下かつ lock 済みの skill を発見時に捨てる。
詳細は [vercel-labs/skills の skills.ts](https://github.com/vercel-labs/skills/blob/v1.5.23/src/skills.ts)。

配信用を `.agents/skills` に置くと一覧から消える。
symlink は CLI の walk がディレクトリだけを見るため使えない。
そのため原本と配信用を別ディレクトリの実体として持つ。

## 外部 skill は直接変更しない

ここにある skill ディレクトリは lock 追跡の外部 skill のコピーである。
原本も配信用も、外部 skill の本文は直接変更しない。
更新は upstream 取り込み、不足は自作 skill で補完する。
この配下の skill ディレクトリは `scripts/sync-external-skills.mjs` が上書きする。

直下の `README.md` は同期対象外。
lock キーのディレクトリだけを差し替える。

kf スキルは lock 対象外なので、ここへはコピーしない。
