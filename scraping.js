const request = require("request-promise");
require('dotenv').config()

const env = process.env

const baseUrl = env.BASE_URL;
const genre = {
  "ドラマ": "0x3",
  "映画": "0x6",
  "スポーツ": "0x1",
  "音楽": "0x4",
  "バラエティ": "0x5",
  "アニメ": "0x7",
  "教育": "0xA",
  "ニュース": "0x0",
  "ワイドショー": "0x2",
  "ドキュメンタリー": "0x8",
  "劇場": "0x9",
  "福祉": "0xB",
  "その他": "0xF",
};
const area = {
  "北海道（札幌）" :"10",
  "北海道（函館）" :"11",
  "北海道（旭川）" :"12",
  "北海道（帯広）" :"13",
  "北海道（釧路）" :"14",
  "北海道（北見）" :"15",
  "北海道（室蘭）" :"16",
  "青森" :"22",
  "岩手" :"20",
  "宮城" :"17",
  "秋田" :"18",
  "山形" :"19",
  "福島" :"21",
  "東京" :"23",
  "神奈川" :"24",
  "埼玉" :"29",
  "千葉" :"27",
  "茨城" :"26",
  "栃木" :"28",
  "群馬" :"25",
  "山梨" :"32",
  "新潟" :"31",
  "長野" :"30",
  "富山" :"37",
  "石川" :"34",
  "福井" :"36",
  "愛知" :"33",
  "岐阜" :"39",
  "静岡" :"35",
  "三重" :"38",
  "大阪" :"40",
  "兵庫" :"42",
  "京都" :"41",
  "滋賀" :"45",
  "奈良" :"44",
  "和歌山" :"43",
  "鳥取" :"49",
  "島根" :"48",
  "岡山" :"47",
  "広島" :"46",
  "山口" :"50",
  "徳島" :"53",
  "香川" :"52",
  "愛媛" :"51",
  "高知" :"54",
  "福岡" :"55",
  "佐賀" :"61",
  "長崎" :"57",
  "熊本" :"56",
  "大分" :"60",
  "宮崎" :"59",
  "鹿児島" :"58",
  "沖縄" :"62",
}
const t = {
  "すべて": "3 1",
  "BS放送": "1",
  "地上波": "3",
}
const oc = {
  "すべて": "",
  "15分以下": "-1500",
  "30分以上": "+3000",
  "60分以上": "+6000"
};
const ob = {
  "すべて": "",
  "新番組": "🈟",
  "再放送": "🈞",
  "最終回": "🈡",
  "無料": "🈚"
};
const sort = {
  "放送時間順": "+broadCastStartDate",
  "放送局順": "+channelNumber",
  "見たい！数順": "-mitaiCount",
  "感想数順": "-reviewCount"
}
const q = "";
const limit = 1;
const offset = 0;

async function getTVProgramm(loc, category){
  const today = new Date();
  const startDate = today.getHours() > 18 ? today : new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0,0);
  const startDateEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 27, 0,0);

  const options = {
    url: baseUrl,
    method: "POST",
    form: {
      areaId: area[loc],
      broadCastStartDate: Math.floor(startDate.getTime() / 1000),
      broadCastStartDateEnd: Math.floor(startDateEnd.getTime() / 1000),
      duration: oc["30分以上"],
      element: ob["すべて"],
      majorGenreId: genre[category],
      query: q,
      results: limit,
      siTypeId: t["地上波"],
      sort: sort["見たい！数順"],
      start: offset,
    },
    json: true,
  };

  return new Promise((resolve, reject) => {
    request(options)
    .then((body) => {
      const response = body["ResultSet"];
      if(response["attribute"]["totalResultsReturned"] == 0){
        throw "404: No Returned";
      }

      resolve(response["Result"][0]);
    })
    .catch((err) => {
      reject(err);
    });
  });
}

getTVProgramm().then(r => console.log(r))
