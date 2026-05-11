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
  const { t, lang } = useLanguage() as { t: (key: string, params?: any) => string, lang: string };
  const [checkingAuth, setCheckingAuth] = useState(true);

  const localizedFeatures = lang === 'ar' ? FEATURES_AR : FEATURES_DE;
  const localizedHowItWorks = lang === 'ar' ? HOW_IT_WORKS_AR : HOW_IT_WORKS_DE;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Fix #2 — validate expiry, not just presence, to avoid redirect loops
      try {
        let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const pad = base64.length % 4;
        if (pad) base64 += new Array(5 - pad).join('=');
        const { exp } = JSON.parse(atob(base64));
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

        *, *::before, *::after { box-sizing: border-box; }

        .lp-blob {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, #C9A22718 0%, transparent 70%);
          filter: blur(80px); pointer-events: none;
        }

        /* ── Nav ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          height: 60px;
          background: rgba(8,8,9,0.9);
          backdrop-filter: blur(20px) saturate(1.5);
          border-bottom: 1px solid #13131a;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
        }
        .lp-nav-left { display: flex; align-items: center; gap: 8px; }
        .lp-nav-brand { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: #C9A227; letter-spacing: 3px; }
        .lp-nav-right { display: flex; gap: 8px; align-items: center; }

        /* ── Buttons ── */
        .lp-cta-primary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 14px 36px; border-radius: 14px;
          background: #C9A227; color: #080809;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; font-weight: 600; letter-spacing: 1px;
          box-shadow: 0 4px 24px rgba(201,162,39,0.35);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          text-decoration: none; white-space: nowrap;
        }
        .lp-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(201,162,39,0.45); background: #d4af37; }
        .lp-cta-primary:active { transform: scale(0.97); }

        .lp-cta-secondary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 13px 36px; border-radius: 14px;
          background: transparent; color: #C9A227;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; font-weight: 500; letter-spacing: 1px;
          border: 1.5px solid #C9A22740;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          text-decoration: none; white-space: nowrap;
        }
        .lp-cta-secondary:hover { border-color: #C9A227; background: #C9A22710; transform: translateY(-2px); }

        /* ── Feature cards ── */
        .lp-feat-card {
          background: #111113; border: 1px solid #1e1e26; border-radius: 20px;
          padding: 28px 24px; display: flex; flex-direction: column; gap: 12px;
          position: relative; overflow: hidden;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .lp-feat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.5); }

        .lp-feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        /* ── Steps ── */
        .lp-step {
          display: flex; gap: 20px; align-items: flex-start;
          padding: 24px; border-radius: 16px;
          background: #111113; border: 1px solid #1a1a22;
          position: relative; overflow: hidden;
        }
        .lp-step::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, #C9A22780, transparent);
        }

        /* ── Stat card ── */
        .lp-stat {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 28px 24px; border-radius: 20px;
          background: #111113; border: 1px solid #1e1e26;
          flex: 1; min-width: 120px;
        }

        /* ── Section labels / titles ── */
        .lp-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; letter-spacing: 4px;
          text-transform: uppercase; color: #C9A22780; margin-bottom: 12px;
        }
        .lp-section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 500; color: #e8e8f0; line-height: 1.25; margin: 0;
        }
        .lp-section-title em { color: #C9A227; font-style: italic; }

        /* ── CTA banner ── */
        .lp-cta-banner {
          padding: 52px 40px; border-radius: 28px;
          background: #111113; border: 1px solid #1e1e26;
          position: relative; overflow: hidden;
          text-align: center;
        }

        /* ── Hero CTA row ── */
        .hero-cta-row {
          display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;
        }

        /* ── Footer ── */
        .lp-footer {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          padding: 36px 28px;
          max-width: 1040px; margin: 0 auto;
          border-top: 1px solid #1a1a22;
        }
        .lp-footer-brand { display: flex; align-items: center; gap: 14px; }

        /* ── Section padding ── */
        .lp-section { padding: 0 24px 80px; }
        @media (max-width: 640px) {
          .lp-section { padding: 0 16px 56px; }
          .lp-section-header { margin-bottom: 36px !important; }
          .lp-step-num { font-size: 26px !important; width: 40px !important; }
        }

        /* ── Divider ── */
        .lp-divider {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, #1e1e2a, transparent);
          margin: 80px 0;
        }

        /* ── Hero logo ── */
        .hero-logo { width: 380px; height: 380px; }
        @media (max-width: 640px) {
          .hero-logo { width: 240px; height: 240px; }
          .hero-section { padding-top: 72px !important; padding-bottom: 40px !important; }
        }

        /* ── Animations ── */
        @keyframes hero-rise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .hero-1 { animation: hero-rise 0.7s ease both; }
        .hero-2 { animation: hero-rise 0.7s ease 0.15s both; }
        .hero-3 { animation: hero-rise 0.7s ease 0.30s both; }
        .hero-4 { animation: hero-rise 0.7s ease 0.45s both; }

        /* ══════════════════════════════════════
           RESPONSIVE BREAKPOINTS
        ══════════════════════════════════════ */

        /* Tablet: ≤ 900px */
        @media (max-width: 900px) {
          .lp-feat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .lp-cta-banner { padding: 40px 28px; }
        }

        /* Mobile: ≤ 640px */
        @media (max-width: 640px) {
          .lp-nav { padding: 0 14px; height: 56px; }
          .lp-nav-brand { display: none; }

          .lp-feat-grid {
            grid-template-columns: 1fr;
          }

          .hero-cta-row {
            flex-direction: column; align-items: stretch;
            gap: 10px; width: 100%;
          }
          .hero-cta-row .lp-cta-primary,
          .hero-cta-row .lp-cta-secondary {
            padding: 14px 20px; width: 100%; text-align: center;
          }

          .lp-cta-banner { padding: 32px 20px; border-radius: 20px; }
          .lp-cta-banner .hero-cta-row { margin-top: 4px; }

          .lp-divider { margin: 48px 0; }

          .lp-step { padding: 18px; gap: 14px; }

          .lp-footer {
            flex-direction: column; align-items: flex-start;
            padding: 28px 20px; gap: 20px;
          }

          .lp-stat { padding: 20px 16px; min-width: 90px; }

          .lp-feat-card { padding: 22px 18px; }

          /* Hide nav register btn on very small screens, keep login */
          .lp-nav-register { display: none; }
        }

        /* Very small: ≤ 400px */
        @media (max-width: 400px) {
          .lp-nav-right { gap: 6px; }
          .lp-cta-secondary { padding: 8px 14px; font-size: 12px; }
        }
      `}</style>



      {/* ── Nav ── */}
      <nav className="lp-nav" style={{ flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
        <div className="lp-nav-left">
          <Image src="/hero-image.png" alt="DeutAI" width={45} height={45} style={{ objectFit: 'contain' }} />
          <span className="lp-nav-brand">
            DEUTAI
          </span>
        </div>
        <div className="lp-nav-right">
          <LanguageSwitcher isMobile={true} />
          <Link href="/login" className="lp-cta-secondary" style={{ padding: '8px 24px', fontSize: '14px' }}>
            {t('nav.login')}
          </Link>
          <Link href="/register" className="lp-cta-primary lp-nav-register" style={{ padding: '8px 24px', fontSize: '14px' }}>
            {t('nav.start')}
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section" style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', paddingTop: '80px', paddingBottom: '60px',
        overflow: 'hidden',
      }}>
        <div className="lp-blob" style={{ width: '700px', height: '700px', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: lang === 'ar' ? 'right' : 'center', maxWidth: '720px', padding: '0 24px' }}>
          {/* marginBottom reduced from 28px → 12px; logo size reduced from 400px → 280px */}
          <div className="hero-1" style={{ marginBottom: '12px', filter: 'drop-shadow(0 0 60px rgba(201,162,39,0.3))' }}>
            <Image src="/hero-image.png" className="hero-logo" alt="DeutAI" width={380} height={380} style={{ objectFit: 'contain' }} priority />
          </div>

          {/* margin-bottom reduced from 20px → 16px */}
          <h1 className="hero-2" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 8vw, 72px)',
            fontWeight: 700, lineHeight: 1.1,
            color: '#e8e8f0', margin: '0 0 16px',
          }}>
            {t('landing.heroTitle1')}<br />
            <em style={{ color: '#C9A227', fontStyle: 'italic', fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.01em' }}>{t('landing.heroTitle2')}</em>
          </h1>

          {/* margin-bottom reduced from 44px → 36px */}
          <p className="hero-3" style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 'clamp(16px, 2vw, 18px)',
            color: '#8a8aa0', lineHeight: 1.8,
            margin: '0 0 36px', maxWidth: '600px',
            fontWeight: 400,
          }}>
            {t('landing.heroSub')}
          </p>

          <div className="hero-4 hero-cta-row">
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
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#303038', letterSpacing: '3px' }}>{t('landing.scroll')}</span>
          <div style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, #303038, transparent)' }} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section" style={{ position: 'relative', zIndex: 1, maxWidth: '1040px', margin: '0 auto' }}>
        <div className="lp-section-header" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '15px', letterSpacing: '5px',
            textTransform: 'uppercase', color: '#C9A227cc',
            marginBottom: '20px',
          }}>{t('landing.features')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(40px, 7vw, 64px)',
            fontWeight: 700, color: '#f0f0fa',
            lineHeight: 1.15, margin: 0,
          }}>{t('landing.featuresTitle1')}<br /><em style={{ color: '#C9A227', fontStyle: 'italic', fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.01em' }}>{t('landing.featuresTitle2')}</em></h2>
        </div>

        <div className="lp-feat-grid">
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
      <section className="lp-section" style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto' }}>
        <div className="lp-section-header" style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '15px', letterSpacing: '5px',
            textTransform: 'uppercase', color: '#C9A227cc',
            marginBottom: '20px',
          }}>{t('landing.process')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(40px, 7vw, 64px)',
            fontWeight: 700, color: '#f0f0fa',
            lineHeight: 1.15, margin: 0,
          }}>{t('landing.processTitle1')}<br /><em style={{ color: '#C9A227', fontStyle: 'italic', fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.01em' }}>{t('landing.processTitle2')}</em></h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {localizedHowItWorks.map((h) => (
            <div key={h.step} className="lp-step">
              <div className="lp-step-num" style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '36px', fontWeight: 700,
                color: '#C9A22720', lineHeight: 1, flexShrink: 0,
                width: '52px', textAlign: 'right',
              }}>
                {h.step}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '22px', fontWeight: 700,
                  color: '#e0e0f0', margin: 0, lineHeight: 1.3,
                }}>
                  {h.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-inter), sans-serif', fontSize: '17px',
                  color: '#8a8a9c', lineHeight: 1.75, margin: 0,
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
      <section className="lp-section" style={{
        position: 'relative', zIndex: 1, paddingBottom: '100px',
        maxWidth: '760px', margin: '0 auto', textAlign: 'center',
      }}>
        <div className="lp-cta-banner">
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(201,162,39,0.08) 0%, transparent 65%)',
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 40, right: 40, height: '2px',
            background: 'linear-gradient(90deg, transparent, #C9A227, transparent)',
          }} />

          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '15px', letterSpacing: '5px',
            textTransform: 'uppercase', color: '#C9A227cc',
            marginBottom: '20px',
          }}>{t('landing.ready')}</p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(30px, 6vw, 48px)',
            fontWeight: 700, color: '#f0f0fa',
            lineHeight: 1.25, margin: '0 0 20px',
          }}>
            {t('landing.ctaTitle1')}<br /><em style={{ color: '#C9A227', fontStyle: 'italic', fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '-0.01em' }}>{t('landing.ctaTitle2')}</em>
          </h2>
          <p style={{
            fontFamily: 'var(--font-inter), sans-serif', fontSize: '18px',
            color: '#8a8aa0', lineHeight: 1.7, margin: '0 0 36px',
          }}>
            {t('landing.ctaSub')}
          </p>

          <div className="hero-cta-row">
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
      <footer className="lp-footer" style={{ position: 'relative', zIndex: 1 }}>
        <div className="lp-footer-brand">
          <Image src="/hero-image.png" alt="DeutAI" width={48} height={48} style={{ objectFit: 'contain' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 600, color: '#C9A227', letterSpacing: '1px' }}>
              DeutAI
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#48485a', letterSpacing: '3px' }}>
              {t('app.deutaiSystem404')}
            </span>
          </div>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '15px', color: '#3a3a4a', letterSpacing: '3px' }}>
          {t('app.poweredByAi')}
        </span>
      </footer>
    </div>
  );
}