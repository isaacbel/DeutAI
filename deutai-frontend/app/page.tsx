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

const DEMO_EXAMPLES = {
  de: [
    {
      original: "Gestern ich habe Deutsch gelernen.",
      corrected: "Gestern habe ich Deutsch gelernt.",
      errorType: "Wortstellung & Partizip II",
      explanation: "Das Verb 'habe' muss an Position 2 stehen (Inversion nach Adverb). Das Partizip II von 'lernen' ist 'gelernt'.",
      badge: "Grammatikfehler",
    },
    {
      original: "Weil ich bin müde, ich gehe schlafen.",
      corrected: "Weil ich müde bin, gehe ich schlafen.",
      errorType: "Nebensatz-Wortstellung",
      explanation: "In Nebensätzen mit 'weil' steht das konjugierte Verb 'bin' am Ende des Satzes. Der Hauptsatz beginnt mit Inversion.",
      badge: "Syntaxfehler",
    },
    {
      original: "Er hat ein großes Haus gekaufte.",
      corrected: "Er hat ein großes Haus gekauft.",
      errorType: "Verbkonjugation",
      explanation: "Das Partizip II endet bei regelmäßigen Verben auf '-t', nicht '-te' (gekauft).",
      badge: "Konjugation",
    }
  ],
  ar: [
    {
      original: "Gestern ich habe Deutsch gelernen.",
      corrected: "Gestern habe ich Deutsch gelernt.",
      errorType: "ترتيب الكلمات وتصريف الفعل",
      explanation: "يجب أن يكون الفعل المساعد 'habe' في الموقع الثاني للجملة (بعد ظرف الزمان). التصريف الصحيح هو 'gelernt'.",
      badge: "خطأ قواعدي",
    },
    {
      original: "Weil ich bin müde, ich gehe schlafen.",
      corrected: "Weil ich müde bin, gehe ich schlafen.",
      errorType: "ترتيب الجملة الفرعية",
      explanation: "في الجمل الفرعية التي تبدأ بـ 'weil'، يوضع الفعل المصرف 'bin' في نهاية الجملة تماماً.",
      badge: "تركيب الجملة",
    },
    {
      original: "Er hat ein großes Haus gekaufte.",
      corrected: "Er hat ein großes Haus gekauft.",
      errorType: "تصريف الفعل",
      explanation: "ينتهي اسم المفعول للأفعال القياسية بحرف '-t' وليس '-te' (gekauft).",
      badge: "تصريف الفعل",
    }
  ]
};

export default function RootPage() {
  const router = useRouter();
  const { t, lang } = useLanguage() as { t: (key: string, params?: any) => string, lang: string };
  const [checkingAuth, setCheckingAuth] = useState(true);

  const localizedFeatures = lang === 'ar' ? FEATURES_AR : FEATURES_DE;
  const localizedHowItWorks = lang === 'ar' ? HOW_IT_WORKS_AR : HOW_IT_WORKS_DE;

  const [demoIndex, setDemoIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [showCorrection, setShowCorrection] = useState(true);

  const triggerDemo = (index: number) => {
    setDemoIndex(index);
    setIsScanning(true);
    setShowCorrection(false);
    setTimeout(() => {
      setIsScanning(false);
      setShowCorrection(true);
    }, 900);
  };

  const tabStyle = (active: boolean) => ({
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: active ? 'bold' : 'normal',
    color: active ? 'white' : 'var(--color-text-secondary)',
    background: active ? 'var(--color-primary)' : 'transparent',
    border: active ? '1px solid var(--color-primary)' : '1px solid transparent',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    outline: 'none',
  });

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
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-primary/20"
          style={{ animation: 'spin-slow 1s linear infinite', borderTopColor: 'var(--color-primary)' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main text-text-primary overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .lp-blob {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, rgba(156,123,172,0.12) 0%, transparent 70%);
          filter: blur(80px); pointer-events: none;
        }

        /* ── Nav ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          height: 60px;
          background: rgba(242,248,252,0.9);
          backdrop-filter: blur(20px) saturate(1.5);
          border-bottom: 1px solid var(--color-border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
        }
        .lp-nav-left { display: flex; align-items: center; gap: 8px; }
        .lp-nav-brand { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: var(--color-primary); letter-spacing: 3px; }
        .lp-nav-right { display: flex; gap: 8px; align-items: center; }

        /* ── Buttons ── */
        .lp-cta-primary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 14px 36px; border-radius: 14px;
          background: var(--color-accent); color: white;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; font-weight: 600; letter-spacing: 1px;
          box-shadow: 0 4px 24px rgba(255,127,45,0.25);
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          text-decoration: none; white-space: nowrap;
        }
        .lp-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(255,127,45,0.35); background: var(--color-primary); color: white; }
        .lp-cta-primary:active { transform: scale(0.97); }

        .lp-cta-secondary {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 13px 36px; border-radius: 14px;
          background: transparent; color: var(--color-primary);
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; font-weight: 500; letter-spacing: 1px;
          border: 1.5px solid rgba(156,123,172,0.4);
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          text-decoration: none; white-space: nowrap;
        }
        .lp-cta-secondary:hover { border-color: var(--color-primary); background: rgba(156,123,172,0.06); transform: translateY(-2px); }

        /* ── Feature cards ── */
        .lp-feat-card {
          background: var(--color-bg-sidebar); border: 1px solid var(--color-border); border-radius: 20px;
          padding: 28px 24px; display: flex; flex-direction: column; gap: 12px;
          position: relative; overflow: hidden;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .lp-feat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(156,123,172,0.12); }

        .lp-feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        /* ── Steps ── */
        .lp-step {
          display: flex; gap: 20px; align-items: flex-start;
          padding: 24px; border-radius: 16px;
          background: var(--color-bg-sidebar); border: 1px solid var(--color-border);
          position: relative; overflow: hidden;
        }
        .lp-step::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, var(--color-primary), transparent);
        }

        /* ── Stat card ── */
        .lp-stat {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 28px 24px; border-radius: 20px;
          background: var(--color-bg-sidebar); border: 1px solid var(--color-border);
          flex: 1; min-width: 120px;
        }

        /* ── Section labels / titles ── */
        .lp-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px; letter-spacing: 4px;
          text-transform: uppercase; color: var(--color-primary); opacity: 0.8; margin-bottom: 12px;
        }
        .lp-section-title {
          font-family: 'Inter', sans-serif;
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 500; color: var(--color-text-primary); line-height: 1.25; margin: 0;
        }
        .lp-section-title em { color: var(--color-accent); font-style: italic; }

        /* ── CTA banner ── */
        .lp-cta-banner {
          padding: 52px 40px; border-radius: 28px;
          background: var(--color-bg-warm); border: 1px solid var(--color-border);
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
          border-top: 1px solid var(--color-border);
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
          background: linear-gradient(90deg, transparent, var(--color-border), transparent);
          margin: 80px 0;
        }

        /* ── Hero logo ── */
        .hero-logo { width: 520px; height: 520px; }
        @media (max-width: 640px) {
          .hero-logo { width: 320px; height: 320px; }
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

        @keyframes scanLineDemo {
          0% { top: 0%; opacity: 0.1; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0.1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Floating orbit icons ── */
        @keyframes float-a {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%     { transform: translateY(-14px) rotate(6deg); }
          66%     { transform: translateY(8px) rotate(-4deg); }
        }
        @keyframes float-b {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          40%     { transform: translateY(12px) rotate(-8deg); }
          70%     { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-c {
          0%,100% { transform: translateY(0px) scale(1); }
          50%     { transform: translateY(-16px) scale(1.08); }
        }
        @keyframes float-pulse {
          0%,100% { opacity: 0.75; transform: scale(1); }
          50%     { opacity: 1; transform: scale(1.12); }
        }
        .orbit-icon {
          position: absolute;
          display: flex; align-items: center; justify-content: center;
          border-radius: 16px;
          backdrop-filter: blur(8px);
          pointer-events: none;
          z-index: 2;
        }
        @media (max-width: 640px) { .orbit-icon { display: none; } }

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
        background: 'var(--color-bg-main)',
      }}>
        <div className="lp-blob" style={{ width: '700px', height: '700px', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

        {/* ── Floating orbit icons ── */}
        {/* Top-left: Brain / AI */}
        <div className="orbit-icon" style={{
          top: 'calc(50% - 230px)', left: 'calc(50% - 310px)',
          width: '64px', height: '64px',
          background: 'rgba(156,123,172,0.1)', border: '1px solid rgba(156,123,172,0.2)',
          animation: 'float-a 5.2s ease-in-out infinite',
          fontSize: '28px',
        }}>🧠</div>

        {/* Top-right: Globe */}
        <div className="orbit-icon" style={{
          top: 'calc(50% - 260px)', left: 'calc(50% + 240px)',
          width: '58px', height: '58px',
          background: 'rgba(76,177,255,0.1)', border: '1px solid rgba(76,177,255,0.2)',
          animation: 'float-b 6.1s ease-in-out infinite',
          fontSize: '24px',
        }}>🌍</div>

        {/* Right: Flashcard */}
        <div className="orbit-icon" style={{
          top: 'calc(50% - 30px)', left: 'calc(50% + 300px)',
          width: '68px', height: '68px',
          background: 'rgba(74,184,112,0.1)', border: '1px solid rgba(74,184,112,0.2)',
          animation: 'float-c 4.8s ease-in-out infinite 0.4s',
          fontSize: '28px',
        }}>🃏</div>

        {/* Bottom-right: Chart */}
        <div className="orbit-icon" style={{
          top: 'calc(50% + 180px)', left: 'calc(50% + 240px)',
          width: '56px', height: '56px',
          background: 'rgba(185,93,224,0.1)', border: '1px solid rgba(185,93,224,0.2)',
          animation: 'float-a 7s ease-in-out infinite 1s',
          fontSize: '22px',
        }}>📊</div>

        {/* Bottom-left: Camera */}
        <div className="orbit-icon" style={{
          top: 'calc(50% + 170px)', left: 'calc(50% - 300px)',
          width: '60px', height: '60px',
          background: 'rgba(224,153,85,0.1)', border: '1px solid rgba(224,153,85,0.2)',
          animation: 'float-b 5.6s ease-in-out infinite 0.8s',
          fontSize: '24px',
        }}>📷</div>

        {/* Left: Sparkle / AI correction */}
        <div className="orbit-icon" style={{
          top: 'calc(50% - 60px)', left: 'calc(50% - 320px)',
          width: '54px', height: '54px',
          background: 'rgba(255,127,45,0.1)', border: '1px solid rgba(255,127,45,0.2)',
          animation: 'float-pulse 4s ease-in-out infinite 0.3s',
          fontSize: '22px',
        }}>✨</div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: lang === 'ar' ? 'right' : 'center', maxWidth: '720px', padding: '0 24px' }}>
          {/* marginBottom reduced from 28px → 12px; logo size reduced from 400px → 280px */}
          <div className="hero-1" style={{ marginBottom: '12px', filter: 'drop-shadow(0 0 60px rgba(156,123,172,0.18))' }}>
            <Image src="/hero-image.png" className="hero-logo" alt="DeutAI" width={520} height={520} style={{ objectFit: 'contain' }} priority />
          </div>

          {/* margin-bottom reduced from 20px → 16px */}
          <h1 className="hero-2" style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(36px, 8vw, 72px)',
            fontWeight: 700, lineHeight: 1.1,
            color: 'var(--color-text-primary)', margin: '0 0 16px',
          }}>
            {t('landing.heroTitle1')}<br />
            <span style={{ color: 'var(--color-primary)', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}>{t('landing.heroTitle2')}</span>
          </h1>

          {/* margin-bottom reduced from 44px → 36px */}
          <p className="hero-3" style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: 'clamp(16px, 2vw, 18px)',
            color: 'var(--color-text-muted)', lineHeight: 1.8,
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

          {/* Interactive Demo Widget */}
          <div className="hero-4" style={{ marginTop: '48px', width: '100%', maxWidth: '640px', textAlign: 'left', animation: 'hero-rise 0.7s ease 0.6s both' }}>
            <div style={{
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(156, 123, 172, 0.08), 0 1px 3px rgba(156, 123, 172, 0.02)',
              position: 'relative'
            }}>
              {/* macOS Style Window header */}
              <div style={{
                background: 'var(--color-bg-sidebar)',
                padding: '12px 18px',
                borderBottom: '1px solid var(--color-rule-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: lang === 'ar' ? 'row-reverse' : 'row'
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                </div>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  {lang === 'ar' ? 'مختبر الذكاء الاصطناعي التفاعلي' : 'DEUTAI PLAYGROUND'}
                </span>
                <div style={{ width: '42px' }} />
              </div>

              {/* Tabs / Examples selection */}
              <div style={{
                padding: '16px',
                borderBottom: '1px solid var(--color-rule-border)',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                background: '#fafbfc'
              }}>
                {lang === 'ar' ? (
                  <>
                    <button onClick={() => triggerDemo(0)} style={tabStyle(demoIndex === 0)}>مثال ١: ترتيب الكلمات</button>
                    <button onClick={() => triggerDemo(1)} style={tabStyle(demoIndex === 1)}>مثال ٢: الجملة الفرعية</button>
                    <button onClick={() => triggerDemo(2)} style={tabStyle(demoIndex === 2)}>مثال ٣: اسم المفعول</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => triggerDemo(0)} style={tabStyle(demoIndex === 0)}>Beispiel 1: Wortstellung</button>
                    <button onClick={() => triggerDemo(1)} style={tabStyle(demoIndex === 1)}>Beispiel 2: Nebensatz</button>
                    <button onClick={() => triggerDemo(2)} style={tabStyle(demoIndex === 2)}>Beispiel 3: Partizip II</button>
                  </>
                )}
              </div>

              {/* Input Area */}
              <div style={{ padding: '24px', position: 'relative' }}>
                {/* Glowing scanline animation */}
                {isScanning && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, height: '4px',
                    background: 'linear-gradient(to right, transparent, var(--color-primary), transparent)',
                    boxShadow: '0 0 12px var(--color-primary), 0 0 20px var(--color-primary)',
                    animation: 'scanLineDemo 1.2s ease-in-out infinite',
                    zIndex: 10
                  }} />
                )}

                <div style={{ marginBottom: '16px', direction: 'ltr', textAlign: 'left' }}>
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '1px',
                    margin: '0 0 6px 0'
                  }}>
                    {lang === 'ar' ? 'النص الأصلي (مع أخطاء):' : 'Originaler Text (mit Fehlern):'}
                  </p>
                  <div style={{
                    background: '#fcf8f8',
                    border: '1px dashed #eed5d5',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    fontSize: '17px',
                    fontFamily: 'var(--font-sans), sans-serif',
                    color: '#c55'
                  }}>
                    {demoIndex === 0 && (
                      <span>Gestern <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>ich habe</span> Deutsch <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>gelernen</span>.</span>
                    )}
                    {demoIndex === 1 && (
                      <span>Weil <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>ich bin</span> müde, <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>ich gehe</span> schlafen.</span>
                    )}
                    {demoIndex === 2 && (
                      <span>Er hat ein großes Haus <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>gekaufte</span>.</span>
                    )}
                  </div>
                </div>

                {/* AI Correction Area */}
                {showCorrection && !isScanning && (
                  <div style={{
                    animation: 'fadeIn 0.4s ease-out',
                    border: '1px solid rgba(124, 176, 120, 0.25)',
                    background: 'rgba(124, 176, 120, 0.05)',
                    borderRadius: '12px',
                    padding: '18px',
                    direction: 'ltr',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: 'var(--color-success)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        background: 'rgba(124, 176, 120, 0.15)',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {DEMO_EXAMPLES[lang === 'ar' ? 'ar' : 'de'][demoIndex].badge}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
                        Confidence: 99%
                      </span>
                    </div>

                    <p style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#2a5a2a',
                      margin: '0 0 10px 0',
                      fontFamily: 'var(--font-sans), sans-serif'
                    }}>
                      {demoIndex === 0 && (
                        <span>Gestern <span style={{ color: 'var(--color-success)', borderBottom: '2px solid var(--color-success)' }}>habe ich</span> Deutsch <span style={{ color: 'var(--color-success)', borderBottom: '2px solid var(--color-success)' }}>gelernt</span>.</span>
                      )}
                      {demoIndex === 1 && (
                        <span>Weil ich müde <span style={{ color: 'var(--color-success)', borderBottom: '2px solid var(--color-success)' }}>bin</span>, <span style={{ color: 'var(--color-success)', borderBottom: '2px solid var(--color-success)' }}>gehe ich</span> schlafen.</span>
                      )}
                      {demoIndex === 2 && (
                        <span>Er hat ein großes Haus <span style={{ color: 'var(--color-success)', borderBottom: '2px solid var(--color-success)' }}>gekauft</span>.</span>
                      )}
                    </p>

                    <div style={{ borderTop: '1px solid rgba(124, 176, 120, 0.15)', paddingTop: '10px', direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                      <p style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--color-text-secondary)',
                        margin: '0 0 4px 0'
                      }}>
                        {lang === 'ar' ? 'شرح القاعدة:' : 'Regelerklärung:'}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: 'var(--color-text-muted)',
                        margin: 0,
                        lineHeight: 1.6
                      }}>
                        {DEMO_EXAMPLES[lang === 'ar' ? 'ar' : 'de'][demoIndex].explanation}
                      </p>
                    </div>
                  </div>
                )}

                {isScanning && (
                  <div style={{
                    height: '148px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    color: 'var(--color-primary)'
                  }}>
                    <div className="w-6 h-6 rounded-full border-2 border-primary/20" style={{ animation: 'spin-slow 0.8s linear infinite', borderTopColor: 'var(--color-primary)' }} />
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', letterSpacing: '2px', fontWeight: 600 }}>
                      {lang === 'ar' ? 'جاري الفحص بالذكاء الاصطناعي...' : 'KI-ANALYSE LÄUFT...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section" style={{ position: 'relative', zIndex: 1, maxWidth: '100%', padding: '80px 24px', background: 'var(--color-bg-success-tint)' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div className="lp-section-header" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '15px', letterSpacing: '5px',
              textTransform: 'uppercase', color: 'var(--color-primary)',
              opacity: 0.8,
              marginBottom: '20px',
            }}>{t('landing.features')}</p>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(40px, 7vw, 64px)',
              fontWeight: 700, color: 'var(--color-text-primary)',
              lineHeight: 1.15, margin: 0,
            }}>{t('landing.featuresTitle1')}<br /><span style={{ color: 'var(--color-primary)', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}>{t('landing.featuresTitle2')}</span></h2>
          </div>

          <div className="lp-feat-grid">
            {localizedFeatures.map((f) => (
              <div
                key={f.title}
                className="lp-feat-card"
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)' }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 20, right: 20, height: '2px',
                  background: `linear-gradient(90deg, transparent, var(--color-primary)60, transparent)`,
                  borderRadius: '0 0 2px 2px',
                }} />
                <div style={{ fontSize: '30px', lineHeight: 1, marginBottom: '4px' }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)',
                  margin: 0, letterSpacing: '-0.2px',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: '16px',
                  color: 'var(--color-text-muted)', lineHeight: 1.7, margin: 0,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="lp-divider" style={{ margin: 0 }} />

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section" style={{ position: 'relative', zIndex: 1, maxWidth: '100%', padding: '80px 24px', background: 'var(--color-bg-sidebar)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div className="lp-section-header" style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '15px', letterSpacing: '5px',
              textTransform: 'uppercase', color: 'var(--color-primary)',
              opacity: 0.8,
              marginBottom: '20px',
            }}>{t('landing.process')}</p>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(40px, 7vw, 64px)',
              fontWeight: 700, color: 'var(--color-text-primary)',
              lineHeight: 1.15, margin: 0,
            }}>{t('landing.processTitle1')}<br /><span style={{ color: 'var(--color-primary)', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}>{t('landing.processTitle2')}</span></h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {localizedHowItWorks.map((h) => (
              <div key={h.step} className="lp-step" style={{ background: 'var(--color-bg-main)', border: '1px solid var(--color-border)' }}>
                <div className="lp-step-num" style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '36px', fontWeight: 700,
                  color: 'rgba(156, 123, 172, 0.2)', lineHeight: 1, flexShrink: 0,
                  width: '52px', textAlign: 'right',
                }}>
                  {h.step}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h3 style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '22px', fontWeight: 700,
                    color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.3,
                  }}>
                    {h.title}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-inter), sans-serif', fontSize: '17px',
                    color: 'var(--color-text-muted)', lineHeight: 1.75, margin: 0,
                  }}>
                    {h.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="lp-divider" style={{ margin: 0 }} />

      {/* ── CTA BANNER ── */}
      <section className="lp-section" style={{
        position: 'relative', zIndex: 1, padding: '100px 24px',
        maxWidth: '100%', textAlign: 'center', background: 'var(--color-bg-main)',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div className="lp-cta-banner">
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 0%, rgba(156,123,172,0.08) 0%, transparent 65%)',
            }} />
            <div style={{
              position: 'absolute', top: 0, left: 40, right: 40, height: '2px',
              background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
            }} />

            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '15px', letterSpacing: '5px',
              textTransform: 'uppercase', color: 'var(--color-primary)',
              opacity: 0.8,
              marginBottom: '20px',
            }}>{t('landing.ready')}</p>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(30px, 6vw, 48px)',
              fontWeight: 700, color: 'var(--color-text-primary)',
              lineHeight: 1.25, margin: '0 0 20px',
            }}>
              {t('landing.ctaTitle1')}<br /><span style={{ color: 'var(--color-primary)', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.01em' }}>{t('landing.ctaTitle2')}</span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-inter), sans-serif', fontSize: '18px',
              color: 'var(--color-text-muted)', lineHeight: 1.7, margin: '0 0 36px',
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
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer" style={{ position: 'relative', zIndex: 1, maxWidth: '100%', background: 'var(--color-bg-sidebar)' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '1040px', margin: '0 auto', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div className="lp-footer-brand">
            <Image src="/hero-image.png" alt="DeutAI" width={48} height={48} style={{ objectFit: 'contain' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '1px' }}>
                DeutAI
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--color-text-muted)', letterSpacing: '3px' }}>
                {t('app.deutaiSystem404')}
              </span>
            </div>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '15px', color: 'var(--color-text-muted)', letterSpacing: '3px' }}>
            {t('app.poweredByAi')}
          </span>
        </div>
      </footer>
    </div>
  );
}