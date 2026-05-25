'use client';
import { useEffect, useState } from 'react';
import { Fingerprint, Radar, BrainCircuit } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const SCAN_MESSAGE_KEYS = [
  { key: 'scan.msgInit',           icon: Radar },
  { key: 'scan.msgSyntax',         icon: BrainCircuit },
  { key: 'scan.msgAnomalies',      icon: Fingerprint },
  { key: 'scan.msgClassification', icon: BrainCircuit },
];

export default function ScanAnimation({ text }) {
  const { t } = useLanguage();
  const [msgIndex, setMsgIndex] = useState(0);
  const [hexCode, setHexCode] = useState('0x0000');

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % SCAN_MESSAGE_KEYS.length);
    }, 600);

    const hexInterval = setInterval(() => {
      setHexCode('0x' + Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0'));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(hexInterval);
    };
  }, []);

  const ActiveIcon = SCAN_MESSAGE_KEYS[msgIndex].icon;

  return (
    <div
      className="relative rounded-xl overflow-hidden p-5"
      style={{
        background: 'white',
        border: '1px solid rgba(156,123,172,0.25)',
        minHeight: '160px',
        boxShadow: '0 0 30px rgba(156,123,172,0.06) inset'
      }}
    >
      {/* Abstract decorative tech lines */}
      <div className="absolute top-0 left-4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-0 right-4 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

      {/* Corner markers */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l" style={{ borderColor: 'rgba(156,123,172,0.5)' }} />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r" style={{ borderColor: 'rgba(156,123,172,0.5)' }} />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l" style={{ borderColor: 'rgba(156,123,172,0.5)' }} />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r" style={{ borderColor: 'rgba(156,123,172,0.5)' }} />

      {/* Hex processor code */}
      <div className="absolute top-3 right-5 text-[8px] font-mono" style={{ color: 'rgba(156,123,172,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
        MEM: {hexCode}
      </div>

      <div className="flex flex-col items-center justify-center h-full gap-4 relative z-10 pt-2">
        <div className="relative">
          <ActiveIcon size={32} className="animate-pulse" style={{ color: 'var(--color-primary)' }} />
          <div className="absolute inset-0 blur-lg opacity-20 animate-pulse" style={{ background: 'var(--color-primary)' }} />
        </div>

        {/* Text preview */}
        <p
          className="text-sm text-text-muted leading-relaxed text-center max-w-[80%] mx-auto"
          style={{ fontFamily: 'Inter, sans-serif', filter: 'blur(2px)', opacity: 0.4 }}
        >
          {text}
        </p>
      </div>

      {/* Advanced Gold scan line */}
      <div
        className="absolute left-0 right-0 h-[2px]"
        style={{
        background: 'linear-gradient(90deg, transparent 0%, var(--color-primary) 30%, white 50%, var(--color-primary) 70%, transparent 100%)',
          boxShadow: '0 0 20px rgba(156,123,172,0.8), 0 0 40px rgba(156,123,172,0.3)',
          animation: 'scanLineLoop 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwdjhINFYweiIgZmlsbD0icmdiYSgxNTYsMTIzLDE3MiwwLjAyKSIvPjwvc3ZnPg==')] pointer-events-none" />

      {/* Status message */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
        <span
          className="text-[14px] px-4 py-1.5 rounded-sm flex items-center gap-2 uppercase font-bold"
          style={{
            color: 'var(--color-primary)',
            background: 'rgba(245,246,252,0.95)',
            border: '1px solid rgba(156,123,172,0.4)',
            letterSpacing: '2px',
            boxShadow: '0 0 10px rgba(156,123,172,0.15)'
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: 'var(--color-primary)' }} />
          {t(SCAN_MESSAGE_KEYS[msgIndex].key)}
        </span>
      </div>
    </div>
  );
}
