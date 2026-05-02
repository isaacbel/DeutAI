'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/Layout/AppShell';
import ResultCards from '@/components/Analyzer/ResultCards';
import { useAuthStandalone } from '@/lib/auth';
import { getHistory, deleteHistoryItem, clearHistory } from '@/lib/api';

// ─── Data mapper ──────────────────────────────────────────────────────────────
// Converts a history DB row into the exact shape that ResultCards / ErrorCard /
// CorrectionCard / RuleCard expect — same as what the analyze endpoint returns.

function buildResult(row) {
  const parseJsonField = (value, fallback) => {
    if (value == null) return fallback;
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return fallback; }
    }
    return value;
  };

  let errors = [];
  const parsedErrors = parseJsonField(row.errors_json, []);
  if (Array.isArray(parsedErrors) && parsedErrors.length > 0) errors = parsedErrors;

  // Legacy fallback: single-error rows stored before multi-error support
  if (errors.length === 0 && row.has_error && row.error_phrase) {
    errors = [{
      errorText: row.error_phrase,
      correction: row.correction,
      rule: row.rule,
      errorType: row.error_type,
      severity: 'medium',
    }];
  }

  let exercises = [];
  const parsedExercises = parseJsonField(row.exercises_json, []);
  exercises = Array.isArray(parsedExercises) ? parsedExercises : [];

  return {
    // fields read by ErrorCard
    hasError: row.has_error,
    hasErrors: row.has_error,
    errors,
    originalSentence: row.input_text,
    input: row.input_text,
    // fields read by CorrectionCard
    correctedSentence: row.correction,
    correction: row.correction,
    // fields read by RuleCard
    rule: row.rule,
    globalExplanation: row.global_explanation,
    exercises,
    // misc
    errorType: row.error_type,
  };
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtRelative(d) {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff < 7) return `Il y a ${diff}j`;
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ─── Sidebar conversation item ────────────────────────────────────────────────

function SidebarItem({ item, isSelected, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  let errCount = 0;
  if (Array.isArray(item.errors_json)) {
    errCount = item.errors_json.length;
  } else if (typeof item.errors_json === 'string') {
    try {
      const parsed = JSON.parse(item.errors_json || '[]');
      errCount = Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      errCount = 0;
    }
  }

  function handleDel(e) {
    e.stopPropagation();
    if (!confirmDel) { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 2500); return; }
    onDelete(item.id);
  }

  return (
    <div
      onClick={() => onSelect(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDel(false); }}
      style={{
        position: 'relative',
        padding: '12px 13px',
        borderRadius: '10px',
        cursor: 'pointer',
        marginBottom: '4px',
        background: isSelected
          ? 'rgba(212,175,55,0.1)'
          : hovered ? 'rgba(255,255,255,0.045)' : 'transparent',
        border: `1px solid ${isSelected ? 'rgba(212,175,55,0.28)' : 'rgba(255,255,255,0.05)'}`,
        transition: 'background 0.14s, border-color 0.14s, box-shadow 0.14s, transform 0.12s',
        userSelect: 'none',
        boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.32)' : 'none',
        transform: hovered && !isSelected ? 'translateX(1px)' : 'none',
      }}
    >
      {/* Active indicator */}
      {isSelected && (
        <div style={{
          position: 'absolute', left: 0, top: '16%', bottom: '16%',
          width: '2px', borderRadius: '0 2px 2px 0',
          background: 'linear-gradient(to bottom, #C9A227, #C9A22750)',
        }} />
      )}

      {/* Top row: date + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
          color: isSelected ? '#c9a227b8' : '#8c91a9', letterSpacing: '0.5px',
        }}>
          {fmtRelative(item.created_at)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {item.source === 'image' && (
            <span style={{ fontSize: '8px', opacity: 0.3 }}>📷</span>
          )}
          {item.has_error ? (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '7px',
              padding: '1px 5px', borderRadius: '3px',
              background: 'rgba(180,60,60,0.09)',
              border: '1px solid rgba(180,60,60,0.16)',
              color: '#6a2828',
            }}>
              {errCount > 0 ? `${errCount}✗` : '✗'}
            </span>
          ) : (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '7px',
              padding: '1px 5px', borderRadius: '3px',
              background: 'rgba(40,130,70,0.07)',
              border: '1px solid rgba(40,130,70,0.13)',
              color: '#1e4a30',
            }}>✓</span>
          )}
        </div>
      </div>

      {/* Text preview */}
      <p style={{
        margin: 0,
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '14.5px', lineHeight: 1.5,
        color: isSelected ? '#eceeff' : hovered ? '#c4c9e3' : '#a8adc8',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        paddingRight: hovered ? '20px' : '0',
        transition: 'color 0.12s',
      }}>
        {item.input_text}
      </p>

      {/* Delete button — visible on hover */}
      {(hovered || confirmDel) && (
        <button
          onClick={handleDel}
          style={{
            position: 'absolute', bottom: '9px', right: '9px',
            background: confirmDel ? 'rgba(180,40,40,0.2)' : 'rgba(18,18,24,0.98)',
            border: confirmDel ? '1px solid rgba(180,40,40,0.42)' : '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px', padding: '4px 9px', cursor: 'pointer',
            fontSize: '9px', fontFamily: 'JetBrains Mono, monospace',
            color: confirmDel ? '#ff6a6a' : '#8f95ad',
            transition: 'all 0.12s',
          }}
        >
          {confirmDel ? 'CONF?' : 'DEL'}
        </button>
      )}
    </div>
  );
}

// ─── Right panel: exact replica of the analyze page result ───────────────────

function AnalyzeReplay({ selected }) {
  const result = buildResult(selected);
  const scrollRef = useRef(null);

  // Scroll to top whenever a new item is selected
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selected.id]);

  return (
    <div
      ref={scrollRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Inner content — conversation view (single thread) */}
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 18px 80px' }}>

        {/* ── Timestamp ── */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{
            display: 'inline-block',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '8px',
            color: '#1a1a26', letterSpacing: '2px', textTransform: 'uppercase',
            padding: '3px 12px', borderRadius: '20px',
            border: '1px solid #111118',
          }}>
            {fmtDate(selected.created_at)}
          </span>
        </div>

        {/* ── Conversation (single thread) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* User message */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              width: 'min(860px, 100%)',
              borderRadius: '16px',
              background: '#101014',
              border: '1px solid #1e1e26',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '9px',
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: '#343445',
                }}>
                  You
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '8px',
                  letterSpacing: '1px',
                  color: '#262634',
                }}>
                  {selected.source === 'image' ? '📷 IMAGE' : '✎ TEXTE'}
                </span>
              </div>
              <p style={{
                margin: '10px 0 0',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '16px',
                lineHeight: 1.8,
                color: '#d0d0e0',
                wordBreak: 'break-word',
              }}>
                {selected.input_text}
              </p>
            </div>
          </div>

          {/* Assistant message — includes ALL results inside the same message */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              width: 'min(920px, 100%)',
              borderRadius: '16px',
              background: 'rgba(212,175,55,0.06)',
              border: '1px solid rgba(212,175,55,0.18)',
              padding: '14px 16px',
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '9px',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: '#9a8030',
              }}>
                DeutAI
              </span>

              <div style={{ marginTop: '12px' }}>
                <ResultCards result={result} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Main history page ────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { loading: authLoading } = useAuthStandalone();
  const [items, setItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selected, setSelected] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    setPageLoading(true); setFetchError('');
    try {
      const res = await getHistory(1, 50);
      if (!res.ok) { setFetchError("Impossible de charger l'historique."); return; }
      const data = await res.json();
      setItems(data.history || []);
    } catch { setFetchError('Erreur réseau.'); }
    finally { setPageLoading(false); }
  }, []);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  useEffect(() => {
    if (pageLoading) return;
    if (items.length === 0) {
      if (selected) setSelected(null);
      return;
    }
    // Keep the selected item if it still exists, otherwise pick latest.
    const stillExists = selected && items.some((it) => it.id === selected.id);
    if (!stillExists) setSelected(items[0]);
  }, [items, selected, pageLoading]);

  async function handleDelete(id) {
    await deleteHistoryItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  async function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setClearing(true);
    await clearHistory();
    setItems([]); setSelected(null);
    setConfirmClear(false); setClearing(false);
  }

  return (
    <AppShell>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap');

        /* ── Root: full viewport, no overflow ── */
        .hp { display:flex; min-height:100vh; overflow:hidden; background:#080809; }

        /* ── Left sidebar ── */
        .hp-side {
          width: 270px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: #06060a;
          border-right: 1px solid #181824;
          height: 100vh;
          overflow: hidden;
        }
        .hp-side-head {
          padding: 18px 14px 14px;
          border-bottom: 1px solid #181824;
          flex-shrink: 0;
          background: linear-gradient(to bottom, rgba(201,162,39,0.04), rgba(201,162,39,0));
        }
        .hp-side-list {
          flex: 1 1 auto;
          overflow-y: auto;
          padding: 6px;
        }
        .hp-side-list::-webkit-scrollbar { width: 3px; }
        .hp-side-list::-webkit-scrollbar-thumb { background: #141420; border-radius: 3px; }
        .hp-side-foot {
          padding: 10px;
          border-top: 1px solid #181824;
          flex-shrink: 0;
        }

        /* ── Right main ── */
        .hp-main {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #080809;
        }
        /* scrollbar for the replay inner div */
        .hp-main *::-webkit-scrollbar { width: 4px; }
        .hp-main *::-webkit-scrollbar-thumb { background: #111118; border-radius: 3px; }

        /* ── Skeleton shimmer ── */
        @keyframes sk { 0%{background-position:-280px 0}100%{background-position:280px 0} }
        .sk {
          border-radius: 8px;
          background: linear-gradient(90deg,#0b0b0e 25%,#101014 50%,#0b0b0e 75%);
          background-size: 280px 100%;
          animation: sk 1.3s infinite linear;
        }

        /* ── Item entrance ── */
        @keyframes sl { from{opacity:0;transform:translateX(-4px)}to{opacity:1;transform:translateX(0)} }
        .sl { animation: sl 0.16s ease both; }

        /* ── Main content entrance ── */
        @keyframes fu { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
        .fu { animation: fu 0.2s ease both; }

        /* ── card-animate classes used by ResultCards children ── */
        @keyframes card-rise {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .card-animate   { animation: card-rise 0.35s ease both; }
        .card-animate-1 { animation-delay: 0.05s; }
        .card-animate-2 { animation-delay: 0.15s; }
        .card-animate-3 { animation-delay: 0.25s; }

        /* ── Mobile ── */
        @media(max-width:820px){
          .hp { flex-direction:column; min-height:100%; overflow:auto; }
          .hp-side { width:100%; height:auto; border-right:none; border-bottom:1px solid #0e0e16; }
          .hp-side-list { max-height:200px; }
          .hp-main { height:auto; overflow:visible; }
          .hp-main > div { height:auto !important; overflow:visible !important; }
        }
      `}</style>

      <div className="hp">

        {/* ══════════════════ SIDEBAR ══════════════════ */}
        <aside className="hp-side">

          {/* Header */}
          <div className="hp-side-head">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700,
                  color: '#C9A227', letterSpacing: '3px', textTransform: 'uppercase',
                  margin: 0, display: 'flex', alignItems: 'center', gap: '7px',
                }}>
                  <span style={{
                    display: 'inline-block', width: '2px', height: '10px', borderRadius: '2px',
                    background: 'linear-gradient(to bottom,#C9A227,#C9A22728)',
                  }} />
                  Historique
                </h1>
                {!pageLoading && items.length > 0 && (
                  <p style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                    color: '#8c91a9', letterSpacing: '1.2px', margin: '4px 0 0 9px', textTransform: 'uppercase',
                  }}>
                    {items.length} analyse{items.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push('/analyze')}
                style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                  padding: '7px 12px', borderRadius: '8px', cursor: 'pointer',
                  background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.32)',
                  color: '#e3c66f', letterSpacing: '1px', transition: 'all 0.14s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.2)'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.46)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.12)'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.32)'; }}
              >
                + Analyser
              </button>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="hp-side-list">

            {/* Skeletons */}
            {pageLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px 0' }}>
                {[68, 55, 78, 62, 50].map((h, i) => (
                  <div key={i} className="sk" style={{ height: `${h}px`, animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
            )}

            {/* Error */}
            {!pageLoading && fetchError && (
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#bb4444', padding: '16px 8px', margin: 0 }}>
                ⚠ {fetchError}
              </p>
            )}

            {/* Empty */}
            {!pageLoading && !fetchError && items.length === 0 && (
              <div style={{ padding: '44px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  border: '1px solid rgba(201,162,39,0.18)',
                  background: 'rgba(201,162,39,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '18px', opacity: 0.7 }}>🗂</span>
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8c91a9', letterSpacing: '2px', margin: 0, textTransform: 'uppercase' }}>
                  Aucun historique
                </p>
                <button
                  onClick={() => router.push('/analyze')}
                  style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                    padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                    background: 'rgba(201,162,39,0.12)', border: '1px solid rgba(201,162,39,0.3)',
                    color: '#e3c66f', letterSpacing: '1px',
                  }}
                >→ Analyser</button>
              </div>
            )}

            {/* Items */}
            {!pageLoading && !fetchError && items.map((item, i) => (
              <div key={item.id} className="sl" style={{ animationDelay: `${Math.min(i * 18, 160)}ms` }}>
                <SidebarItem
                  item={item}
                  isSelected={selected?.id === item.id}
                  onSelect={setSelected}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>

          {/* Footer: clear all */}
          {!pageLoading && items.length > 0 && (
            <div className="hp-side-foot">
              <button
                onClick={handleClearAll}
                disabled={clearing}
                style={{
                  width: '100%', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px',
                  padding: '9px', borderRadius: '8px',
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  background: confirmClear ? 'rgba(180,40,40,0.14)' : 'rgba(255,255,255,0.02)',
                  border: confirmClear ? '1px solid rgba(180,40,40,0.28)' : '1px solid #1e1e2a',
                  color: confirmClear ? '#ff7a7a' : '#979db5',
                  transition: 'all 0.14s', letterSpacing: '1px',
                }}
                onMouseEnter={e => { if (!confirmClear && !clearing) e.currentTarget.style.color = '#d2d7ee'; }}
                onMouseLeave={e => { if (!confirmClear) e.currentTarget.style.color = '#979db5'; }}
              >
                {clearing ? '···' : confirmClear ? 'Confirmer la suppression ?' : 'Tout effacer'}
              </button>
            </div>
          )}
        </aside>

        {/* ══════════════════ MAIN CONTENT ══════════════════ */}
        <main className="hp-main">
          {selected ? (
            /* key forces remount + scroll-to-top animation on every item switch */
            <div key={selected.id} className="fu" style={{ height: '100%' }}>
              <AnalyzeReplay selected={selected} />
            </div>
          ) : (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '14px', opacity: 0.35,
            }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '13px',
                background: 'rgba(201,162,39,0.04)', border: '1px solid rgba(201,162,39,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>🗂</div>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '9px',
                letterSpacing: '2.5px', color: '#1e1e2a', textTransform: 'uppercase', margin: 0,
              }}>
                Sélectionnez une analyse
              </p>
            </div>
          )}
        </main>

      </div>
    </AppShell>
  );
}