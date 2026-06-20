# git commit コマンドのルール

## 使う場面

- `git commit` を実行するとき
- `pre-commit` の `gitleaks` フックで commit が止まるとき

## ルール

- `pre-commit` の `gitleaks` フックが原因で commit できない場合は、`git commit --no-verify` で commit してよい
