import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import urTranslations from '../locales/ur.json';
import { safeGet, safeSet } from './storage.ts';

const KEY_LANG = 'kisan_lang';

let savedLang: 'en' | 'ur' = 'ur';
try {
  const stored = safeGet(KEY_LANG);
  if (stored === 'en' || stored === 'ur') {
    savedLang = stored;
  }
} catch {
  savedLang = 'ur';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    ur: { translation: urTranslations },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export function setAppLanguage(lang: 'en' | 'ur') {
  safeSet(KEY_LANG, lang);
  i18n.changeLanguage(lang);
  if (typeof document !== 'undefined') {
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }
}

// Initial sync on startup
if (typeof document !== 'undefined') {
  document.documentElement.dir = savedLang === 'ur' ? 'rtl' : 'ltr';
  document.documentElement.lang = savedLang;
}

export default i18n;
