'use client';
import { useState } from 'react';

const ERROR_TYPE_META = {
  conjugaison: { label: 'Conjugaison', hue: '#E05252' },
  temps: { label: 'Temps verbal', hue: '#E06060' },
  auxiliaire: { label: 'Auxiliaire', hue: '#CC4444' },
  déclinaison: { label: 'Déclinaison', hue: '#E07752' },
  genre: { label: 'Genre', hue: '#D64F8F' },
  nombre: { label: 'Nombre', hue: '#C94477' },
  accord: { label: 'Accord', hue: '#D94D9A' },
  ordre: { label: 'Ordre des mots', hue: '#B95DE0' },
  position_verbe: { label: 'Position verbe', hue: '#9F4DD0' },
  subordonnée: { label: 'Subordonnée', hue: '#8A40C0' },
  préposition: { label: 'Préposition', hue: '#55C4E0' },
  cas_prépositionnel: { label: 'Cas prép.', hue: '#3DB0CC' },
  choix_mot: { label: 'Choix du mot', hue: '#E09955' },
  faux_ami: { label: 'Faux ami', hue: '#E08844' },
  collocation: { label: 'Collocation', hue: '#D07840' },
  registre: { label: 'Registre', hue: '#C07038' },
  orthographe: { label: 'Orthographe', hue: '#5588E0' },
  majuscule: { label: 'Majuscule', hue: '#4477CC' },
  ponctuation: { label: 'Ponctuation', hue: '#3366BB' },
  verbe_séparable: { label: 'Verbe séparable', hue: '#4AB870' },
  infinitif_zu: { label: 'Infinitif + zu', hue: '#3DA060' },
  modalverbe: { label: 'Verbe modal', hue: '#339050' },
  autre: { label: 'Autre', hue: '#777777' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: '2-digit',
  });
}

function parseBack(back) {
  const lines = (back || '').split('\n').filter(Boolean);
  const correction = lines[0] || '';
  const ruleLine = lines.find(l => l.includes('Règle'));
  const rule = ruleLine ? ruleLine.replace(/^.*Règle\s*:\s*/u, '') : '';
  const explanationLine = lines.find(l => l.startsWith('💡'));
  const explanation = explanationLine ? explanationLine.replace('💡 ', '') : '';
  const suggestionsLine = lines.find(l => l.startsWith('✓'));
  const suggestions = suggestionsLine
    ? suggestionsLine.replace('✓ Variantes : ', '').split(' / ').filter(Boolean)
    : [];
  return { correction, rule, explanation, suggestions };
}

const CARD_STYLES = `
  .fc-scene { perspective: 1400px; }
  .fc-inner {
    position: relative;
    width: 100%;
    transform-style: preserve-3d;
    transition: transform 0.65s cubic-bezier(0.35, 0.1, 0.15, 1);
  }
  .fc-scene.is-flipped .fc-inner { transform: rotateY(180deg); }
  .fc-face {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 16px;
    overflow: hidden;
  }
  .fc-back-face {
    position: absolute;
    inset: 0;
    transform: rotateY(180deg);
  }
  .fc-del {
    opacity: 1;
    transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
  }
`;

export default function FlashcardItem({ flashcard, onDelete }) {
  const [flipped, setFlipped] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meta = ERROR_TYPE_META[flashcard.error_type] || { label: flashcard.error_type ?? 'Erreur', hue: '#777' };
  const { correction, rule, explanation, suggestions } = parseBack(flashcard.back);

  function handleDeleteClick(e) {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
      return;
    }
    setDeleting(true);
    onDelete(flashcard.id);
  }

  return (
    <div
      className={`fc-scene ${flipped ? 'is-flipped' : ''}`}
      onClick={() => setFlipped(f => !f)}
      style={{ cursor: 'pointer', width: '100%' }}
    >
      <style>{CARD_STYLES}</style>

      {/* Dynamic height based on content */}
      <div className="fc-inner" style={{ minHeight: '220px' }}>

        {/* ── FRONT ── */}
        <div className="fc-face" style={{
          position: 'absolute', inset: 0,
          background: '#111113',
          border: '1px solid #222228',
          display: 'flex',
          flexDirection: 'row',
          minHeight: '220px',
        }}>
          {/* Left color accent bar */}
          <div style={{
            width: '4px',
            flexShrink: 0,
            background: `linear-gradient(to bottom, ${meta.hue}, ${meta.hue}40)`,
            borderRadius: '16px 0 0 16px',
          }} />

          {/* Left panel — error info */}
          <div style={{
            flex: '0 0 auto',
            width: '220px',
            padding: '20px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid #1e1e24',
            background: `linear-gradient(135deg, ${meta.hue}06 0%, transparent 60%)`,
          }}>
            <div>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '9px', fontWeight: 600,
                letterSpacing: '2.5px', textTransform: 'uppercase',
                color: meta.hue, opacity: 0.9,
                display: 'block', marginBottom: '14px',
              }}>
                {meta.label}
              </span>
              {flashcard.unit_title && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', letterSpacing: '2px', color: '#383840', textTransform: 'uppercase' }}>Unité</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#50505c' }}>{flashcard.unit_title}</span>
                </div>
              )}
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#2a2a32', letterSpacing: '1px' }}>
              {formatDate(flashcard.created_at)}
            </span>
          </div>

          {/* Center panel — main content */}
          <div style={{
            flex: 1,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '14px',
            minWidth: 0,
          }}>
            {/* Erroneous phrase */}
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px', lineHeight: '1.65',
              color: '#505058',
              textDecoration: 'line-through',
              textDecorationColor: meta.hue + 'AA',
              textDecorationThickness: '1.5px',
              margin: 0,
              wordBreak: 'break-word',
            }}>
              {flashcard.front}
            </p>

            {flashcard.input_text && flashcard.input_text !== flashcard.front && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '8px',
                  letterSpacing: '2px', color: '#303038',
                  paddingTop: '3px', flexShrink: 0, textTransform: 'uppercase',
                }}>Phrase</span>
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '13px', color: '#454550',
                  fontStyle: 'italic', lineHeight: '1.65',
                  wordBreak: 'break-word',
                }}>
                  « {flashcard.input_text} »
                </span>
              </div>
            )}
          </div>

          {/* Right panel — flip hint + delete */}
          <div style={{
            flex: '0 0 auto',
            width: '56px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 0',
            borderLeft: '1px solid #1a1a1f',
          }}>
            <button
              className="fc-del"
              onClick={handleDeleteClick}
              disabled={deleting}
              style={{
                background: confirmDelete ? `${meta.hue}18` : '#141419',
                border: `1px solid ${confirmDelete ? meta.hue + '50' : '#2a2a33'}`,
                borderRadius: '8px', padding: '4px 6px', cursor: 'pointer',
                fontSize: '13px', color: confirmDelete ? meta.hue : '#6c6c78',
                transition: 'all 0.18s', width: '36px', textAlign: 'center',
              }}
              title={confirmDelete ? 'Confirmer la suppression' : 'Supprimer'}
            >
              {deleting ? '…' : confirmDelete ? '✓' : '×'}
            </button>

            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '9px', color: '#252530',
              letterSpacing: '1px',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
            }}>
              retourner ↺
            </span>
          </div>
        </div>

        {/* ── BACK ── */}
        <div className="fc-face fc-back-face" style={{
          background: '#0c0d09',
          border: '1px solid #252518',
          display: 'flex',
          flexDirection: 'row',
          minHeight: '220px',
        }}>
          {/* Gold left accent */}
          <div style={{
            width: '4px',
            flexShrink: 0,
            background: 'linear-gradient(to bottom, #C9A227, #C9A22740)',
            borderRadius: '16px 0 0 16px',
          }} />

          {/* Left label panel */}
          <div style={{
            flex: '0 0 auto',
            width: '120px',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            gap: '6px',
            borderRight: '1px solid #252518',
            background: 'linear-gradient(135deg, rgba(201,162,39,0.06) 0%, transparent 60%)',
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
              letterSpacing: '2.5px', textTransform: 'uppercase',
              color: '#8a7820', fontWeight: 600,
            }}>
              Correction
            </span>
          </div>

          {/* Center — correction content */}
          <div style={{
            flex: 1,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            minWidth: 0,
            overflowY: 'auto',
          }}>
            {/* Corrected phrase */}
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px', lineHeight: '1.6',
              color: '#C9A227', margin: 0,
              fontStyle: 'italic',
              wordBreak: 'break-word',
            }}>
              {correction}
            </p>

            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #2e2d10, transparent)' }} />

            {rule && (
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '8px',
                  letterSpacing: '2px', color: '#484820',
                  paddingTop: '3px', flexShrink: 0,
                  textTransform: 'uppercase', minWidth: '36px',
                }}>Règle</span>
                <p style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '14px', color: '#726a38',
                  lineHeight: '1.7', margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {rule}
                </p>
              </div>
            )}

            {explanation && explanation !== rule && (
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '8px',
                  letterSpacing: '2px', color: '#484820',
                  paddingTop: '3px', flexShrink: 0,
                  textTransform: 'uppercase', minWidth: '36px',
                }}>Expl.</span>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px', color: '#585840',
                  lineHeight: '1.65', margin: 0,
                  wordBreak: 'break-word',
                }}>
                  {explanation}
                </p>
              </div>
            )}

            {suggestions.length > 0 && (
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '8px',
                  letterSpacing: '2px', color: '#484820',
                  paddingTop: '5px', flexShrink: 0,
                  textTransform: 'uppercase', minWidth: '36px',
                }}>Var.</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {suggestions.map((s, i) => (
                    <span key={i} style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                      padding: '3px 9px', borderRadius: '6px',
                      background: 'rgba(201,162,39,0.07)',
                      border: '1px solid rgba(201,162,39,0.18)',
                      color: '#8a7820',
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right flip hint */}
          <div style={{
            flex: '0 0 auto',
            width: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: '1px solid #202010',
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '9px', color: '#303020',
              letterSpacing: '1px',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
            }}>
              retourner ↺
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}