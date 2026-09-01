# issue から PR までの手順

次の順で進める。

1. <span id="step-issue"></span>**issue**
   プランニングが必要な作業は、専用 worktree を作る前に issue を作成し、プランニングに必要な情報を issue に集約する。
   既存 issue を使う場合は description と comment を確認する。
1. <span id="step-worktree"></span>**worktree**
   変更を加える前に専用 worktree を作成し、その worktree 内だけで作業する。
   issue 起点なら 1 issue = 1 branch = 1 worktree とする。
   main branch では直接変更しない。
   配置は [worktree.md](worktree.md) に従う。
1. <span id="step-commit"></span>**commit**
   変更を論理単位へ分割し、検証後に atomic commit する。
   粒度と手順は `kf-g-git-commit-atomic-rules` に従う。
1. <span id="step-push"></span>**push**
   atomic commit のあと remote へ push する。
   push 前に hook が失敗した場合は、下記「安全確認」に従い停止する。
1. <span id="step-pr"></span>**PR**
   ファイル変更差分がある作業では、push のあと PR を作成する。
   PR 作成後、ユーザーへの回答に PR URL を記載する。
   issue 起点なら対応する issue と PR を紐づけ、PR URL を issue にも記録する。
   ファイル変更差分がない HTML 報告の R2 配布だけは PR を作成しない。
   ユーザーが commit や PR 作成を明示的に禁止した場合は、その指示に従う。
1. <span id="step-git-ops"></span>**通常作業の git 操作**
   上記 commit、push、PR の順で進め、PR URL をユーザーへ返すまで完了する。
1. <span id="step-safety"></span>**安全確認**
   commit または push 前に gitleaks などの hook が失敗した場合は、`--no-verify` で回避せず停止する。
