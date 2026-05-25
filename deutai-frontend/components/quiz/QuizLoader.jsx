'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

function SkeletonLine({ w }) {
  return (
    <div
      className="h-3 rounded-md overflow-hidden"
      style={{ width: w, background: 'rgba(156,123,172,0.08)' }}
    >
      <motion.div
        className="h-full w-1/2 rounded-md"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(156,123,172,0.2), transparent)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
      />
    </div>
  );
}

export default function QuizLoader() {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-8 max-w-lg mx-auto"
      style={{
        background: 'white',
        border: '1px solid var(--color-border)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(156,123,172,0.12)',
      }}
    >
      <p
        className="text-[15px] tracking-[0.22em] uppercase text-center mb-6"
        style={{ color: 'var(--color-primary)' }}
      >
        {t('quiz.generatingQuestions')}
      </p>
      <div className="space-y-4">
        <SkeletonLine w="100%" />
        <SkeletonLine w="85%" />
        <SkeletonLine w="92%" />
        <div className="pt-4 grid grid-cols-2 gap-3">
          <div className="h-10 rounded-lg" style={{ background: 'rgba(156,123,172,0.07)' }} />
          <div className="h-10 rounded-lg" style={{ background: 'rgba(156,123,172,0.07)' }} />
        </div>
      </div>
      <p className="mt-6 text-center text-[14px] font-sans" style={{ color: 'var(--color-text-muted)' }}>
        {t('quiz.generatingWait')}
      </p>
    </motion.div>
  );
}
