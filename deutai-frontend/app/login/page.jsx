'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/Auth/LoginForm';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  // Fix #21 — show nothing until auth check completes, preventing form flash
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Fix #19 — validate expiry before redirecting to avoid redirect loops
      try {
        let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        if (pad) base64 += new Array(5 - pad).join('=');
        const { exp } = JSON.parse(atob(base64));
        if (!exp || exp * 1000 > Date.now()) {
          window.location.href = '/analyze';
          return;
        }
      } catch { /* malformed token — fall through */ }
      localStorage.removeItem('access_token');
    }
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-4 py-12 relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <div className={`absolute top-4 z-20 ${lang === 'ar' ? 'left-4' : 'right-4'}`}>
        <LanguageSwitcher isMobile={true} />
      </div>
      {/* Background patterns */}
      <div className="absolute inset-0 grid-scan-bg opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none" />
      {/* Fix #20 — blob position mirrors correctly in RTL */}
      <div className={`absolute top-[-100px] ${lang === 'ar' ? 'left-[-100px]' : 'right-[-100px]'} w-64 h-64 bg-gold opacity-10 blur-3xl rounded-full`} />

      <div className="w-full max-w-sm mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-gold"
            style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '4px' }}
          >
            DeutAI
          </h1>
          <p className="system-subtitle mt-2" style={{ fontSize: '10px' }}>
            {t('auth.loginSystem')}
          </p>
        </div>

        <div className="auth-card p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
