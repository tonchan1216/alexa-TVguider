const Alexa = require('ask-sdk-core');
const i18n = require('i18next');

const geolocation = require('./geolocation');
const scraping = require('./scraping');

// core functionality for skill
const RecommendHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    // checks request type
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'RecommendIntent');
  },
  async handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let speakOutput = "";
    const defaultPrefecture = "東京都";
    let prefecture = defaultPrefecture;
    const category = "バラエティ";

    //使っているAlexaデバイスが位置情報サービスに対応しているか確認
    const isGeoSupported = handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Geolocation;
    if (isGeoSupported) {
      const geoObject = handlerInput.requestEnvelope.context.Geolocation;
      if (!geoObject || !geoObject.coordinate) {
          //このスキルを使うユーザーが、位置情報サービスの権限を与えていない場合、Alexaアプリでカードを表示し、許可を促す
          return handlerInput.responseBuilder
            .speak('このスキルではお客様の位置情報を使用します。位置情報の共有を有効にするには、Alexaアプリに移動し、指示に従って操作してください。')
            .withAskForPermissionsConsentCard(['alexa::devices:all:geolocation:read'])
            .getResponse();
      } else {
          //座標情報を取得
          const coordinate = handlerInput.requestEnvelope.context.Geolocation.coordinate;
          const latitude = coordinate.latitudeInDegrees; //緯度
          const longitude = coordinate.longitudeInDegrees; //経度
          try {
            //座標情報から都道府県情報を取得。失敗したらデフォルト値
            prefecture = await geolocation.searchByGeoLocation(longitude, latitude);
          }
          catch(e) {
            console.log(e);
          }
      }
    } else { //デバイスがGeolocationに対応していない
      console.log("Geolocation非対応");
    }

    try {
      const response = await scraping.getTVProgramm(prefecture, category);
      console.log(response);
      speakOutput = requestAttributes.t('HEAD_MESSAGE') + response["broadCastStartTime"] + requestAttributes.t('FROM_MESSAGE') + response["title"] + requestAttributes.t('FOOT_MESSAGE');
      handlerInput.responseBuilder.withSimpleCard(requestAttributes.t('SKILL_NAME'), response["title"]);
    } catch(e) {
      console.log(e);
      speakOutput = requestAttributes.t('ERROR_MESSAGE');
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('HELP_MESSAGE'))
      .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};

const FallbackHandler = {
  // The FallbackIntent can only be sent in those locales which support it,
  // so this handler will always be skipped in locales where it is not supported.
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('FALLBACK_MESSAGE'))
      .reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('STOP_MESSAGE'))
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('ERROR_MESSAGE'))
      .reprompt(requestAttributes.t('ERROR_MESSAGE'))
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput) {
    // Gets the locale from the request and initializes i18next.
    const localizationClient = i18n.init({
      lng: handlerInput.requestEnvelope.request.locale,
      resources: languageStrings,
      returnObjects: true
    });
    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
      // gets arguments through and passes them to
      // i18next using sprintf to replace string placeholders
      // with arguments.
      const args = arguments;
      const value = i18n.t(...args);
      // If an array is used then a random value is selected
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient.localize(...args);
    }
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    RecommendHandler,
    HelpHandler,
    ExitHandler,
    FallbackHandler,
    SessionEndedRequestHandler,
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/basic-fact/v2')
  .lambda();

// TODO: Replace this data with your own.
// It is organized by language/locale.  You can safely ignore the locales you aren't using.
// Update the name and messages to align with the theme of your skill
const jpData = {
  translation: {
    SKILL_NAME: 'おすすめ番組ガイド',
    HEAD_MESSAGE: '今日のおすすめ番組は、',
    FROM_MESSAGE: 'から',
    FOOT_MESSAGE: 'です。',
    HELP_MESSAGE: 'おすすめ番組を聞きたい時は「おすすめ番組をおしえて」と、終わりたい時は「おしまい」と言ってください。どうしますか？',
    HELP_REPROMPT: 'どうしますか？',
    ERROR_MESSAGE: '申し訳ありませんが、エラーが発生しました',
    STOP_MESSAGE: 'さようなら',
  },
};

const jpjpData = {
  translation: {
    SKILL_NAME: 'おすすめ番組ガイド',
  },
};

// constructs i18n and l10n data structure
const languageStrings = {
  'ja': jpData,
  'ja-JP': jpjpData,
};
