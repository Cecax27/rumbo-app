import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './assets/locales/en.json';
import es from './assets/locales/es.json';

const resources = {
  'es': { translation: es},
  'en': { translation: en},
}

let _ready = false;
const _readyPromise = (async () => {
  try {
    const locales = Localization.getLocales();
    const lang = (locales && locales[0] ? locales[0].languageTag : 'en').split('-')[0];
    await i18n
      .use(initReactI18next)
      .init({
        lng: lang,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        resources,
      });
    _ready = true;
  } catch (error) {
    _ready = true;
    console.warn('i18n init failed, falling back to en:', error);
  }
})();

i18n.isReady = () => _ready;
i18n.ready = _readyPromise;

export default i18n;
