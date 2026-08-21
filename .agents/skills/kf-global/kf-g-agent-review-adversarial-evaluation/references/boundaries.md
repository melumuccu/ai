# 境界と他 skill との関係

## 置換・統合しない skill

- **`kf-g-agent-review-post-implementation-two-stage` と置換しない**
  - 実装後 2 段階レビュー、plan 盲検（第1段階で plan 非共有）はそちらの責務
- **`kf-g-agent-research-report-only-unless-approved` と統合しない**
  - 編集禁止・許可待ちゲートはそちら
  - 助言・レビューで編集指示が無い場合は併用する

## 適用しない場面

- **事実照会のみ**（評価要求なし）では本 skill を適用しない
  - 例: 「この API の引数は何か」「ファイルの所在を教えて」

## 適用を遅らせる場面

- **純粋なアイデア発散**で評価対象が未提示の場合
  - 候補生成後、有力案が定まった時点でその案へ敵対的評価を適用する

## 出力形式 skill との関係

- **`genshijin-review` の出力形式契約を上書きしない**
  - PR コメント形式など特定形式が求められたら、形式 skill に従う
  - 評価姿勢（前提への疑い、失敗モードの表面化、安易承認の拒否）は本 skill に従う
- チャット（Markdown）の推奨は行末 `(推奨)`。HTML 出力時は badge で表現する。

## two-stage との概念差

- two-stage の「忖度防止（plan 非共有）」とは別概念
- 本 skill は助言・レビュー全般の評価姿勢（前提疑い、失敗モード表面化、 rubber-stamping 拒否）
