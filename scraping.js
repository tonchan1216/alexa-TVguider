const request = require("request-promise");
require("dotenv").config();

const env = process.env;
const baseUrl = env.BASE_URL;

const genre = {
  ドラマ: "0x3",
  映画: "0x6",
  スポーツ: "0x1",
  音楽: "0x4",
  バラエティ: "0x5",
  アニメ: "0x7",
  教育: "0xA",
  ニュース: "0x0",
  ワイドショー: "0x2",
  ドキュメンタリー: "0x8",
  劇場: "0x9",
  福祉: "0xB",
  その他: "0xF",
};
const area = {
  "北海道（札幌）": "10",
  "北海道（函館）": "11",
  "北海道（旭川）": "12",
  "北海道（帯広）": "13",
  "北海道（釧路）": "14",
  "北海道（北見）": "15",
  "北海道（室蘭）": "16",
  青森県: "22",
  岩手県: "20",
  宮城県: "17",
  秋田県: "18",
  山形県: "19",
  福島県: "21",
  東京都: "23",
  神奈川県: "24",
  埼玉県: "29",
  千葉県: "27",
  茨城県: "26",
  栃木県: "28",
  群馬県: "25",
  山梨県: "32",
  新潟県: "31",
  長野県: "30",
  富山県: "37",
  石川県: "34",
  福井県: "36",
  愛知県: "33",
  岐阜県: "39",
  静岡県: "35",
  三重県: "38",
  大阪府: "40",
  兵庫県: "42",
  京都府: "41",
  滋賀県: "45",
  奈良県: "44",
  和歌山県: "43",
  鳥取県: "49",
  島根県: "48",
  岡山県: "47",
  広島県: "46",
  山口県: "50",
  徳島県: "53",
  香川県: "52",
  愛媛県: "51",
  高知県: "54",
  福岡県: "55",
  佐賀県: "61",
  長崎県: "57",
  熊本県: "56",
  大分県: "60",
  宮崎県: "59",
  鹿児島県: "58",
  沖縄県: "62",
};
const t = {
  すべて: "3 1",
  BS放送: "1",
  地上波: "3",
};
const oc = {
  すべて: "",
  "15分以下": "-1500",
  "30分以上": "+3000",
  "60分以上": "+6000",
};
const ob = {
  すべて: "",
  新番組: "🈟",
  再放送: "🈞",
  最終回: "🈡",
  無料: "🈚",
};
const sort = {
  放送時間順: "+broadCastStartDate",
  放送局順: "+channelNumber",
  "見たい！数順": "-mitaiCount",
  感想数順: "-reviewCount",
};

const getTVProgramm = async (loc, category) => {
  const q = "";
  const limit = 1;
  const offset = 0;

  const now = new Date();
  const tzOffset = now.getTimezoneOffset() / 60;

  const goldenStartHour = 9 - tzOffset;
  const goldenEndHour = 18 - tzOffset;

  let startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    goldenStartHour,
    0,
    0
  );
  const startDateEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    goldenEndHour,
    0,
    0
  );

  if (now.getTime() > startDateEnd.getTime()) {
    startDate.setHours(startDate.getHours() + 24);
    startDateEnd.setHours(startDateEnd.getHours() + 24);
  } else if (now.getTime() > startDate.getTime()) {
    startDate = now;
  }

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

  console.log(options);

  return new Promise((resolve, reject) => {
    request(options)
      .then((body) => {
        const response = body["ResultSet"];
        if (response["attribute"]["totalResultsReturned"] == 0) {
          throw "404: No Returned";
        }

        resolve(response["Result"][0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = { getTVProgramm };
