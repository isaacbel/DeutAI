'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ isMobile = false }) {
  const { lang, setLang } = useLanguage();

  const toggleLang = () => setLang(lang === 'ar' ? 'de' : 'ar');

  if (isMobile) {
    return (
      <button
        onClick={toggleLang}
        className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#d6d6e8',
        }}
      >
        <Globe size={16} />
        <span className="font-mono text-[14px] font-semibold">
          {lang === 'ar' ? 'العربية' : 'Deutsch'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLang}
      className="w-11 h-11 flex flex-col items-center justify-center rounded-xl transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#a0a0b5',
      }}
      title="Toggle Language"
    >
      <Globe size={14} className="mb-0.5 opacity-70" />
      <span className="font-mono text-[14px] font-bold tracking-wider">
        {lang === 'ar' ? 'AR' : 'DE'}
      </span>
    </button>
  );
}
