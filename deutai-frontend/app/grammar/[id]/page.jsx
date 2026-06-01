'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import AppShell from '@/components/Layout/AppShell';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { ALL_PHRASES } from '@/lib/grammarData';

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
        width: 100,
        height: 100,
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
      title="QR Code for this card"
      style={{
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        flexShrink: 0,
        background: '#ffffff',
      }}
    />
  );
}

export default function DynamicPhrasePage() {
  const { id } = useParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  const phrase = ALL_PHRASES.find((p) => p.id === id);

  if (!phrase) {
    return (
      <AppShell>
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-ice)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'var(--font-inter), sans-serif' }}>
          <h1 style={{ color: 'var(--color-text-primary)', marginBottom: '1rem', fontSize: '1.5rem' }}>
            {isRtl ? 'الصفحة غير موجودة' : 'Satz nicht gefunden'}
          </h1>
          <button
            onClick={() => router.push('/grammar')}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'var(--color-primary)',
              color: '#ffffff',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {isRtl ? '← العودة للقائمة' : '← Zurück zur Übersicht'}
          </button>
        </div>
      </AppShell>
    );
  }

  const isCorrect = phrase.type === 'correct';

  return (
    <AppShell>
      <Script
        src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"
        strategy="afterInteractive"
      />

      <div className="phrase-detail-page" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="phrase-detail-container">
          {/* Back button */}
          <button
            onClick={() => router.push('/grammar')}
            className="back-btn"
          >
            {isRtl ? '← العودة للقائمة' : '← Zurück zur Übersicht'}
          </button>

          {/* Centered card */}
          <article className="grammar-card">
            {/* Card header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.4rem' }}>
              <div style={{ flex: 1 }}>
                {/* Wrong / Original */}
                <div style={{ marginBottom: '0.8rem' }}>
                  <span className="card-label" style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {isCorrect ? '✅ Richtig!' : '❌ Falsch'}
                  </span>
                  <p
                    className="phrase-text"
                    style={{
                      color: isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                      textDecoration: isCorrect ? 'none' : 'line-through',
                      textDecorationColor: 'var(--color-error)',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                    }}
                  >
                    {phrase.wrong}
                  </p>
                </div>

                {/* Correct — shown only for corrections */}
                {!isCorrect && (
                  <div>
                    <span className="card-label" style={{ color: 'var(--color-success)' }}>✅ Korrekt</span>
                    <p className="phrase-text" style={{ color: 'var(--color-success)', fontSize: '1.2rem', fontWeight: 700 }}>
                      {phrase.correct}
                    </p>
                  </div>
                )}
              </div>

              {/* QR code */}
              <QRCode phraseId={phrase.id} />
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--color-border)', margin: '0 0 1.25rem', opacity: 0.5 }} />

            {/* German explanation */}
            <div style={{ marginBottom: '1.1rem' }}>
              <span className="lang-badge" style={{ background: 'var(--color-bg-sidebar)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                🇩🇪 Deutsch
              </span>
              <p className="explanation-text" style={{ color: 'var(--color-text-primary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                {phrase.de}
              </p>
            </div>

            {/* Arabic explanation */}
            <div>
              <span className="lang-badge" style={{ background: 'rgba(76,177,255,0.08)', color: 'var(--color-info)', border: '1px solid rgba(76,177,255,0.2)' }}>
                🇩🇿 العربية
              </span>
              <p
                className="explanation-text"
                dir="rtl"
                lang="ar"
                style={{
                  color: 'var(--color-text-primary)',
                  marginTop: '0.5rem',
                  textAlign: 'right',
                  fontFamily: '"Noto Naskh Arabic", "Cairo", sans-serif',
                  fontSize: '0.9rem',
                }}
              >
                {phrase.ar}
              </p>
            </div>
          </article>
        </div>
      </div>

      <style>{`
        .phrase-detail-page {
          min-height: 100vh;
          background: var(--color-bg-ice);
          background-image: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(156,123,172,0.04) 0%, transparent 60%);
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
        }

        .phrase-detail-container {
          max-width: 520px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .back-btn {
          align-self: flex-start;
          font-family: var(--font-inter), sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          background: transparent;
          border: 1px solid var(--color-border);
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .back-btn:hover {
          background: rgba(156,123,172,0.08);
          color: var(--color-primary);
          border-color: rgba(156,123,172,0.4);
        }

        /* ── Phrase Card ── */
        .grammar-card {
          background: #ffffff;
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(156,123,172,0.06), 0 0 0 1px rgba(156,123,172,0.02);
          position: relative;
          overflow: hidden;
        }

        .card-label {
          font-family: var(--font-inter), sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.35rem;
        }

        .phrase-text {
          font-family: var(--font-inter), sans-serif;
          line-height: 1.4;
          margin: 0;
        }

        .lang-badge {
          display: inline-block;
          font-family: var(--font-inter), sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
        }

        .explanation-text {
          font-family: var(--font-inter), sans-serif;
          line-height: 1.7;
          margin: 0;
        }
      `}</style>
    </AppShell>
  );
}
