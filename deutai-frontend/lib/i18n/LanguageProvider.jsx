'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import i18n from './i18nClient';

const LANGUAGE_KEY = 'deutai:lang';
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Fix #42 — default to German (the learning target language) to avoid a flash of Arabic for new users
  const [lang, setLang] = useState('de');

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'ar' || saved === 'de') setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, lang);
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    // Fix #43 — setting lang/dir on <body> is non-standard; <html> is sufficient
  }, [lang]);

  const t = useMemo(() => {
    return (key, params = {}) => i18n.t(key, { ...params, lng: lang });
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
