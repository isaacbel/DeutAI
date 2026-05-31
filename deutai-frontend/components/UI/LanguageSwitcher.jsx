'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ isMobile = false }) {
  const { lang, setLang } = useLanguage();
  const [hovered, setHovered] = useState(false);

  const toggleLang = () => setLang(lang === 'ar' ? 'de' : 'ar');

  if (isMobile) {
    return (
      <button
        onClick={toggleLang}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex min-h-12 items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer"
        style={{
          background: hovered ? 'rgba(156, 123, 172, 0.15)' : 'rgba(255, 255, 255, 0.9)',
          border: '1.5px solid ' + (hovered ? '#5A3D68' : 'rgba(156, 123, 172, 0.4)'),
          color: '#5A3D68',
          boxShadow: hovered 
            ? '0 4px 20px rgba(156, 123, 172, 0.2), 0 2px 6px rgba(156, 123, 172, 0.12)' 
            : '0 4px 16px rgba(156, 123, 172, 0.08)',
          backdropFilter: 'blur(8px)',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        }}
      >
        <Globe 
          size={16} 
          style={{ 
            color: '#5A3D68', 
            transition: 'transform 0.5s ease', 
            transform: hovered ? 'rotate(180deg)' : 'rotate(0deg)' 
          }} 
        />
        <span className="font-mono text-[14px] font-bold tracking-wide" style={{ color: '#5A3D68' }}>
          {lang === 'ar' ? 'العربية' : 'Deutsch'}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLang}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-11 h-11 flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-pointer"
      style={{
        background: hovered ? 'rgba(156, 123, 172, 0.15)' : 'rgba(255, 255, 255, 0.9)',
        border: '1.5px solid ' + (hovered ? '#5A3D68' : 'rgba(156, 123, 172, 0.4)'),
        color: '#5A3D68',
        boxShadow: hovered 
          ? '0 4px 20px rgba(156, 123, 172, 0.2), 0 2px 6px rgba(156, 123, 172, 0.12)' 
          : '0 4px 16px rgba(156, 123, 172, 0.08)',
        backdropFilter: 'blur(8px)',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
      title="Toggle Language"
    >
      <Globe 
        size={14} 
        className="mb-0.5" 
        style={{ 
          transition: 'transform 0.5s ease', 
          transform: hovered ? 'rotate(180deg)' : 'rotate(0deg)' 
        }} 
      />
      <span className="font-mono text-[14px] font-extrabold tracking-wider">
        {lang === 'ar' ? 'AR' : 'DE'}
      </span>
    </button>
  );
}
