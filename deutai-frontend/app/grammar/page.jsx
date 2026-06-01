'use client';
import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/Layout/AppShell';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { A1_PHRASES, A2_PHRASES } from '@/lib/grammarData';

/* ─── QR Generator ──────────────────────────────────────────── */
function QRCode({ phraseId }) {
  const canvasId = `qr-${phraseId}`;

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/grammar/${phraseId}`;

    function tryRender() {
      if (!window.QRCode) { setTimeout(tryRender, 200); return; }
      const el = document.getElementById(canvasId);
      if (!el) return;
      el.innerHTML = '';
      new window.QRCode(el, {
        text: url,
        width: 88,
        height: 88,
        colorDark: '#4A4B4B',
        colorLight: '#ffffff',
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
        border: '1px solid var(--color-border)',
        flexShrink: 0,
        background: '#ffffff',
      }}
    />
  );
}

/* ─── Phrase Card ───────────────────────────────────────────── */
function PhraseCard({ phrase, index }) {
  const router = useRouter();
  const isCorrect = phrase.type === 'correct';

  return (
    <article
      id={phrase.id}
      className="grammar-card"
      style={{ animationDelay: `${index * 80}ms`, cursor: 'pointer' }}
      onClick={(e) => {
        if (e.target.closest('#qr-' + phrase.id)) return;
        router.push(`/grammar/${phrase.id}`);
      }}
    >
      {/* Card header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.1rem' }}>
        <div style={{ flex: 1 }}>
          {/* Wrong / Original */}
          <div style={{ marginBottom: '0.6rem' }}>
            <span className="card-label" style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>
              {isCorrect ? '✅ Richtig!' : '❌ Falsch'}
            </span>
            <p
              className="phrase-text"
              style={{
                color: isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                textDecoration: isCorrect ? 'none' : 'line-through',
                textDecorationColor: 'var(--color-error)',
              }}
            >
              {phrase.wrong}
            </p>
          </div>

          {/* Correct — shown only for corrections */}
          {!isCorrect && (
            <div>
              <span className="card-label" style={{ color: 'var(--color-success)' }}>✅ Korrekt</span>
              <p className="phrase-text" style={{ color: 'var(--color-success)' }}>{phrase.correct}</p>
            </div>
          )}
        </div>

        {/* QR code */}
        <QRCode phraseId={phrase.id} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-border)', margin: '0 0 1rem', opacity: 0.5 }} />

      {/* German explanation */}
      <div style={{ marginBottom: '0.85rem' }}>
        <span className="lang-badge" style={{ background: 'var(--color-bg-sidebar)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>🇩🇪 Deutsch</span>
        <p className="explanation-text" style={{ color: 'var(--color-text-primary)', marginTop: '0.4rem' }}>
          {phrase.de}
        </p>
      </div>

      {/* Arabic explanation */}
      <div>
        <span className="lang-badge" style={{ background: 'rgba(76,177,255,0.08)', color: 'var(--color-info)', border: '1px solid rgba(76,177,255,0.2)' }}>🇩🇿 العربية</span>
        <p
          className="explanation-text"
          dir="rtl"
          lang="ar"
          style={{
            color: 'var(--color-text-primary)',
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
        <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg, var(--color-primary), transparent)', borderRadius: 2, marginTop: '0.6rem' }} />
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
            <span style={{ color: 'var(--color-border)', fontSize: '0.7rem' }}>|</span>
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
        /* ── Grammar page root ── */
        .grammar-page {
          min-height: 100vh;
          background: var(--color-bg-ice);
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(156,123,172,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(201,185,158,0.02) 0%, transparent 50%);
          color: var(--color-text-primary);
          padding-top: 64px; /* nav height */
        }

        /* ── Sticky nav ── */
        .grammar-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(242,248,252,0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--color-border);
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
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-primary);
          letter-spacing: 0.03em;
        }
        .nav-link {
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 0.3rem 0.7rem;
          border-radius: 6px;
          transition: background 0.2s, color 0.2s;
        }
        .nav-link:hover {
          background: rgba(156,123,172,0.08);
          color: var(--color-primary);
        }

        /* ── Hero ── */
        .grammar-hero {
          padding: 4rem 1.5rem 3rem;
          text-align: center;
          border-bottom: 1px solid var(--color-border);
        }
        .hero-inner { max-width: 680px; margin: 0 auto; }
        .hero-eyebrow {
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-primary);
          margin-bottom: 0.8rem;
        }
        .hero-title {
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: clamp(2.2rem, 6vw, 3.6rem);
          font-weight: 900;
          line-height: 1.12;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
          margin: 0 0 1rem;
        }
        .hero-subtitle {
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: 1.15rem;
          color: var(--color-text-muted);
          line-height: 1.7;
          margin: 0;
        }
        .hero-divider {
          width: 40px;
          height: 1px;
          background: var(--color-border);
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
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--color-text-muted);
          margin-bottom: 0.3rem;
        }
        .section-heading {
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          font-weight: 700;
          color: var(--color-primary);
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
          background: #ffffff;
          border: 1px solid var(--color-border);
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
          background: linear-gradient(135deg, rgba(156,123,172,0.03) 0%, transparent 60%);
          pointer-events: none;
        }
        .grammar-card:hover {
          border-color: rgba(156,123,172,0.4);
          box-shadow: 0 8px 30px rgba(156,123,172,0.08);
          transform: translateY(-3px);
        }

        /* ── Card internals ── */
        .card-label {
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.25rem;
        }
        .phrase-text {
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0;
        }
        .lang-badge {
          display: inline-block;
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.15rem 0.55rem;
          border-radius: 4px;
        }
        .explanation-text {
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: 0.83rem;
          line-height: 1.7;
          margin: 0;
        }

        /* ── Footer ── */
        .grammar-footer {
          text-align: center;
          padding: 2rem 1.5rem;
          border-top: 1px solid var(--color-border);
          font-family: var(--font-inter), 'Inter', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: var(--color-text-muted);
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
