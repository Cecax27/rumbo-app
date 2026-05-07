import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './assets/locales/en.json';
import es from './assets/locales/es.json';

const resources = {
  'es': { translation: es},
  'en': { translation: en},
}

const initI18n = async () => {
  try {
    const lang = Localization.getLocales()[0].languageTag.split('-')[0];
    await i18n
      .use(initReactI18next)  
      .init({
        lng: lang,
        fallbackLng: 'en',
        interpolation:{
          escapeValue: false,
        },
        resources,
      })
  } catch (error) {
    
  }
}

initI18n()

export default i18n;
