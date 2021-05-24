# alexa-TVguider
アレクサのカスタムスキル「番組ガイド」

## SAM Template
Resourcesはnodejs10.xのLambda

## Lambda Function

### index.js


### environment values
```
BASE_URL=https://
GEO_URL=http://
```

## Library
### geolocation
緯度経度から都道府県の情報を取得する
また、北海道の場合はさらにエリアを取得する。

`params`
  - x: 緯度
  - y: 経度

`responsne`
  - 北海道（札幌）
  - 大阪府
  - 東京都　// default

### scraping
テレビ番組表からおすすめ番組を抽出する

`params`
  - loc: 東京都
  - category: バラエティ

`responsne`
  - 北海道（札幌）
  - 大阪府
  - 東京都　// default
