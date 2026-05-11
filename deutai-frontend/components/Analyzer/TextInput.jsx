'use client';
import { useRef } from 'react';
import { PenLine } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const MAX_CHARS = 1000;

export default function TextInput({ value, onChange, disabled }) {
  const { t } = useLanguage();
  const ref = useRef(null);
  const count = value.length;
  const isOver = count > MAX_CHARS;
  const isWarn = count > 800 && !isOver;

  return (
    <div className="relative group">
      {/* Focus glow ring */}
      <div
        className={`absolute -inset-px rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-400 pointer-events-none`}
        style={{
          background: isOver
            ? 'rgba(204,85,85,0.12)'
            : 'rgba(212,175,55,0.07)',
          borderRadius: 'inherit',
          filter: 'blur(6px)',
        }}
      />

      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder={t('analyze.textareaPlaceholder')}
          dir="ltr"
          lang="de"
          rows={5}
          className="w-full px-5 py-4 text-[15px] resize-none rounded-xl outline-none transition-all duration-200"
          style={{
            background: '#131318',
            border: `1px solid ${isOver ? 'rgba(204,85,85,0.5)' : 'rgba(52,52,72,0.9)'}`,
            color: '#e8e8f4',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.75,
            caretColor: '#D4AF37',
            textAlign: 'left',
          }}
          onFocus={e => {
            if (!isOver) e.target.style.borderColor = 'rgba(212,175,55,0.4)';
          }}
          onBlur={e => {
            e.target.style.borderColor = isOver ? 'rgba(204,85,85,0.5)' : 'rgba(52,52,72,0.9)';
          }}
        />

        {/* Pen icon — decorative */}
        <PenLine
          size={15}
          className="absolute right-4 top-4 pointer-events-none transition-colors duration-200"
          style={{ color: 'rgba(212,175,55,0.2)' }}
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span
          className="text-[15px] font-mono transition-all"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            color: isOver ? '#CC5555' : 'transparent',
            userSelect: 'none',
          }}
        >
          {isOver ? t('analyze.limitExceeded', { count: count - MAX_CHARS }) : '—'}
        </span>
        <span
          className="text-[15px] font-mono tabular-nums tracking-wider px-2 py-0.5 rounded transition-all"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            color: isOver ? '#CC5555' : isWarn ? '#D4AF37' : '#a0a0b8',
            background: isOver ? 'rgba(204,85,85,0.08)' : isWarn ? 'rgba(212,175,55,0.08)' : 'transparent',
          }}
        >
          {count} / {MAX_CHARS}
        </span>
      </div>
    </div>
  );
}