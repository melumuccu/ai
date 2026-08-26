# review の intake と対応範囲

## 目的

PR の未解決 review comment を漏れなく収集し、今回のPR内で自動適用する範囲と、PR外として保留する範囲を確定します。指摘はコメント数ではなく、独立した論理変更単位（1 commit = 1 logical change）として後続の分類へ渡します。

## Bot write gate

GitHub への comment / reply / resolve は、bot preflight 成功後に bot helper script のみ使います。

1. GitHub書き込み前に [kf-g-github-operations-bot-workflow](../../../#kf-global/kf-g-github-operations-bot-workflow/SKILL.md) の完全な preflight を実行します。
1. bot資格情報が未設定またはpreflightが失敗した場合は、同skillのsetup手順を表示して停止します。
1. 人間 `gh` 認証や `GH_TOKEN` へのfallbackは行いません。
1. replyには次のhelper commandを使います。

```sh
node ~/.agents/credentials/github/scripts/github-agent-reply.mjs OWNER/REPO PR_NUMBER COMMENT_ID BODY_FILE
```

resolveはユーザーが行い、エージェントはresolveしません。push後のreply手順と、各threadへの個別replyおよび本文の禁止事項は [group-commit-reply-sequence.md](group-commit-reply-sequence.md) に従います。

## 着手条件

次の条件を確認してから作業を開始します。

1. 対応PRのbranchとworktreeを特定します。
1. [kf-g-git-commit-atomic-rules](../../../#kf-global/kf-g-git-commit-atomic-rules/SKILL.md) を読み、commitを1つのlogical changeへ分ける基準を確認します。
1. このskillと [kf-g-github-operations-bot-workflow](../../../#kf-global/kf-g-github-operations-bot-workflow/SKILL.md) を読み、review commentのreply運用とBot write gateを確認します。
1. 未解決thread、requested changes、CI failureを一覧化します。

## 未解決threadの収集

1. PRの未解決 review comment / thread をすべて列挙します。
1. 各threadに、指摘内容・対象ファイル・意図（修正 / 説明 / 保留）を付けます。
1. 同じ指摘が複数threadに分かれている場合は、1つの論理変更として扱えるか判断します。
1. 分類結果は作業前に一覧として記録し、ユーザーへ提示できる状態にします。分類の形式と判断基準は [review-group-classification.md](review-group-classification.md) を使います。

## PR対応ファイルへの横展開

1. 対応PRの変更ファイル一覧を取得し、今回のPRで対応したファイル全体を確定します。
1. 各未解決threadの対象ファイル一覧とPRの変更ファイル一覧の積集合を確認し、同じlogical changeを含むファイルを横展開対象として全件確定します。
1. 指摘の意味を変えない範囲で、確定した対象ファイル全体へ指摘を自動的に適用し、適用結果を論理グループ分類へ引き継ぎます。
1. 既に同じ修正を含むファイルは重複変更を避け、指摘と無関係なファイル・箇所は対象外として理由を記録します。
1. 横展開はユーザーの許可を待たず、各グループの修正前に実施します。

## PR内とPR外の境界

今回のPRで対応した全ファイルへの横展開は、上記の範囲確定に含めます。PR外ファイルへの横展開候補は記録しますが、実装・commit・pushは行いません。

全グループのcommit、push、個別reply、対応表の報告が完了した後、PR外候補を報告します。候補がある場合は、現PRへ含めるか別PRへ分けるかをユーザーに確認し、選択が確定するまで保留します。PR外の実行順は [group-commit-reply-sequence.md](group-commit-reply-sequence.md) を参照します。
