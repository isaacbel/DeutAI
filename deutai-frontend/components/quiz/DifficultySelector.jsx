'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function DifficultySelector({ value, onChange }) {
  const { t } = useLanguage();

  const LEVELS = [
    { id: 'easy', label: t('quiz.diffEasy'), hint: t('quiz.diffHintEasy') },
    { id: 'medium', label: t('quiz.diffMedium'), hint: t('quiz.diffHintMedium') },
    { id: 'hard', label: t('quiz.diffHard'), hint: t('quiz.diffHintHard') },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {LEVELS.map((lvl) => {
        const active = value === lvl.id;
        return (
          <motion.button
            key={lvl.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(lvl.id)}
            className="rounded-xl px-4 py-3 text-left transition-all duration-200"
            style={{
              background: active ? 'rgba(156,123,172,0.10)' : 'white',
              border: active ? '1px solid rgba(156,123,172,0.35)' : '1px solid var(--color-border)',
              boxShadow: active ? '0 0 20px rgba(156,123,172,0.10)' : 'none',
            }}
          >
            <span
              className="block font-mono text-[15px] tracking-[0.14em] uppercase"
              style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
            >
              {lvl.label}
            </span>
            <span
              className="block mt-1 text-[14px] font-sans"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {lvl.hint}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
