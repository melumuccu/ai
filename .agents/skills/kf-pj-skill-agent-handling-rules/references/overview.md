# 概要

## 基本原則

1. **編集対象はこのリポジトリ**: skill の修正・追加・削除は `.agents/skills/` 配下で行う
1. **ホームディレクトリは触らない**: `~/.agent/skills` および `~/.agents/skills` 配下の skill 本体は変更しない
1. **同期はユーザー側の作業**: main マージ後、ユーザーが [vercel-labs/skills](https://github.com/vercel-labs/skills) でホームディレクトリへ配置する
1. **差分は当然**: リポジトリとホームディレクトリ間で内容が異なることは正常な状態として扱う

## 適用範囲

- このリポジトリ（`melumuccu/ai`）の skill 編集・追加・削除
- skill 修正依頼の編集先判断
- main マージ後の同期前提の説明

## 適用外

- 外部 skill（`skills-lock.json` 管理）の upstream 直接変更
- vercel-labs/skills ツール自体の改修
- ホームディレクトリ skill の内容修正

## 着手条件

次のいずれかに該当する → この skill を読んでから作業する。

- skill の修正・追加・削除依頼を受けた
- 編集先がリポジトリかホームか判断が必要

## 出力条件

- 編集先を `.agents/skills/`（リポジトリ）と明示する
- ホームディレクトリ skill を変更しない旨を守る
- 差分があっても異常と断定しない
