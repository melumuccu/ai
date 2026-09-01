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
1. <span id="step-pr"></span>**PR**
   コード、skill、rule などファイル変更差分がある作業は PR を作成する。
   issue 起点なら対応する issue と PR を紐づけ、PR URL を issue に記録する。
   ファイル変更差分がない HTML 報告の R2 配布だけは PR を作成しない。
1. <span id="step-git-ops"></span>**通常作業の git 操作**
   通常作業では、必要な変更を stage、commit、push し、PR を作成してよい。
1. <span id="step-safety"></span>**安全確認**
   commit または push 前に gitleaks などの hook が失敗した場合は、`--no-verify` で回避せず停止する。
