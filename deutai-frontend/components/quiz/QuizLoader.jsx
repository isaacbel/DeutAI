'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

function SkeletonLine({ w }) {
  return (
    <div
      className="h-3 rounded-md overflow-hidden"
      style={{ width: w, background: 'rgba(255,255,255,0.04)' }}
    >
      <motion.div
        className="h-full w-1/2 rounded-md"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)',
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
        background: 'rgba(10,10,16,0.98)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
      }}
    >
      <p
        className="font-mono text-[11px] tracking-[0.22em] uppercase text-center mb-6"
        style={{ color: '#c9a227' }}
      >
        {t('quiz.generatingQuestions')}
      </p>
      <div className="space-y-4">
        <SkeletonLine w="100%" />
        <SkeletonLine w="85%" />
        <SkeletonLine w="92%" />
        <div className="pt-4 grid grid-cols-2 gap-3">
          <div className="h-10 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-10 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
      <p className="mt-6 text-center text-[12px] text-[#6b7088] font-sans">
        {t('quiz.generatingWait')}
      </p>
    </motion.div>
  );
}
