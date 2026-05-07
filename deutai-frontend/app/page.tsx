'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const FEATURES_DE = [
  {
    icon: '⚡',
    title: 'Sofortanalyse',
    desc: 'Erkennung aller Grammatikfehler in Echtzeit durch eine Kette von KI-Anbietern (Groq, Gemini, OpenAI).',
    color: '#C9A227',
  },
  {
    icon: '🔬',
    title: '27 Fehlertypen',
    desc: 'Vollständige Taxonomie: Konjugation, Deklination, Wortstellung, trennbare Verben, Infinitiv + zu und vieles mehr.',
    color: '#55C4E0',
  },
  {
    icon: '🃏',
    title: 'Automatische Lernkarten',
    desc: 'Jeder Fehler erzeugt automatisch eine Lernkarte mit Korrektur, Regel und natürlichen Varianten.',
    color: '#4AB870',
  },
  {
    icon: '📊',
    title: 'Persönliche Statistiken',
    desc: 'Verfolgen Sie Ihren Fortschritt über 30 Tage und identifizieren Sie Ihre häufigsten Fehler.',
    color: '#B95DE0',
  },
  {
    icon: '📷',
    title: 'Bildanalyse',
    desc: 'Fotografieren Sie Ihren handgeschriebenen Text – die KI extrahiert und analysiert den Inhalt direkt.',
    color: '#E09955',
  },
  {
    icon: '📚',
    title: 'Gezielte Übungen',
    desc: 'Zwei pädagogische Übungen werden für jede Analyse generiert, angepasst an Niveau A2–B2.',
    color: '#E05252',
  },
];

const HOW_IT_WORKS_DE = [
  { step: '01', title: 'Eingeben oder fotografieren', desc: 'Geben Sie einen deutschen Satz ein oder fotografieren Sie Ihr Notizheft.' },
  { step: '02', title: 'KI analysiert', desc: 'Unser Ensemble von Modellen erkennt jeden Fehler mit Regel, Erklärung und Schweregrad.' },
  { step: '03', title: 'Einprägen', desc: 'Lernkarten werden automatisch erstellt, um jede Korrektur im Langzeitgedächtnis zu verankern.' },
];

const FEATURES_AR = [
  { icon: '⚡', title: 'تحليل فوري', desc: 'اكتشاف الأخطاء النحوية مباشرة عبر سلسلة مزودي الذكاء الاصطناعي.', color: '#C9A227' },
  { icon: '🔬', title: '27 نوعا من الأخطاء', desc: 'تصنيف شامل: التصريف، الإعراب، ترتيب الكلمات، والأفعال المنفصلة وغيرها.', color: '#55C4E0' },
  { icon: '🃏', title: 'بطاقات مراجعة تلقائية', desc: 'كل خطأ ينتج بطاقة مراجعة مع التصحيح والقاعدة وصياغات طبيعية.', color: '#4AB870' },
  { icon: '📊', title: 'إحصاءات شخصية', desc: 'تابع تقدمك خلال 30 يوما وحدد أخطاءك الأكثر تكرارا.', color: '#B95DE0' },
  { icon: '📷', title: 'تحليل الصور', desc: 'صوّر نصك المكتوب بخط اليد ليتم استخراجه وتحليله تلقائيا.', color: '#E09955' },
  { icon: '📚', title: 'تمارين موجهة', desc: 'يتم إنشاء تمرينين تعليميين لكل تحليل بما يناسب مستوى A2-B2.', color: '#E05252' },
];

const HOW_IT_WORKS_AR = [
  { step: '01', title: 'اكتب أو صوّر النص', desc: 'أدخل جملة بالألمانية أو التقط صورة لدفترك.' },
  { step: '02', title: 'الذكاء الاصطناعي يحلل', desc: 'تكتشف النماذج كل خطأ مع القاعدة والشرح ومستوى الخطورة.' },
  { step: '03', title: 'ثبّت المعلومة', desc: 'تُنشأ بطاقات مراجعة تلقائيا لترسيخ كل تصحيح في الذاكرة طويلة المدى.' },
];

export default function RootPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const localizedFeatures = lang === 'ar' ? FEATURES_AR : FEATURES_DE;
  const localizedHowItWorks = lang === 'ar' ? HOW_IT_WORKS_AR : HOW_IT_WORKS_DE;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Fix #2 — validate expiry, not just presence, to avoid redirect loops
      try {
        const { exp } = JSON.parse(atob(token.split('.')[1]));
        if (!exp || exp * 1000 > Date.now()) {
          router.replace('/analyze');
          return;
        }
      } catch { /* malformed token — fall through */ }
      localStorage.removeItem('access_token');
    }
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#080809] flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-[#C9A227]/20"
          style={{ animation: 'spin-slow 1s linear infinite', borderTopColor: '#C9A227' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080809] text-[#E0E0E0] overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        .lp-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 52px 52px;
        }

        .lp-blob {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, #C9A22718 0%, transparent 70%);
          filter: blur(80px); pointer-events: none;
        }

        .lp-feat-card {
          background: #111113;
          border: 1px solid #1e1e26;
          border-radius: 20px;
          padding: 28px 24px;
          display: flex; flex-direction: column; gap: 12px;
          position: relative; overflow: hidden;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .lp-feat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        }

        .lp-step {
          display: flex; gap: 20px; align-items: flex-start;
          padding: 24px;
          border-radius: 16px;
          background: #111113;
          border: 1px solid #1a1a22;
          position: relative; overflow: hidden;
        }
        .lp-step::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, #C9A22780, transparent);
        }

        .lp-cta-primary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 14px 36px;
          border-radius: 14px;
          background: #C9A227;
          color: #080809;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; font-weight: 600;
          letter-spacing: 1px;
          box-shadow: 0 4px 24px rgba(201,162,39,0.35);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          text-decoration: none;
        }
        .lp-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(201,162,39,0.45);
          background: #d4af37;
        }
        .lp-cta-primary:active { transform: scale(0.97); }

        .lp-cta-secondary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 13px 36px;
          border-radius: 14px;
          background: transparent;
          color: #C9A227;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; font-weight: 500;
          letter-spacing: 1px;
          border: 1.5px solid #C9A22740;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          text-decoration: none;
        }
        .lp-cta-secondary:hover {
          border-color: #C9A227;
          background: #C9A22710;
          transform: translateY(-2px);
        }

        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          height: 60px;
          background: rgba(8,8,9,0.85);
          backdrop-filter: blur(20px) saturate(1.5);
          border-bottom: 1px solid #13131a;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
        }
        .lp-nav-right { display: flex; gap: 12px; align-items: center; }
        .lp-nav-left { display: flex; align-items: center; gap: 10px; }

        .lp-stat {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 28px 24px;
          border-radius: 20px;
          background: #111113;
          border: 1px solid #1e1e26;
          flex: 1; min-width: 140px;
        }

        .lp-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; letter-spacing: 4px;
          text-transform: uppercase; color: #C9A22780;
          margin-bottom: 12px;
        }
        .lp-section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 500; color: #e8e8f0;
          line-height: 1.25; margin: 0;
        }
        .lp-section-title em { color: #C9A227; font-style: italic; }

        @keyframes hero-rise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Fix #1 — spin-slow was referenced but never defined */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .hero-1 { animation: hero-rise 0.7s ease both; }
        /* Fix #4 — hero-2 was dead; now used for h1. subtitle gets hero-3. */
        .hero-2 { animation: hero-rise 0.7s ease 0.15s both; }
        .hero-3 { animation: hero-rise 0.7s ease 0.30s both; }
        .hero-4 { animation: hero-rise 0.7s ease 0.45s both; }

        .lp-divider {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, #1e1e2a, transparent);
          margin: 80px 0;
        }
      `}</style>

      {/* ── Grid texture ── */}
      <div className="lp-grid" />

      {/* ── Nav ── */}
      <nav className="lp-nav" style={{ flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
        <div className="lp-nav-left">
          <Image src="/deutai-pen-logo.png" alt="DeutAI" width={28} height={28} style={{ objectFit: 'contain' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600, color: '#C9A227', letterSpacing: '3px' }}>
            DEUTAI
          </span>
        </div>
        <div className="lp-nav-right">
          <LanguageSwitcher isMobile={true} />
          <Link href="/login" className="lp-cta-secondary" style={{ padding: '8px 24px', fontSize: '14px' }}>
            {t('nav.login')}
          </Link>
          <Link href="/register" className="lp-cta-primary" style={{ padding: '8px 24px', fontSize: '14px' }}>
            {t('nav.start')}
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', paddingTop: '80px', paddingBottom: '60px',
        overflow: 'hidden',
      }}>
        <div className="lp-blob" style={{ width: '700px', height: '700px', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: lang === 'ar' ? 'right' : 'center', maxWidth: '720px', padding: '0 24px' }}>
          <div className="hero-1" style={{ marginBottom: '36px', filter: 'drop-shadow(0 0 60px rgba(201,162,39,0.3))' }}>
            <Image src="/deutai-pen-logo.png" alt="DeutAI" width={190} height={190} style={{ objectFit: 'contain' }} priority />
          </div>

          <h1 className="hero-2" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 8vw, 72px)',
            fontWeight: 700, lineHeight: 1.1,
            color: '#e8e8f0', margin: '0 0 20px',
          }}>
            {t('landing.heroTitle1')}<br />
            <em style={{ color: '#C9A227', fontStyle: 'italic', fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.01em' }}>{t('landing.heroTitle2')}</em>
          </h1>

          <p className="hero-3" style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 'clamp(16px, 2vw, 18px)',
            color: '#8a8aa0', lineHeight: 1.8,
            margin: '0 0 44px', maxWidth: '600px',
            fontWeight: 400,
          }}>
            {t('landing.heroSub')}
          </p>

          <div className="hero-4" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/register" className="lp-cta-primary">
              {t('landing.startFree')}
            </Link>
            <Link href="/login" className="lp-cta-secondary">
              {t('landing.signIn')}
            </Link>
          </div>
        </div>

        {/* scroll hint */}
        <div style={{
          position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          animation: 'hero-rise 1s ease 1s both',
        }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#303038', letterSpacing: '3px' }}>{t('landing.scroll')}</span>
          <div style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, #303038, transparent)' }} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px', maxWidth: '1040px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px', letterSpacing: '5px',
            textTransform: 'uppercase', color: '#C9A22799',
            marginBottom: '16px',
          }}>{t('landing.features')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 600, color: '#e8e8f0',
            lineHeight: 1.2, margin: 0,
          }}>{t('landing.featuresTitle1')}<br /><em style={{ color: '#C9A227', fontStyle: 'italic', fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.01em' }}>{t('landing.featuresTitle2')}</em></h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {localizedFeatures.map((f) => (
            <div
              key={f.title}
              className="lp-feat-card"
              onMouseEnter={e => (e.currentTarget.style.borderColor = f.color + '40')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e26')}
            >
              <div style={{
                position: 'absolute', top: 0, left: 20, right: 20, height: '2px',
                background: `linear-gradient(90deg, transparent, ${f.color}60, transparent)`,
                borderRadius: '0 0 2px 2px',
              }} />
              <div style={{ fontSize: '30px', lineHeight: 1, marginBottom: '4px' }}>{f.icon}</div>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '20px', fontWeight: 600, color: '#d8d8e8',
                margin: 0, letterSpacing: '-0.2px',
              }}>
                {f.title}
              </h3>
              <p style={{
                fontFamily: 'var(--font-inter), sans-serif',
                fontSize: '16px',
                color: '#8a8a9c', lineHeight: 1.7, margin: 0,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── HOW IT WORKS ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px', letterSpacing: '5px',
            textTransform: 'uppercase', color: '#C9A22799',
            marginBottom: '16px',
          }}>{t('landing.process')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 600, color: '#e8e8f0',
            lineHeight: 1.2, margin: 0,
          }}>{t('landing.processTitle1')}<br /><em style={{ color: '#C9A227', fontStyle: 'italic', fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.01em' }}>{t('landing.processTitle2')}</em></h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {localizedHowItWorks.map((h) => (
            <div key={h.step} className="lp-step">
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '36px', fontWeight: 700,
                color: '#C9A22720', lineHeight: 1, flexShrink: 0,
                width: '52px', textAlign: 'right',
              }}>
                {h.step}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h3 style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
                  fontWeight: 600, color: '#b0b0c0', letterSpacing: '2px',
                  textTransform: 'uppercase', margin: 0,
                }}>
                  {h.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-inter), sans-serif', fontSize: '17px',
                  color: '#7a7a8c', lineHeight: 1.7, margin: 0,
                }}>
                  {h.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── CTA BANNER ── */}
      <section style={{
        position: 'relative', zIndex: 1, padding: '0 24px 100px',
        maxWidth: '760px', margin: '0 auto', textAlign: 'center',
      }}>
        <div style={{
          padding: '52px 40px',
          borderRadius: '28px',
          background: '#111113',
          border: '1px solid #1e1e26',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.08) 0%, transparent 65%)',
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 40, right: 40, height: '2px',
            background: 'linear-gradient(90deg, transparent, #C9A227, transparent)',
          }} />

          <p className="lp-section-label">{t('landing.ready')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(26px, 5vw, 38px)',
            fontWeight: 600, color: '#e8e8f0',
            lineHeight: 1.3, margin: '0 0 16px',
          }}>
            {t('landing.ctaTitle1')}<br /><em style={{ color: '#C9A227', fontStyle: 'italic', fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.01em' }}>{t('landing.ctaTitle2')}</em>
          </h2>
          <p style={{
            fontFamily: 'var(--font-inter), sans-serif', fontSize: '18px',
            color: '#8a8aa0', lineHeight: 1.7, margin: '0 0 36px',
          }}>
            {t('landing.ctaSub')}
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="lp-cta-primary">
              {t('landing.createFreeAccount')}
            </Link>
            <Link href="/login" className="lp-cta-secondary">
              {t('landing.haveAccount')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid #1a1a22',
        padding: '36px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        maxWidth: '1040px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image src="/deutai-pen-logo.png" alt="DeutAI" width={32} height={32} style={{ objectFit: 'contain', opacity: 0.7 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 600, color: '#C9A227', letterSpacing: '1px' }}>
              DeutAI
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#48485a', letterSpacing: '3px' }}>
              {t('app.deutaiSystem404')}
            </span>
          </div>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#3a3a4a', letterSpacing: '3px' }}>
          {t('app.poweredByAi')}
        </span>
      </footer>
    </div>
  );
}
