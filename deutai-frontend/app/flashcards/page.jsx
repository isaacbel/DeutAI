'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/Layout/AppShell';
import FlashcardList from '@/components/Flashcards/FlashcardList';
import { useAuthStandalone } from '@/lib/auth';
import { getFlashcards, deleteFlashcard } from '@/lib/api';

const ERROR_TYPE_LABELS = {
  conjugaison: 'Conjugaison',
  temps: 'Temps verbal',
  auxiliaire: 'Auxiliaire',
  déclinaison: 'Déclinaison',
  genre: 'Genre',
  nombre: 'Nombre',
  accord: 'Accord',
  ordre: 'Ordre des mots',
  position_verbe: 'Position verbe',
  subordonnée: 'Subordonnée',
  préposition: 'Préposition',
  cas_prépositionnel: 'Cas prép.',
  choix_mot: 'Choix du mot',
  faux_ami: 'Faux ami',
  collocation: 'Collocation',
  registre: 'Registre',
  orthographe: 'Orthographe',
  majuscule: 'Majuscule',
  ponctuation: 'Ponctuation',
  verbe_séparable: 'Verbe séparable',
  infinitif_zu: 'Infinitif + zu',
  modalverbe: 'Verbe modal',
  autre: 'Autre',
};

const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap');

  @keyframes shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position: 800px 0; }
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .skel {
    border-radius: 16px;
    background: linear-gradient(90deg, #111113 25%, #17171c 50%, #111113 75%);
    background-size: 800px 100%;
    animation: shimmer 1.6s infinite linear;
    width: 100%;
  }
  .page-root {
    min-height: 100vh;
    height: 100vh;
    overflow: hidden;
    background: #080809;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .grid-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .page-header {
    position: sticky; top: 0; z-index: 30;
    padding: 0 28px;
    height: 72px;
    flex-shrink: 0;
    background: rgba(8,8,9,0.92);
    backdrop-filter: blur(20px) saturate(1.4);
    border-bottom: 1px solid #16161c;
    display: flex; align-items: center; justify-content: space-between;
  }
  .header-left { display: flex; flex-direction: column; gap: 3px; }
  .header-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px; font-weight: 700;
    color: #E3C66F; letter-spacing: 4px;
    text-transform: uppercase; margin: 0;
    display: flex; align-items: center; gap: 8px;
  }
  .header-title::before {
    content: '';
    display: block;
    width: 2px; height: 13px; border-radius: 2px;
    background: linear-gradient(to bottom, #C9A227, #C9A22740);
  }
  .header-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #7f859d;
    letter-spacing: 2.4px; text-transform: uppercase;
    margin: 0 0 0 10px;
  }
  .count-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 6px 14px;
    border-radius: 8px;
    background: rgba(201,162,39,0.14);
    border: 1px solid rgba(201,162,39,0.28);
    color: #e5c266;
    letter-spacing: 1px;
    transition: all 0.3s ease;
  }

  /* Scrollable content area */
  .page-scroll {
    position: relative;
    z-index: 1;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px 28px 64px;
    animation: fade-in 0.4s ease both;

    /* Custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: #222228 transparent;
  }
  .page-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .page-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .page-scroll::-webkit-scrollbar-thumb {
    background: #222228;
    border-radius: 3px;
  }
  .page-scroll::-webkit-scrollbar-thumb:hover {
    background: #2e2e38;
  }

  .page-inner {
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
  }

  .error-banner {
    margin-bottom: 18px;
    padding: 12px 18px;
    border-radius: 12px;
    background: #0f0808;
    border: 1px solid #2a1010;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .error-msg {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; color: #bb4444; letter-spacing: 0.5px;
  }
  .retry-btn {
    background: transparent; border: none;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #C9A227;
    cursor: pointer; letter-spacing: 1px;
    padding: 0; white-space: nowrap;
    text-decoration: underline; text-underline-offset: 3px;
    opacity: 0.7; transition: opacity 0.2s;
  }
  .retry-btn:hover { opacity: 1; }
  .hint-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; color: #80859c;
    letter-spacing: 2.5px; text-transform: uppercase;
    margin-bottom: 16px;
    color: #80859c;
  }
`;

export default function FlashcardsPage() {
  const { loading: authLoading } = useAuthStandalone();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (!authLoading) loadFlashcards();
  }, [authLoading]);

  async function loadFlashcards() {
    setError('');
    setLoading(true);
    try {
      const res = await getFlashcards();
      if (!res.ok) { setError('Impossible de charger les flashcards.'); return; }
      const data = await res.json();
      setFlashcards(data.flashcards || data || []);
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await deleteFlashcard(id);
      if (res.ok) {
        setFlashcards(prev => prev.filter(f => f.id !== id));
      } else {
        setError('Impossible de supprimer cette flashcard.');
      }
    } catch {
      setError('Erreur réseau.');
    }
  }

  if (authLoading) return null;

  const typeOptions = [
    { value: 'all', label: 'Tous' },
    ...Array.from(new Set(flashcards.map((c) => c.error_type).filter(Boolean))).map((type) => ({
      value: type,
      label: ERROR_TYPE_LABELS[type] || type,
    })),
  ];

  const filteredFlashcards = selectedType === 'all'
    ? flashcards
    : flashcards.filter((card) => card.error_type === selectedType);

  return (
    <AppShell>
      <style>{PAGE_STYLES}</style>

      <div className="page-root">
        <div className="grid-bg" />

        {/* Sticky header */}
        <header className="page-header">
          <div className="header-left">
            <h1 className="header-title">Flashcards</h1>
            <p className="header-sub">Mémoire des erreurs</p>
          </div>

          {!loading && (
            <div className="count-badge">
              {filteredFlashcards.length}
              {selectedType !== 'all' ? ` / ${flashcards.length}` : ''}&thinsp;
              carte{filteredFlashcards.length !== 1 ? 's' : ''}
            </div>
          )}
        </header>

        {/* Scrollable content */}
        <div className="page-scroll">
          <div className="page-inner">

            {error && (
              <div className="error-banner">
                <span className="error-msg">⚠ {error}</span>
                <button className="retry-btn" onClick={loadFlashcards}>↺ Réessayer</button>
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skel" style={{ height: '220px' }} />
                ))}
              </div>
            ) : (
              <>
                {flashcards.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                    {typeOptions.map((opt) => {
                      const active = selectedType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedType(opt.value)}
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '10px',
                            padding: '6px 10px',
                            borderRadius: '999px',
                            border: active ? '1px solid rgba(201,162,39,0.35)' : '1px solid #1f1f28',
                            background: active ? 'rgba(201,162,39,0.12)' : '#101016',
                            color: active ? '#C9A227' : '#646476',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                {filteredFlashcards.length > 0 && (
                  <p className="hint-label">Cliquez pour retourner la carte</p>
                )}
                <FlashcardList flashcards={filteredFlashcards} onDelete={handleDelete} />
              </>
            )}

          </div>
        </div>
      </div>
    </AppShell>
  );
}