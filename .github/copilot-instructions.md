# Copilot Instructions

## アウトプットルール

- ユーザとの接点となるアウトプットでは、必ず日本語で出力してください。
  - 対象例 (ただしこれに限らない)
    - チャットのやり取り
    - GitHub 上の issue / pull request の description・comment・review
    - コミットメッセージ案
    - コード上のコメント
    - README や各種ドキュメント
- 一方で、skill のディレクトリ名や `SKILL.md` の frontmatter のような機械可読メタデータはユーザ向け出力ではありません。これらは各 skill の規約に従い、必要なら英語や ASCII で記述してください。

## コマンド実行

- コマンド実行の許可を確認する際は、コマンドの説明を日本語で簡潔に出力してください。

## skills の改変ルール

- skills-lock.json に記載されている skills は外部リポジトリ由来であり、今後も外部更新を取り込む前提のため改変を禁止します。
  - 必要な調整は以下のいずれかで対応してください。
    - skills-lock.json に記載されていない自作 skills で上書き・補足する
    - そのための新規 skills を作成する
