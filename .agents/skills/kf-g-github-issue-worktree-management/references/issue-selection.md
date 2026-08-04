# Issue 選択

特定の issue を指定せず、issue-linked work の対象を選ぶ指示を受けた時は以下の汎用手順に従う。PJ固有の選定条件は `.agents/rules/` の該当 rule に従う。

コマンド詳細は [issue-reference.md](issue-reference.md) を参照。

1. プロジェクトまたは issue 一覧から候補を取得する。
1. プロジェクトの status など、依頼で指定された条件に候補を絞る。
1. 依存関係、優先度、ユーザー指定の順序など、利用可能な根拠で候補を選ぶ。
1. 選択した issue の内容を `gh issue view` で確認し、作業を開始する。
1. 作業中は、随時 issue の description の更新・status 更新・comment 追記など、記録できるものは常に記録する。

選定条件が取得できず合理的な候補を決められない場合は、推測で着手せず、観測結果と必要な解決方針を報告する。PJ固有の停止条件は rule で定める。
