'use client';
import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import AppShell from '@/components/Layout/AppShell';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

/* ─── Data ──────────────────────────────────────────────────── */
const A1_PHRASES = [
  {
    id: 'a1-phrase-1',
    wrong: 'Ihr machen Hausaufgaben',
    correct: 'Ihr macht Hausaufgaben',
    type: 'correction',
    de: '„machen" ist falsch. Mit „ihr" muss das Verb „macht" verwendet werden (2. Person Plural).',
    ar: '«machen» خطأ. مع ضمير «ihr» يجب استخدام «macht» (المضارع، الجمع المخاطب).',
  },
  {
    id: 'a1-phrase-2',
    wrong: 'Du fährst nach Berlin',
    correct: 'Du fährst nach Berlin',
    type: 'correct',
    de: 'Dieser Satz ist korrekt! „fährst" ist die richtige Konjugation für „du" beim Verb „fahren".',
    ar: 'هذه الجملة صحيحة! «fährst» هو التصريف الصحيح للفعل «fahren» مع ضمير «du».',
  },
  {
    id: 'a1-phrase-3',
    wrong: 'Ich lernt Deutsch',
    correct: 'Ich lerne Deutsch',
    type: 'correction',
    de: '„lernt" ist die 3. Person Singular. Mit „ich" sagt man „lerne".',
    ar: '«lernt» تُستخدم للغائب المفرد. مع ضمير «ich» نقول «lerne».',
  },
  {
    id: 'a1-phrase-4',
    wrong: 'Das Kind fragen viel',
    correct: 'Das Kind fragt viel',
    type: 'correction',
    de: '„fragen" ist der Infinitiv. Mit „das Kind" (3. Person Singular) braucht man „fragt".',
    ar: '«fragen» هو المصدر. مع «das Kind» (الغائب المفرد) يجب استخدام «fragt».',
  },
];

const A2_PHRASES = [
  {
    id: 'a2-phrase-1',
    wrong: 'Ich habe nach Hause gegangen',
    correct: 'Ich bin nach Hause gegangen',
    type: 'correction',
    de: 'Verben der Bewegung wie „gehen" bilden das Perfekt mit „sein", nicht „haben".',
    ar: 'أفعال الحركة مثل «gehen» تكوّن زمن الماضي التام مع «sein» وليس «haben».',
  },
  {
    id: 'a2-phrase-2',
    wrong: 'Er hat den Brief geschreibt',
    correct: 'Er hat den Brief geschrieben',
    type: 'correction',
    de: 'Das Partizip II von „schreiben" ist „geschrieben", nicht „geschreibt".',
    ar: 'اسم المفعول من «schreiben» هو «geschrieben» وليس «geschreibt».',
  },
  {
    id: 'a2-phrase-3',
    wrong: 'Er will heute nicht arbeitet',
    correct: 'Er will heute nicht arbeiten',
    type: 'correction',
    de: 'Nach Modalverben wie „wollen" steht der Infinitiv, nicht das konjugierte Verb.',
    ar: 'بعد الأفعال الناقصة مثل «wollen» يأتي المصدر، وليس الفعل المُصرَّف.',
  },
  {
    id: 'a2-phrase-4',
    wrong: 'Ich habe gestern gestudiert',
    correct: 'Ich habe gestern studiert',
    type: 'correction',
    de: 'Das Partizip II von „studieren" lautet „studiert", nicht „gestudiert" – Verben auf -ieren bekommen kein „ge-" Präfix.',
    ar: 'أفعال الألمانية المنتهية بـ -ieren لا تأخذ البادئة «ge-»، فلفظ «studiert» هو الصحيح.',
  },
  {
    id: 'a2-phrase-5',
    wrong: 'Letztes Jahr habe ich nach Berlin gerist',
    correct: 'Letztes Jahr bin ich nach Berlin gereist',
    type: 'correction',
    de: 'Zwei Fehler: 1) „reisen" braucht „sein" im Perfekt (Bewegungsverb). 2) Das Partizip II lautet „gereist", nicht „gerist".',
    ar: 'خطآن: ١) الفعل «reisen» يستخدم «sein» في الماضي التام لأنه فعل حركة. ٢) اسم المفعول هو «gereist» وليس «gerist».',
  },
];

/* ─── QR Generator ──────────────────────────────────────────── */
function QRCode({ phraseId }) {
  const canvasId = `qr-${phraseId}`;

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/grammar#${phraseId}`;

    function tryRender() {
      if (!window.QRCode) { setTimeout(tryRender, 200); return; }
      const el = document.getElementById(canvasId);
      if (!el) return;
      el.innerHTML = '';
      new window.QRCode(el, {
        text: url,
        width: 88,
        height: 88,
        colorDark: '#c9b99e',
        colorLight: '#1a1d2b',
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    }
    tryRender();
  }, [canvasId, phraseId]);

  return (
    <div
      id={canvasId}
      title="Scan to open this card"
      style={{
        width: 88,
        height: 88,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(201,185,158,0.18)',
        flexShrink: 0,
        background: '#1a1d2b',
      }}
    />
  );
}

/* ─── Phrase Card ───────────────────────────────────────────── */
function PhraseCard({ phrase, index }) {
  const isCorrect = phrase.type === 'correct';

  return (
    <article
      id={phrase.id}
      className="grammar-card"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Card header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.1rem' }}>
        <div style={{ flex: 1 }}>
          {/* Wrong / Original */}
          <div style={{ marginBottom: '0.6rem' }}>
            <span className="card-label" style={{ color: isCorrect ? '#7dc47a' : '#e07070' }}>
              {isCorrect ? '✅ Richtig!' : '❌ Falsch'}
            </span>
            <p
              className="phrase-text"
              style={{
                color: isCorrect ? '#a8dba4' : '#e8a0a0',
                textDecoration: isCorrect ? 'none' : 'line-through',
                textDecorationColor: '#e07070',
              }}
            >
              {phrase.wrong}
            </p>
          </div>

          {/* Correct — shown only for corrections */}
          {!isCorrect && (
            <div>
              <span className="card-label" style={{ color: '#7dc47a' }}>✅ Korrekt</span>
              <p className="phrase-text" style={{ color: '#a8dba4' }}>{phrase.correct}</p>
            </div>
          )}
        </div>

        {/* QR code */}
        <QRCode phraseId={phrase.id} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(201,185,158,0.14) 0%, transparent 100%)', margin: '0 0 1rem' }} />

      {/* German explanation */}
      <div style={{ marginBottom: '0.85rem' }}>
        <span className="lang-badge" style={{ background: 'rgba(201,185,158,0.08)', color: '#c9b99e' }}>🇩🇪 Deutsch</span>
        <p className="explanation-text" style={{ color: '#b8b0a0', marginTop: '0.4rem' }}>
          {phrase.de}
        </p>
      </div>

      {/* Arabic explanation */}
      <div>
        <span className="lang-badge" style={{ background: 'rgba(107,155,220,0.08)', color: '#8ab4e0' }}>🇩🇿 العربية</span>
        <p
          className="explanation-text"
          dir="rtl"
          lang="ar"
          style={{
            color: '#a8b8cc',
            marginTop: '0.4rem',
            textAlign: 'right',
            fontFamily: '"Noto Naskh Arabic", "Cairo", sans-serif',
          }}
        >
          {phrase.ar}
        </p>
      </div>
    </article>
  );
}

/* ─── Section ───────────────────────────────────────────────── */
function GrammarSection({ id, level, phrases }) {
  return (
    <section id={id} style={{ marginBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="section-eyebrow">Niveau</div>
        <h2 className="section-heading">{level}</h2>
        <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg, #c9b99e, transparent)', borderRadius: 2, marginTop: '0.6rem' }} />
      </div>
      <div className="cards-grid">
        {phrases.map((p, i) => (
          <PhraseCard key={p.id} phrase={p} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function GrammarPage() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  return (
    <AppShell>
      <Script
        src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"
        strategy="afterInteractive"
      />

      {/* Sticky nav */}
      <nav className="grammar-nav" aria-label="Grammar sections">
        <div className="grammar-nav-inner">
          <span className="nav-brand">🇩🇪 Grammatik</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <a href="#a1" className="nav-link">A1</a>
            <span style={{ color: 'rgba(201,185,158,0.3)', fontSize: '0.7rem' }}>|</span>
            <a href="#a2" className="nav-link">A2</a>
          </div>
        </div>
      </nav>

      <div className="grammar-page">
        {/* Hero */}
        <header className="grammar-hero">
          <div className="hero-inner">
            <p className="hero-eyebrow">Deutsche Grammatik</p>
            <h1 className="hero-title">
              Fehler &amp; Korrekturen
            </h1>
            <p className="hero-subtitle">
              Häufige Grammatikfehler auf Niveau A1 und A2 — mit Erklärungen auf Deutsch und Arabisch.
            </p>
            <div className="hero-divider" />
          </div>
        </header>

        {/* Main content */}
        <main className="grammar-main" id="main-content">
          <GrammarSection id="a1" level="A1 — Grundstufe" phrases={A1_PHRASES} />
          <GrammarSection id="a2" level="A2 — Grundkenntnisse" phrases={A2_PHRASES} />
        </main>

        <footer className="grammar-footer">
          <p>DeutAI · Deutsche Grammatik · Fehler &amp; Korrekturen</p>
        </footer>
      </div>

      <style>{`
        /* ── Fonts ── */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@400;500;600&family=Noto+Naskh+Arabic:wght@400;500;600&family=Cairo:wght@400;500;600&display=swap');

        /* ── Grammar page root ── */
        .grammar-page {
          min-height: 100vh;
          background: #0f1118;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(156,123,172,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(201,185,158,0.04) 0%, transparent 50%);
          color: #d4cfc8;
          padding-top: 64px; /* nav height */
        }

        /* ── Sticky nav ── */
        .grammar-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(11,13,20,0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(201,185,158,0.10);
        }
        .grammar-nav-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-brand {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1rem;
          font-weight: 700;
          color: #c9b99e;
          letter-spacing: 0.03em;
        }
        .nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #8a8070;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 0.3rem 0.7rem;
          border-radius: 6px;
          transition: background 0.2s, color 0.2s;
        }
        .nav-link:hover {
          background: rgba(201,185,158,0.10);
          color: #c9b99e;
        }

        /* ── Hero ── */
        .grammar-hero {
          padding: 4rem 1.5rem 3rem;
          text-align: center;
          border-bottom: 1px solid rgba(201,185,158,0.08);
        }
        .hero-inner { max-width: 680px; margin: 0 auto; }
        .hero-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #9C7BAC;
          margin-bottom: 0.8rem;
        }
        .hero-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.2rem, 6vw, 3.6rem);
          font-weight: 900;
          line-height: 1.12;
          color: #e8e0d0;
          letter-spacing: -0.01em;
          margin: 0 0 1rem;
        }
        .hero-subtitle {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.15rem;
          color: #7a7268;
          line-height: 1.7;
          font-style: italic;
          margin: 0;
        }
        .hero-divider {
          width: 40px;
          height: 1px;
          background: rgba(201,185,158,0.30);
          margin: 2rem auto 0;
        }

        /* ── Main content ── */
        .grammar-main {
          max-width: 860px;
          margin: 0 auto;
          padding: 3.5rem 1.5rem 2rem;
        }

        /* ── Section heading ── */
        .section-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #5c5650;
          margin-bottom: 0.3rem;
        }
        .section-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          font-weight: 700;
          color: #c9b99e;
          letter-spacing: -0.01em;
          margin: 0;
        }

        /* ── Cards grid ── */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr));
          gap: 1.25rem;
        }

        /* ── Individual card ── */
        .grammar-card {
          background: #14171f;
          border: 1px solid rgba(201,185,158,0.10);
          border-radius: 14px;
          padding: 1.4rem 1.4rem 1.2rem;
          position: relative;
          overflow: hidden;
          animation: cardFadeUp 0.5s ease-out both;
          transition: border-color 0.28s, box-shadow 0.28s, transform 0.28s;
          scroll-margin-top: 72px; /* clearance for sticky nav */
        }
        .grammar-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(201,185,158,0.03) 0%, transparent 60%);
          pointer-events: none;
        }
        .grammar-card:hover {
          border-color: rgba(201,185,158,0.26);
          box-shadow: 0 8px 40px rgba(0,0,0,0.40), 0 0 0 1px rgba(201,185,158,0.08);
          transform: translateY(-3px);
        }

        /* ── Card internals ── */
        .card-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.25rem;
        }
        .phrase-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.05rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0;
        }
        .lang-badge {
          display: inline-block;
          font-family: 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.15rem 0.55rem;
          border-radius: 4px;
        }
        .explanation-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.83rem;
          line-height: 1.7;
          margin: 0;
        }

        /* ── Footer ── */
        .grammar-footer {
          text-align: center;
          padding: 2rem 1.5rem;
          border-top: 1px solid rgba(201,185,158,0.07);
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: #3a3830;
        }

        /* ── Animation ── */
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .grammar-hero { padding: 2.5rem 1rem 2rem; }
          .grammar-main { padding: 2rem 1rem 1.5rem; }
          .grammar-nav-inner { padding: 0 1rem; }
        }
      `}</style>
    </AppShell>
  );
}
