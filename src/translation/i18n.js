import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // 사용자 브라우저 언어 감지
import Backend from 'i18next-xhr-backend';
 
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    lng: 'ko',// 초기 설정 lang
    fallbackLng: 'ko', // 설정하지 않았을 때
    whitelist: ['ko', 'en'],
    ns:['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: 'locales/add/{{lng}}/{{ns}}'
    },
  });
 
export default i18n;