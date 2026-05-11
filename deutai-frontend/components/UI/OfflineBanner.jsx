'use client';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function OfflineBanner() {
  const { t } = useLanguage();
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4"
      style={{
        background: '#1A0A0A',
        borderBottom: '1px solid #3A1A1A',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <span className="text-error text-sm">⚠</span>
      <span
        className="text-sm font-mono text-error"
        style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px' }}
      >
        {t('analyze.offline')}
      </span>
    </div>
  );
}
