# Dockerfile のレイヤー見出し

Dockerfile は multi-stage build を前提にする。
各 `FROM ... AS ...` の直前に、その stage の役割が分かるレイヤー見出しを置く。

## 見出しルール

- `FROM` ごとに見出しを置く
- stage alias は `base`, `dependencies`, `development`, `build`, `runtime` などの小文字名にする
- 必要な stage だけを作る
- build graph と Dockerfile 上の並びを揃える
- 通常の命令ごとには見出しを増やさない

## 標準レイヤー名

- `Base Layer`
- `Dependencies Layer`
- `Development Layer`
- `Build Layer`
- `Runtime Layer`
- `Test Layer`

`Test Layer` は、test 専用 image や CI 用 target が必要な場合だけ使う。

## 最終チェック

- Dockerfile の各 `FROM` にレイヤー見出しがあるか
- Dockerfile が multi-stage build 前提になっているか
- stage alias が小文字で、役割を表す名前になっているか
