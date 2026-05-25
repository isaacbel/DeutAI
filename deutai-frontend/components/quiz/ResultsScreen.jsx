'use client';

import { motion } from 'framer-motion';
import { RotateCcw, SlidersHorizontal, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

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
  const { t } = useLanguage();
  const ratio = maxScore > 0 ? score / maxScore : 0;
  const stars = starsFromRatio(ratio);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 sm:p-10 max-w-2xl mx-auto"
      style={{
        background: 'white',
        border: '1px solid var(--color-border)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(156,123,172,0.12)',
      }}
    >
      <p
        className="text-[15px] tracking-[0.22em] uppercase text-center mb-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {t('quiz.resultsTitle')}{categoryTitle}
      </p>
      <h2
        className="text-center font-sans text-[22px] sm:text-[26px] font-semibold mb-2"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {score} / {maxScore} {t('quiz.points')}
      </h2>

      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            size={28}
            className={s <= stars ? 'fill-[var(--color-primary)]/35' : ''}
            style={{ color: s <= stars ? 'var(--color-primary)' : 'var(--color-border)' }}
          />
        ))}
      </div>

      {wrongItems.length > 0 && (
        <div className="mb-8">
          <p className="text-[15px] tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--color-primary)' }}>
            {t('quiz.answersToReview')}
          </p>
          <ul className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {wrongItems.map((w, i) => (
              <li
                key={i}
                className="rounded-xl p-3 text-[15px] font-sans"
                style={{
                  background: 'rgba(156,123,172,0.05)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <p className="text-[13px] mb-1 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  {t('quiz.yourAnswer')} <span style={{ color: 'var(--color-error)' }}>{w.question.type === 'true_false' ? (w.userAnswer === 'true' ? t('quiz.true') : t('quiz.false')) : (w.userAnswer || '—')}</span>
                </p>
                <p className="mb-1" style={{ color: 'var(--color-text-primary)' }}>{w.question.question}</p>
                <p className="text-[14px]" style={{ color: 'var(--color-success)' }}>{t('quiz.correctAnswer')} {w.question.type === 'true_false' ? (w.question.correctAnswer === 'true' ? t('quiz.true') : t('quiz.false')) : w.question.correctAnswer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {wrongItems.length === 0 && (
        <p className="text-center text-[14px] font-sans mb-8" style={{ color: 'var(--color-success)' }}>
          {t('quiz.perfectScore')}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 text-[15px] tracking-[0.12em] uppercase py-3 rounded-xl"
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
          }}
        >
          <RotateCcw size={16} />
          {t('quiz.restart')}
        </button>
        <button
          type="button"
          onClick={onChangeDifficulty}
          className="flex-1 flex items-center justify-center gap-2 text-[15px] tracking-[0.12em] uppercase py-3 rounded-xl"
          style={{
            background: 'rgba(156,123,172,0.07)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-primary)',
          }}
        >
          <SlidersHorizontal size={16} />
          {t('quiz.changeDifficulty')}
        </button>
      </div>
    </motion.div>
  );
}
