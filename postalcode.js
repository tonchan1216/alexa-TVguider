const request = require("request-promise");
require('dotenv').config()

const env = process.env

const baseUrl = env.ZIP_URL;

const postalCode = "1140023";

async function getPrefectures(postalCode){
  const options = {
    url: baseUrl + '?zipcode=' + postalCode,
    method: "GET",
    json: true,
  };

  return new Promise((resolve, reject) => {
    request(options)
    .then((body) => {
      if(body["status"] != '200'){
        throw body["status"] + ': ' + body["message"];
      }
      if(body["results"] == null){
        throw '404: Not Found';
      }
      const address = body['results'][0]['address1']
      let area = ""

      if(address == '北海道'){
        const city = body['results'][0]['address2']
        if(city.match(/函館市|北斗市|知内町|木古内町|七飯町/)){
          area = "（函館）"
        } else if(city.match(/旭川市|鷹栖町|東神楽町|当麻町|比布町|愛別町|東川町|美瑛町/)){
          area = "（旭川）"
        } else if(city.match(/帯広市|音更町|士幌町|上士幌町|鹿追町|清水町|芽室町|中札内村|更別村|幕別町|池田町|豊頃町|浦幌町/)){
          area = "（帯広）"
        } else if(city.match(/釧路市|釧路町|厚岸町|標茶町|鶴居村|白糠町/)){
          area = "（釧路）"
        } else if(city.match(/北見市|訓子府町/)){
          area = "（北見）"
        } else if(city.match(/室蘭市|登別市|伊達市|鹿部町|森町|八雲町|長万部町|豊浦町|洞爺湖町|白老町/)){
          area = "（室蘭）"
        } else {
          area = "（札幌）" // default = Sapporo
        }
      }

      resolve(address + area);
    })
    .catch((err) => {
      reject(err);
    });
  });
}

getPrefectures(postalCode).then(r => console.log(r)).catch(e => console.log(e))
