# main マージ後の同期

## 基本方針

このリポジトリの skill が main にマージされた後、ユーザーが [vercel-labs/skills](https://github.com/vercel-labs/skills) を使い、ホームディレクトリ直下の `.agent/skills` へ配置する。
エージェントは同期コマンドを代行せず、前提として説明する。

## 同期の流れ

1. リポジトリで skill 変更を PR 経由で main にマージする
1. ユーザーが vercel-labs/skills でホームディレクトリへ skill を配置する
1. 配置先は `~/.agent/skills/`（vercel-labs/skills の既定運用）

## エージェントの必須手順

1. skill 修正完了報告で、main マージ後にユーザー側同期が必要であることを伝える
1. 同期は vercel-labs/skills 経由であることを明示する
1. マージ前の変更がホーム側に未反映であることは正常と説明する

## 禁止事項

- main 未マージの変更をホーム側へ先に反映しない
- vercel-labs/skills の具体的コマンドを推測で断定しない（公式 README を参照するよう案内する）
- ホーム側を直接編集して同期済みと報告しない

## 完了判定

1. 同期責務がユーザー側（vercel-labs/skills）にあることを説明している
1. エージェントがホーム skill を直接更新していない
