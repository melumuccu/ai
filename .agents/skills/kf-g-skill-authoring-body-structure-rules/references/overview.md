# 基本ルールの全体像

## 目的

skill の本文構成を、エージェントが実行可能な粒度で一貫させる。
基本ルールは skill 作成・改修のたびに適用する普遍的ルール。

## 基本ルール

| # | 原則 | 要点 |
| --- | --- | --- |
| 1 | 肯定形の必須手順 | 着手条件・手順・出力条件を「必ずこうする」形式で書く |
| 2 | description が適用ゲート | frontmatter `description` だけで適用可否を決める |
| 3 | SKILL.md は目次 | 概要と読み進め方に徹し、詳細は references へ分離する |

## 適用範囲

- `.agents/skills/` 配下の自作 skill の SKILL.md 本文
- 同一 skill ディレクトリ内の references/

## 適用範囲外（他 skill へ委譲）

| 対象 | 委譲先 |
| --- | --- |
| skill の命名・一覧配置 | `kf-g-skill-naming-creation-organization-rules` |
| eval 実行、description 最適化、benchmark | `skill-creator` |
| 外部 skill（`skills-lock.json` 由来）の直接改修 | 自作 skill で補完する |

## 他 skill との役割分担

| skill | 担当 |
| --- | --- |
| `kf-g-skill-naming-creation-organization-rules` | ディレクトリ名、frontmatter 英語化、一覧整合 |
| `skill-creator` | skill 作成フロー、eval、改善サイクル |
| 本 skill | 本文の指示形式、description ゲート、目次/references 構成 |

## 着手時の必須確認

1. 対象が自作 skill の SKILL.md 本文か確認する
1. すべての基本ルールを満たす構成案を立てる
1. 適用条件を SKILL.md の frontmatter `description` へ記載する
1. references には原則詳細のみを主題別ファイル（例: `positive-instruction-style.md`）として配置する
