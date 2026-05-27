'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getCategoryMeta } from '@/lib/quiz/categories';
import { generateQuiz } from '@/lib/api';
import DifficultySelector from '@/components/quiz/DifficultySelector';
import ProgressBar from '@/components/quiz/ProgressBar';
import QuestionCard from '@/components/quiz/QuestionCard';
import ResultsScreen from '@/components/quiz/ResultsScreen';
import QuizLoader from '@/components/quiz/QuizLoader';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const QUESTION_COUNT = 10;

export default function QuizClient({ slug }) {
  const { t, lang } = useLanguage();
  const meta = getCategoryMeta(slug);

  const [phase, setPhase] = useState('welcome');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongItems, setWrongItems] = useState([]);
  const [genError, setGenError] = useState('');

  const maxScore = questions.reduce((a, q) => a + (q.points || 1), 0);

  const startQuiz = useCallback(async () => {
    setGenError('');
    setPhase('loading');
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setWrongItems([]);

    try {
      const res = await generateQuiz(slug, difficulty, QUESTION_COUNT, lang);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGenError(data.message || t('quiz.errorGenerate'));
        setPhase('welcome');
        return;
      }
      setQuestions(data.questions || []);
      setPhase('quiz');
    } catch {
      setGenError(t('quiz.errorNetwork'));
      setPhase('welcome');
    }
  }, [slug, difficulty, lang, t]);

  const handleAdvance = useCallback(
    ({ correct, userAnswer, question }) => {
      if (correct) {
        setScore((s) => s + (question.points || 1));
      } else {
        setWrongItems((w) => [...w, { question, userAnswer }]);
      }

      const next = currentIndex + 1;
      if (next >= questions.length) {
        setPhase('results');
        return;
      }
      setCurrentIndex(next);
    },
    [currentIndex, questions.length]
  );

  const handleRestart = useCallback(() => {
    setPhase('loading');
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setWrongItems([]);
    startQuiz();
  }, [startQuiz]);

  const handleChangeDifficulty = useCallback(() => {
    setPhase('welcome');
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setWrongItems([]);
  }, []);

  const currentQuestion = questions[currentIndex];
  const title = meta?.title ?? slug;

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: 'var(--color-bg-ice)', color: 'var(--color-text-primary)' }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      lang={lang}
    >
      <div
        className="sticky top-0 z-20 px-3 sm:px-4 py-3 flex items-center justify-between gap-3"
        style={{
          background: 'rgba(242,248,252,0.92)',
          borderBottom: '1px solid var(--color-border)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-[15px] tracking-[0.1em] sm:tracking-[0.14em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={14} />
          {t('quiz.home')}
        </Link>
        {phase === 'quiz' && questions.length > 0 && (
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <ProgressBar current={currentIndex + 1} total={questions.length} />
          </div>
        )}
        <span className="text-[15px] tracking-[0.12em] sm:tracking-[0.18em] uppercase" style={{ color: 'var(--color-primary)' }}>
          {t('quiz.title')}
        </span>
      </div>

      {phase === 'quiz' && questions.length > 0 && (
        <div className="px-4 pt-4 sm:hidden">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
      )}

      <div className="px-3 sm:px-4 py-6 sm:py-8 max-w-3xl mx-auto">
        {phase === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 sm:p-10"
            style={{
              background: 'white',
              border: '1px solid var(--color-border)',
              boxShadow: '0 8px 32px rgba(156,123,172,0.12)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles style={{ color: 'var(--color-primary)' }} size={20} />
              <span className="text-[15px] tracking-[0.22em] uppercase" style={{ color: 'var(--color-primary)' }}>
                DeutAI
              </span>
            </div>
            <h1 className="font-sans text-[24px] sm:text-[28px] font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h1>
            <p className="text-[14px] leading-relaxed mb-8" style={{ color: 'var(--color-text-muted)' }}>
              {meta?.description}
            </p>

            <p className="text-[14px] tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--color-text-muted)' }}>
              {t('quiz.difficulty')}
            </p>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />

            {genError && (
              <div
                className="mt-6 rounded-xl p-4 text-[15px]"
                style={{
                  background: 'rgba(204,85,85,0.07)',
                  border: '1px solid rgba(204,85,85,0.25)',
                  color: 'var(--color-error)',
                }}
              >
                {genError}
                <button
                  type="button"
                  onClick={startQuiz}
                  className="mt-3 inline-flex min-h-11 items-center text-[14px] uppercase tracking-wider underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {t('quiz.retry')}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={startQuiz}
              className="mt-8 w-full sm:w-auto min-h-12 text-[15px] tracking-[0.12em] uppercase py-3.5 px-10 rounded-xl"
              style={{
                background: 'var(--color-primary)',
                color: '#121212',
                border: 'none',
                boxShadow: '0 4px 20px rgba(156,123,172,0.35)',
              }}
            >
              {t('quiz.start', { count: QUESTION_COUNT })}
            </button>
          </motion.div>
        )}

        {phase === 'loading' && <QuizLoader />}

        {phase === 'quiz' && currentQuestion && (
          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              onAdvance={handleAdvance}
            />
          </AnimatePresence>
        )}

        {phase === 'results' && (
          <ResultsScreen
            score={score}
            maxScore={maxScore || QUESTION_COUNT}
            wrongItems={wrongItems}
            onRestart={handleRestart}
            onChangeDifficulty={handleChangeDifficulty}
            categoryTitle={title}
          />
        )}
      </div>
    </div>
  );
}
