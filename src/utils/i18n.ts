import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻訳リソース
import ja from '../locales/ja';
import en from '../locales/en';
import zh from '../locales/zh';
import ko from '../locales/ko';
import af from '../locales/af';

const resources = {
  ja: { translation: ja },
  en: { translation: en },
  zh: { translation: zh },
  ko: { translation: ko },
  af: { translation: af },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja', // デフォルト言語
    debug: process.env.NODE_ENV === 'development',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;