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
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0a10', color: '#e8e0c8' }} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
        {/* Background blobs */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16 relative z-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <Brain size={14} style={{ color: '#D4AF37' }} />
              <span className="font-mono text-[11px] tracking-[0.1em] font-semibold uppercase" style={{ color: '#D4AF37' }}>
                {t('questions.modeTest')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {t('questions.title')}
            </h1>
            <p className="text-lg" style={{ color: '#8890aa', maxWidth: '600px' }}>
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
                  className={`group relative flex flex-col p-6 lg:p-8 rounded-3xl overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
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
                      className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                       <ChevronRight size={16} style={lang === 'ar' ? { transform: 'scaleX(-1)' } : {}} /> {/* Fix #16 */}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#e8e0c8' }}>
                    {type.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 flex-grow" style={{ color: '#8890aa' }}>
                    {type.description}
                  </p>

                  <div className="flex items-center gap-2 mt-auto">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: type.color, boxShadow: `0 0 8px ${type.color}` }} />
                    <span className="font-mono text-xs tracking-wider uppercase font-semibold" style={{ color: type.color }}>
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
