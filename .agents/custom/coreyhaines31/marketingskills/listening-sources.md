# Listening Sources — Japan Market

`.agents/listening-sources.md` 相当の日本市場向け設定。
listening workflow 実行時に参照する。

---

## What We're Listening For

**Brand / product:** （自社ブランド名に置換）
**Category:** （例: B2B マーケ SaaS、D2C スキンケア、業務効率化ツール）
**Goal:** （例: 稟議前の比較検討層の把握、競合からの乗り換え意向、D2C の口コミ監視）

## ICP (for scoring)

- **Role:** B2B なら現場担当、マーケ/情シス、経営企画。B2C なら 20〜40 代、購買意向層。
- **Company stage:** B2B: 中小〜中堅、上場準備中。B2C: ブランド認知前〜成長期。
- **Industry:** （自社 ICP に置換）
- **Signals they're a fit:** 「導入検討」「代替探し」「稟議」「比較」「解約」などの意図語、自社/競合メンション、note/X での課題共有。

---

## Target Accounts

関連投稿は優先的にスコアリング。20〜50 件上限。

### LinkedIn (browser-driven — use dev-browser to view feed)

日本 B2B では補助チャネル。
国内決裁者は X / note / 業界メディア経由が多い。
利用時に自社ターゲットアカウントを追加。

- （自社ターゲット企業の担当者） — `linkedin.com/in/（要調査）`

### X / Twitter (browser-driven)

- @（自社公式）
- @（競合1）
- @（業界インフルエンサー要調査）

### Reddit

日本市場では優先度低。
X / note を主とする。
補助として r/japan 等のみ。無理にサブレを増やさない。

- u/（該当があれば要調査）

### note / はてな

- （自社 note）
- （カテゴリキーワードの新着記事 RSS 要調査）

### Blogs / Newsletters (RSS)

- （自社/業界メディア） — `https://（要調査）/feed/`

### YouTube channels (RSS)

- （自社/競合/レビュアー） — channel ID `UCxxxxxxxx`

---

## Keywords (intent signals)

日本語の意図フレーズで検索。
X、note、はてな、Speaker Deck、YouTube Japan、Instagram を横断。

### High-intent (someone shopping or switching)

- 「（カテゴリ） おすすめ 比較」
- 「（競合名） 代替」
- 「（競合名） 乗り換え」
- 「（カテゴリ） ツール 導入 検討」
- 「（カテゴリ） 稟議 資料」

### Problem signals (someone in pain)

- 「（カテゴリ） 大変 運用」
- 「（カテゴリ） 高い コスト」
- 「（競合名） 使いにくい」
- 「稟議 通らない （カテゴリ）」

### Brand mentions

- 「（自社ブランド）」
- 「（自社ブランド 表記ゆれ）」
- 「（自社ドメイン）」

### Competitor mentions (monitor for switching language)

- 「（競合1）」
- 「（競合2）」

---

## Subreddits

Reddit JSON API は補助。
日本市場では優先度低。X / note を主。

- r/japan（一般。カテゴリ一致は稀）
- （ニッチが明確な場合のみ追加。無理に増やさない）

---

## Saved Searches (manual / browser-driven)

### LinkedIn (regular)

補助。日本 B2B では X / 業界メディアを優先。

- Posts hashtag — `https://linkedin.com/feed/hashtag/（要調査）/`

### X advanced search

- カテゴリ+導入検討 — `https://x.com/search?q=（エンコード済みクエリ）&f=live`
- 競合+解約 — `https://x.com/search?q=（エンコード済みクエリ）&f=live`

### note / はてな

- note キーワード検索 — `https://note.com/search?q=（キーワード）`
- はてなブックマーク新着 — `https://b.hatena.ne.jp/hotentry`

### Speaker Deck

- 検索 — `https://speakerdeck.com/search?q=（キーワード）`

---

## Do Not Engage

- 誹謗中傷、人格攻撃、匿名アカウントへの煽り返し
- 政治・宗教・国際情勢の炎上スレ
- 薬機法グレーの効果断定、健康食品/D2C の未承認表現への同調
- ステマ規制に抵触するステルス推奨（経済的利害関係の非明示）
- 競合の内部情報・リーク要求

---

## Notes for Claude

- 「today's top 10」は listening.md の triage 形式に従う
- 下書きは日本語。公開前に景表法・ステマ規制の表現チェック
- LinkedIn / X は dev-browser（ログインセッション）を使用
- その他は listening.md の curl レシピを参照
- デフォルト lookback: 24h。ユーザー指定で上書き可
- 投稿前に必ず確認。下書き提示のみ。ユーザーが手動投稿
- 営業時間・返信 SLA は JST 基準で記載
- Instagram は B2C/D2C で優先度上。ハッシュタグとストーリーズ言及を監視
