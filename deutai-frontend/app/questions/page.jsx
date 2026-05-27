'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, BookOpen, MessageCircle, FileText, ChevronRight, Zap } from 'lucide-react';
import AppShell from '@/components/Layout/AppShell';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function QuestionsPage() {
  const { t, lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fix: useMemo MUST be called before any conditional return (Rules of Hooks).
  // Previously this was placed after `if (!mounted) return null` — that causes
  // a React crash in strict mode because hooks cannot follow a conditional return.
  const QUESTION_TYPES = useMemo(() => [
    {
      id: 'vocabulaire',
      title: t('questions.vocabulaire'),
      description: t('questions.vocabulaireDesc'),
      icon: BookOpen,
      color: '#C9A227',
      glow: 'rgba(201,162,39,0.4)',
      questionsCount: 150,
    },
    {
      id: 'grammaire',
      title: t('questions.grammaire'),
      description: t('questions.grammaireDesc'),
      icon: FileText,
      color: '#4DA8DA',
      glow: 'rgba(77,168,218,0.4)',
      questionsCount: 85,
    },
    {
      id: 'conjugaison',
      title: t('questions.conjugaison'),
      description: t('questions.conjugaisonDesc'),
      icon: Zap,
      color: '#E06C6C',
      glow: 'rgba(224,108,108,0.4)',
      questionsCount: 120,
    },
    {
      id: 'comprehension',
      title: t('questions.comprehension'),
      description: t('questions.comprehensionDesc'),
      icon: MessageCircle,
      color: '#7B61FF',
      glow: 'rgba(123,97,255,0.4)',
      questionsCount: 45,
    },
  ], [t]);

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--color-bg-ice)', color: 'var(--color-text-primary)' }} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
        {/* Background wash */}
        <div
          className="absolute inset-0 opacity-100 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 75% 35% at 50% 0%, rgba(156,123,172,0.08) 0%, transparent 65%)' }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 relative z-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-12"
          >
            <div
              className="inline-flex min-h-11 items-center gap-2 px-3 py-2 rounded-lg mb-4"
              style={{ background: 'rgba(156,123,172,0.1)', border: '1px solid rgba(156,123,172,0.2)' }}
            >
              <Brain size={14} style={{ color: 'var(--color-primary)' }} />
              <span className="text-[15px] tracking-[0.1em] font-semibold uppercase" style={{ color: 'var(--color-primary)' }}>
                {t('questions.modeTest')}
              </span>
            </div>
            <h1 className="text-[30px] sm:text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--color-text-primary)' }}>
              {t('questions.title')}
            </h1>
            <p className="text-[16px] sm:text-lg leading-relaxed" style={{ color: 'var(--color-text-muted)', maxWidth: '600px' }}>
              {t('questions.subtitle')}
            </p>
          </motion.div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {QUESTION_TYPES.map((type, idx) => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={type.id}
                  onClick={() => router.push(`/quiz/${type.id}`)} // Fix #15 — template literal
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + idx * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex flex-col p-5 sm:p-6 lg:p-8 rounded-2xl min-h-[220px] overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  style={{
                    background: 'white',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 20px rgba(156,123,172,0.08)',
                  }}
                >
                  {/* Hover Glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 80% 20%, ${type.glow} 0%, transparent 60%)` }}
                  />

                  <div className="flex justify-between items-start mb-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${type.color}33, ${type.color}11)`,
                        border: `1px solid ${type.color}44`,
                        color: type.color,
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transform sm:translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                      style={{ background: 'rgba(156,123,172,0.12)', color: 'var(--color-primary)' }}
                    >
                       <ChevronRight size={16} style={lang === 'ar' ? { transform: 'scaleX(-1)' } : {}} /> {/* Fix #16 */}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                    {type.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 flex-grow" style={{ color: 'var(--color-text-muted)' }}>
                    {type.description}
                  </p>

                  <div className="flex items-center gap-2 mt-auto">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: type.color, boxShadow: `0 0 8px ${type.color}` }} />
                    <span className="font-mono text-sm tracking-wider uppercase font-semibold" style={{ color: type.color }}>
                      {t('questions.questionsAvailable', { count: type.questionsCount })}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

        </div>
      </div>
    </AppShell>
  );
}
