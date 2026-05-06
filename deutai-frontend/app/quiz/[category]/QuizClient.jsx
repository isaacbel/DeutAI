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
      style={{ background: '#08080a', color: '#e8e8f0' }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      lang={lang}
    >
      <div
        className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between gap-3"
        style={{
          background: 'rgba(8,8,10,0.92)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase"
          style={{ color: '#8a90a8' }}
        >
          <ArrowLeft size={14} />
          {t('quiz.home')}
        </Link>
        {phase === 'quiz' && questions.length > 0 && (
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <ProgressBar current={currentIndex + 1} total={questions.length} />
          </div>
        )}
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: '#c9a227' }}>
          {t('quiz.title')}
        </span>
      </div>

      {phase === 'quiz' && questions.length > 0 && (
        <div className="px-4 pt-4 sm:hidden">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
      )}

      <div className="px-4 py-8 max-w-3xl mx-auto">
        {phase === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 sm:p-10"
            style={{
              background: 'rgba(10,10,16,0.98)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-[#c9a227]" size={20} />
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: '#c9a227' }}>
                DeutAI
              </span>
            </div>
            <h1 className="font-sans text-[24px] sm:text-[28px] font-semibold mb-2" style={{ color: '#f1d98d' }}>
              {title}
            </h1>
            <p className="text-[14px] leading-relaxed mb-8" style={{ color: '#8a90a8' }}>
              {meta?.description}
            </p>

            <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-3" style={{ color: '#6b7088' }}>
              {t('quiz.difficulty')}
            </p>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />

            {genError && (
              <div
                className="mt-6 rounded-xl p-4 text-[13px]"
                style={{
                  background: 'rgba(180,60,60,0.12)',
                  border: '1px solid rgba(180,60,60,0.25)',
                  color: '#fca5a5',
                }}
              >
                {genError}
                <button
                  type="button"
                  onClick={startQuiz}
                  className="mt-3 block font-mono text-[10px] uppercase tracking-wider underline"
                  style={{ color: '#f1d98d' }}
                >
                  {t('quiz.retry')}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={startQuiz}
              className="mt-8 w-full sm:w-auto font-mono text-[11px] tracking-[0.16em] uppercase py-3.5 px-10 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #c9a227, #e8d48a)',
                color: '#0a0a0c',
                border: 'none',
                boxShadow: '0 4px 24px rgba(201,162,39,0.35)',
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
