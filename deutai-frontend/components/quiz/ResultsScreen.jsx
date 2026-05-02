'use client';

import { motion } from 'framer-motion';
import { RotateCcw, SlidersHorizontal, Star } from 'lucide-react';

function starsFromRatio(ratio) {
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}

export default function ResultsScreen({
  score,
  maxScore,
  wrongItems,
  onRestart,
  onChangeDifficulty,
  categoryTitle,
}) {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  const stars = starsFromRatio(ratio);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto"
      style={{
        background: 'rgba(10,10,16,0.98)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}
    >
      <p
        className="font-mono text-[10px] tracking-[0.22em] uppercase text-center mb-2"
        style={{ color: '#8a90a8' }}
      >
        Résultats — {categoryTitle}
      </p>
      <h2
        className="text-center font-sans text-[22px] sm:text-[26px] font-semibold mb-2"
        style={{ color: '#f1d98d' }}
      >
        {score} / {maxScore} points
      </h2>

      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            size={28}
            className={s <= stars ? 'text-[#c9a227] fill-[#c9a227]/35' : 'text-[#3a3a48]'}
          />
        ))}
      </div>

      {wrongItems.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-3" style={{ color: '#c9a227' }}>
            Réponses à revoir
          </p>
          <ul className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {wrongItems.map((w, i) => (
              <li
                key={i}
                className="rounded-xl p-3 text-[13px] font-sans"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#b8bdd4',
                }}
              >
                <p className="text-[#8a90a8] text-[11px] font-mono mb-1 uppercase tracking-wider">
                  Votre réponse : <span className="text-red-300">{w.userAnswer || '—'}</span>
                </p>
                <p className="text-[#e8e8f0] mb-1">{w.question.question}</p>
                <p className="text-[#f1d98d] text-[12px]">Correct : {w.question.correctAnswer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {wrongItems.length === 0 && (
        <p className="text-center text-[14px] font-sans mb-8" style={{ color: '#6ee7b7' }}>
          Parfait ! Aucune erreur.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase py-3 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #c9a227, #e8d48a)',
            color: '#0a0a0c',
            border: 'none',
          }}
        >
          <RotateCcw size={16} />
          Recommencer
        </button>
        <button
          type="button"
          onClick={onChangeDifficulty}
          className="flex-1 flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase py-3 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#c9a227',
          }}
        >
          <SlidersHorizontal size={16} />
          Changer de difficulté
        </button>
      </div>
    </motion.div>
  );
}
