'use client';
import FlashcardItem from './FlashcardItem';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function FlashcardList({ flashcards, onDelete }) {
  const { t } = useLanguage();
  if (!flashcards || flashcards.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px', gap: '20px',
      }}>
        <div style={{
          width: '56px', height: '56px',
          border: '1px solid #222228',
          borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#111113',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at 50% 0%, #C9A22710, transparent 70%)',
          }} />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '22px', color: '#2e2e38',
          }}>⌗</span>
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '15px', color: '#383840',
            letterSpacing: '3px', textTransform: 'uppercase', margin: 0,
          }}>
            {t('flashcards.noCards')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fc-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;600&display=swap');
      `}</style>

      {/* Full-width scrollable list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
      }}>
        {flashcards.map((card, i) => (
          <div
            key={card.id}
            style={{
              animation: 'fc-rise 0.35s ease both',
              animationDelay: `${Math.min(i * 40, 320)}ms`,
              width: '100%',
            }}
          >
            <FlashcardItem flashcard={card} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </>
  );
}