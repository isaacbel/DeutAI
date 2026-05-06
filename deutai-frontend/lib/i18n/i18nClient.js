'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import arCommon from '@/public/locales/ar/common.json';
import deCommon from '@/public/locales/de/common.json';

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources: {
      ar: { common: arCommon },
      de: { common: deCommon },
    },
    lng: 'ar',
    fallbackLng: 'ar',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18next;
