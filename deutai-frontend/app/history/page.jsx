'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/Layout/AppShell';
import ResultCards from '@/components/Analyzer/ResultCards';
import { useAuthStandalone } from '@/lib/auth';
import { getHistory, deleteHistoryItem, clearHistory } from '@/lib/api';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

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
    hasError: row.has_error,
    hasErrors: row.has_error,
    errors,
    originalSentence: row.input_text,
    input: row.input_text,
    correctedSentence: row.correction,
    correction: row.correction,
    rule: row.rule,
    globalExplanation: row.global_explanation,
    exercises,
    errorType: row.error_type,
  };
}

function fmtDate(d, lang) {
  // Fix: 'ar-EG' produces Eastern Arabic-Indic numerals (٩،٨…).
  // The Unicode extension -u-nu-latn forces Western (Latin) digits (0-9).
  const locale = lang === 'ar' ? 'ar-EG-u-nu-latn' : 'de-DE';
  return new Date(d).toLocaleDateString(locale, {
    day: '2-digit', month: 'short', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtRelative(d, t, lang) {
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return t('history.today');
  if (diff === 1) return t('history.yesterday');
  // Fix: use locale-aware format with Latin numerals instead of browser default
  const locale = lang === 'ar' ? 'ar-EG-u-nu-latn' : 'de-DE';
  return new Date(d).toLocaleDateString(locale, { day: '2-digit', month: 'short' });
}

function SidebarItem({ item, isSelected, onSelect, onDelete, t, lang }) {
  const [hovered, setHovered] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  let errCount = 0;
  if (Array.isArray(item.errors_json)) {
    errCount = item.errors_json.length;
  } else if (typeof item.errors_json === 'string') {
    try {
      const parsed = JSON.parse(item.errors_json || '[]');
      errCount = Array.isArray(parsed) ? parsed.length : 0;
    } catch { errCount = 0; }
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
        minHeight: '72px',
        background: isSelected
          ? 'rgba(156,123,172,0.1)'
          : hovered ? 'rgba(156,123,172,0.04)' : 'transparent',
        border: `1px solid ${isSelected ? 'rgba(156,123,172,0.3)' : 'var(--color-border)'}`,
        transition: 'background 0.14s, border-color 0.14s, box-shadow 0.14s, transform 0.12s',
        userSelect: 'none',
        boxShadow: isSelected ? '0 4px 16px rgba(156,123,172,0.15)' : 'none',
        transform: hovered && !isSelected ? 'translateX(1px)' : 'none',
      }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute', left: 0, top: '16%', bottom: '16%',
          width: '2px', borderRadius: '0 2px 2px 0',
          background: 'linear-gradient(to bottom, var(--color-primary), rgba(156,123,172,0.2))',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{
          fontSize: '11px',
          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)', letterSpacing: '0.5px',
        }}>
          {fmtRelative(item.created_at, t, lang)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {item.source === 'image' && (
            <span style={{ fontSize: '8px', opacity: 0.3 }}>📷</span>
          )}
          {item.has_error ? (
            <span style={{
              fontSize: '9px',
              padding: '1px 5px', borderRadius: '3px',
              background: 'rgba(180,60,60,0.08)',
              border: '1px solid rgba(180,60,60,0.18)',
              color: '#c0392b',
            }}>
              {errCount > 0 ? `${errCount}✗` : '✗'}
            </span>
          ) : (
            <span style={{
              fontSize: '9px',
              padding: '1px 5px', borderRadius: '3px',
              background: 'rgba(124,176,120,0.1)',
              border: '1px solid rgba(124,176,120,0.25)',
              color: 'var(--color-success)',
            }}>✓</span>
          )}
        </div>
      </div>

      <p style={{
        margin: 0,
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: '14.5px', lineHeight: 1.5,
        color: isSelected ? 'var(--color-text-primary)' : hovered ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        paddingRight: hovered ? '20px' : '0',
        transition: 'color 0.12s',
      }}>
        {item.input_text}
      </p>

      {(hovered || confirmDel) && (
        <button
          onClick={handleDel}
          style={{
            position: 'absolute', bottom: '9px', right: '9px',
            background: confirmDel ? 'rgba(180,40,40,0.15)' : 'rgba(242,248,252,0.98)',
            border: confirmDel ? '1px solid rgba(180,40,40,0.4)' : '1px solid var(--color-border)',
            borderRadius: '6px', padding: '4px 9px', cursor: 'pointer', minHeight: '44px',
            fontSize: '11px',
            color: confirmDel ? '#c0392b' : 'var(--color-text-muted)',
            transition: 'all 0.12s',
          }}
        >
          {confirmDel ? t('history.confirmDelete') : 'DEL'}
        </button>
      )}
    </div>
  );
}

function AnalyzeReplay({ selected, lang }) {
  const result = buildResult(selected);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selected.id]);

  return (
    <div
      ref={scrollRef}
      style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}
    >
      <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 18px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '11px',
            color: 'var(--color-text-muted)', letterSpacing: '2px', textTransform: 'uppercase',
            padding: '3px 12px', borderRadius: '20px',
            border: '1px solid var(--color-border)',
            background: 'white',
          }}>
            {fmtDate(selected.created_at, lang)}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              width: 'min(860px, 100%)',
              borderRadius: '16px',
              background: 'white',
              border: '1px solid var(--color-border)',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{
                  fontSize: '11px', letterSpacing: '2.5px',
                  textTransform: 'uppercase', color: 'var(--color-text-muted)',
                }}>
                  You
                </span>
                <span style={{
                  fontSize: '10px', letterSpacing: '1px', color: 'var(--color-text-muted)',
                }}>
                  {selected.source === 'image' ? '📷 IMAGE' : '✎ TEXT'}
                </span>
              </div>
              <p style={{
                margin: '10px 0 0',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '16px', lineHeight: 1.8, color: 'var(--color-text-primary)', wordBreak: 'break-word',
              }}>
                {selected.input_text}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              width: 'min(920px, 100%)',
              borderRadius: '16px',
              background: 'rgba(156,123,172,0.06)',
              border: '1px solid rgba(156,123,172,0.2)',
              padding: '14px 16px',
            }}>
              <span style={{
                fontSize: '11px', letterSpacing: '2.5px',
                textTransform: 'uppercase', color: 'var(--color-primary)',
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

export default function HistoryPage() {
  const { t, lang } = useLanguage();
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
      if (!res.ok) { setFetchError(t('history.errorLoadHistory')); return; }
      const data = await res.json();
      setItems(data.history || []);
    } catch { setFetchError(t('history.errorNetwork')); }
    finally { setPageLoading(false); }
  }, [t]);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  useEffect(() => {
    if (pageLoading) return;
    if (items.length === 0) { if (selected) setSelected(null); return; }
    const stillExists = selected && items.some((it) => it.id === selected.id);
    if (!stillExists) setSelected(items[0]);
  }, [items, selected, pageLoading]);

  async function handleDelete(id) {
    try {
      const res = await deleteHistoryItem(id);
      if (!res.ok) { setFetchError(t('history.errorDeleteFailed')); return; }
      setItems(prev => prev.filter(i => i.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      setFetchError(t('history.errorNetwork'));
    }
  }

  async function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setClearing(true);
    try {
      const res = await clearHistory();
      // Bug fix: clearHistory returns 204 No Content — do NOT call res.json()
      if (!res.ok) { setFetchError(t('history.errorClearFailed')); return; }
      setItems([]); setSelected(null);
      setConfirmClear(false);
    } catch {
      setFetchError(t('history.errorNetwork'));
    } finally {
      setClearing(false);
    }
  }

  return (
    <AppShell>
      <style>{`
        .hp { display:flex; min-height:100vh; overflow:hidden; background:var(--color-bg-ice); }

        .hp-side {
          width: 270px; flex-shrink: 0;
          display: flex; flex-direction: column;
          background: white; border-right: 1px solid var(--color-border);
          height: 100vh; overflow: hidden;
        }
        .hp-side-head {
          padding: 18px 14px 14px; border-bottom: 1px solid var(--color-border);
          flex-shrink: 0;
          background: linear-gradient(to bottom, rgba(156,123,172,0.04), rgba(156,123,172,0));
        }
        .hp-side-list { flex: 1 1 auto; overflow-y: auto; padding: 6px; }
        .hp-side-list::-webkit-scrollbar { width: 3px; }
        .hp-side-list::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
        .hp-side-foot { padding: 10px; border-top: 1px solid var(--color-border); flex-shrink: 0; }

        .hp-main {
          flex: 1 1 auto; display: flex; flex-direction: column;
          overflow: hidden; background: var(--color-bg-ice);
        }
        .hp-main *::-webkit-scrollbar { width: 4px; }
        .hp-main *::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }

        @keyframes sk { 0%{background-position:-280px 0}100%{background-position:280px 0} }
        .sk {
          border-radius: 8px;
          background: linear-gradient(90deg,#e4ecf4 25%,#eef4f9 50%,#e4ecf4 75%);
          background-size: 280px 100%; animation: sk 1.3s infinite linear;
        }

        @keyframes sl { from{opacity:0;transform:translateX(-4px)}to{opacity:1;transform:translateX(0)} }
        .sl { animation: sl 0.16s ease both; }

        @keyframes fu { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
        .fu { animation: fu 0.2s ease both; }

        @keyframes card-rise { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        .card-animate   { animation: card-rise 0.35s ease both; }
        .card-animate-1 { animation-delay: 0.05s; }
        .card-animate-2 { animation-delay: 0.15s; }
        .card-animate-3 { animation-delay: 0.25s; }

        @media(max-width:820px){
          .hp { flex-direction:column; min-height:100svh; overflow:auto; }
          .hp-side { width:100%; height:auto; border-right:none; border-bottom:1px solid var(--color-border); }
          .hp-side-head { padding: 14px; }
          .hp-side-list { max-height:240px; padding: 8px; }
          .hp-main { height:auto; overflow:visible; }
          .hp-main > div { height:auto !important; overflow:visible !important; }
        }
      `}</style>

      <div className="hp">

        {/* ══ SIDEBAR ══ */}
        <aside className="hp-side">

          <div className="hp-side-head">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{
                  fontSize: '14px', fontWeight: 700,
                  color: 'var(--color-primary)', letterSpacing: '3px', textTransform: 'uppercase',
                  margin: 0, display: 'flex', alignItems: 'center', gap: '7px',
                }}>
                  <span style={{
                    display: 'inline-block', width: '2px', height: '10px', borderRadius: '2px',
                    background: 'linear-gradient(to bottom, var(--color-primary), rgba(156,123,172,0.2))',
                  }} />
                  {t('history.title')}
                </h1>
                {!pageLoading && items.length > 0 && (
                  <p style={{
                    fontSize: '12px', color: 'var(--color-text-muted)',
                  }}>
                    {t(items.length !== 1 ? 'history.analyses_other' : 'history.analyses_one', { count: items.length })}
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push('/analyze')}
                style={{
                  fontSize: '12px',
                  padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', minHeight: '44px',
                  background: 'rgba(156,123,172,0.1)', border: '1px solid rgba(156,123,172,0.3)',
                  color: 'var(--color-primary)', letterSpacing: '1px', transition: 'all 0.14s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(156,123,172,0.18)'; e.currentTarget.style.borderColor = 'rgba(156,123,172,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(156,123,172,0.1)'; e.currentTarget.style.borderColor = 'rgba(156,123,172,0.3)'; }}
              >
                {t('history.analyzeNew')}
              </button>
            </div>
          </div>

          <div className="hp-side-list">

            {pageLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '4px 0' }}>
                {[68, 55, 78, 62, 50].map((h, i) => (
                  <div key={i} className="sk" style={{ height: `${h}px`, animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
            )}

            {!pageLoading && fetchError && (
              <p style={{ fontSize: '13px', color: '#c0392b', padding: '16px 8px', margin: 0 }}>
                ⚠ {fetchError}
              </p>
            )}

            {!pageLoading && !fetchError && items.length === 0 && (
              <div style={{ padding: '44px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  border: '1px solid rgba(156,123,172,0.2)',
                  background: 'rgba(156,123,172,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '18px', opacity: 0.7 }}>🗂</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', letterSpacing: '2px', margin: 0, textTransform: 'uppercase' }}>
                  {t('history.noHistory')}
                </p>
                <button
                  onClick={() => router.push('/analyze')}
                  style={{
                    fontSize: '12px',
                    padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', minHeight: '44px',
                    background: 'rgba(156,123,172,0.1)', border: '1px solid rgba(156,123,172,0.3)',
                    color: 'var(--color-primary)', letterSpacing: '1px',
                  }}
                >{t('history.analyzeNow')}</button>
              </div>
            )}

            {!pageLoading && !fetchError && items.map((item, i) => (
              <div key={item.id} className="sl" style={{ animationDelay: `${Math.min(i * 18, 160)}ms` }}>
                <SidebarItem
                  item={item}
                  isSelected={selected?.id === item.id}
                  onSelect={setSelected}
                  onDelete={handleDelete}
                  t={t}
                  lang={lang}
                />
              </div>
            ))}
          </div>

          {!pageLoading && items.length > 0 && (
            <div className="hp-side-foot">
              <button
                onClick={handleClearAll}
                disabled={clearing}
                style={{
                  width: '100%', fontSize: '12px',
                  padding: '9px', borderRadius: '8px', minHeight: '44px',
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  background: confirmClear ? 'rgba(180,40,40,0.1)' : 'rgba(156,123,172,0.05)',
                  border: confirmClear ? '1px solid rgba(180,40,40,0.3)' : '1px solid var(--color-border)',
                  color: confirmClear ? '#c0392b' : 'var(--color-text-muted)',
                  transition: 'all 0.14s', letterSpacing: '1px',
                }}
                onMouseEnter={e => { if (!confirmClear && !clearing) e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                onMouseLeave={e => { if (!confirmClear) e.currentTarget.style.color = 'var(--color-text-muted)'; }}
              >
                {clearing ? t('history.clearing') : confirmClear ? t('history.confirmClearAll') : t('history.clearAll')}
              </button>
            </div>
          )}
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main className="hp-main">
          {selected ? (
            <div key={selected.id} className="fu" style={{ height: '100%' }}>
              <AnalyzeReplay selected={selected} lang={lang} />
            </div>
          ) : (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '14px', opacity: 0.4,
            }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '13px',
                background: 'rgba(156,123,172,0.06)', border: '1px solid rgba(156,123,172,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>🗂</div>
              <p style={{
                fontSize: '13px',
                letterSpacing: '2.5px', color: 'var(--color-text-muted)', textTransform: 'uppercase', margin: 0,
              }}>
                {t('history.selectAnalysis')}
              </p>
            </div>
          )}
        </main>

      </div>
    </AppShell>
  );
}
