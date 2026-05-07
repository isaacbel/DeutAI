'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function ColdStartLoader() {
  const { lang } = useLanguage();
  const MESSAGES = lang === 'ar'
    ? [
      { text: 'جارٍ تهيئة النظام...', pct: 10 },
      { text: 'الاتصال بقواعد النحو...', pct: 40 },
      { text: 'تحميل وحدات التحليل...', pct: 70 },
      { text: 'النظام جاهز. التحليل متاح.', pct: 100 },
    ]
    : [
      { text: 'System wird initialisiert...', pct: 10 },
      { text: 'Verbindung zu Grammatikdatenbanken...', pct: 40 },
      { text: 'Lade Analyse-Module...', pct: 70 },
      { text: 'System bereit. Analyse verfuegbar.', pct: 100 },
    ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (msgIndex >= MESSAGES.length - 1) return;
    const t = setTimeout(() => setMsgIndex(i => i + 1), 3000);
    return () => clearTimeout(t);
  }, [msgIndex]);

  const current = MESSAGES[msgIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#000000' }}
    >
      {/* Grid BG */}
      <div className="absolute inset-0 grid-scan-bg opacity-10 pointer-events-none" />

      {/* Scan bar */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, transparent 0%, #D4AF37 30%, #fff 50%, #D4AF37 70%, transparent 100%)',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.8), 0 0 40px rgba(212, 175, 55, 0.3)',
          animation: 'scanLineLoop 2s ease-in-out infinite',
        }}
      />

      {/* Gold tint overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center">
          <h1
            className="text-3xl font-bold text-gold"
            style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '6px' }}
          >
            DeutAI
          </h1>
          <p className="system-subtitle mt-1">SYSTÈME</p>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '2px', background: '#1a1a1a' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${current.pct}%`,
                background: 'linear-gradient(90deg, #B8962E, #D4AF37)',
                boxShadow: '0 0 8px rgba(212,175,55,0.5)',
              }}
            />
          </div>
        </div>

        {/* Message */}
        <div className="text-center" style={{ minHeight: '40px' }}>
          <p
            className="text-xs font-mono text-gold"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '1px',
              animation: 'fadeIn 0.4s ease-out',
              key: msgIndex,
            }}
          >
            {'> '}{current.text}
          </p>
        </div>

        {/* Spinner dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: '4px',
                height: '4px',
                background: '#D4AF37',
                animation: `pulse-gold 1.5s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
