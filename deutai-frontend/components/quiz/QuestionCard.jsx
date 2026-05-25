'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

function normalizeText(s) {
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function isAnswerCorrect(question, rawUser) {
  const correct = String(question.correctAnswer ?? '').trim();
  const user = String(rawUser ?? '').trim();
  if (question.type === 'true_false') {
    return user === correct;
  }
  if (question.type === 'multiple_choice') {
    return normalizeText(user) === normalizeText(correct);
  }
  return normalizeText(user) === normalizeText(correct);
}

const TYPE_LABELS = {
  multiple_choice: 'QCM',
  true_false: 'Vrai / Faux',
  fill_blank: 'À trous',
  translation: 'Traduction',
};

export default function QuestionCard({ question, onAdvance, questionNumber, totalQuestions }) {
  const { t } = useLanguage();
  const [choice, setChoice] = useState('');
  const [textValue, setTextValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  const resetLocal = useCallback(() => {
    setChoice('');
    setTextValue('');
    setSubmitted(false);
    setCorrect(false);
    setUserAnswer('');
  }, []);

  const handleSubmit = () => {
    let ua = '';
    if (question.type === 'multiple_choice') ua = choice;
    else if (question.type === 'true_false') ua = choice;
    else ua = textValue;

    if (!ua.trim() && question.type !== 'true_false') return;
    if (question.type === 'true_false' && !choice) return;

    const ok = isAnswerCorrect(question, ua);
    setUserAnswer(ua);
    setCorrect(ok);
    setSubmitted(true);
  };

  const handleContinue = () => {
    onAdvance({
      correct,
      userAnswer,
      question,
    });
    resetLocal();
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto"
      style={{
        background: 'white',
        border: '1px solid var(--color-border)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(156,123,172,0.10)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="text-[14px]" style={{ color: 'var(--color-text-muted)' }}>
          Question {questionNumber}/{totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-[13px] tracking-[0.18em] uppercase px-2 py-1 rounded-md"
            style={{
              background: 'rgba(156,123,172,0.1)',
              border: '1px solid rgba(156,123,172,0.22)',
              color: 'var(--color-primary)',
            }}
          >
            {t(`quiz.type_${question.type}`) || question.type}
          </span>
          <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            +{question.points} {t('quiz.pts')}
          </span>
        </div>
      </div>

      <p
        className="font-sans text-[16px] sm:text-[17px] leading-relaxed mb-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {question.question}
      </p>

      {!submitted && question.type === 'multiple_choice' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt, i) => {
            const active = choice === opt;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setChoice(opt)}
                className="text-left rounded-xl px-4 py-3 text-[14px] font-sans transition-all duration-150"
                style={{
                  background: active ? 'rgba(156,123,172,0.1)' : 'white',
                  border: active ? '1px solid rgba(156,123,172,0.4)' : '1px solid var(--color-border)',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {!submitted && question.type === 'true_false' && (
        <div className="flex gap-3">
          {[ { id: 'true', label: t('quiz.true') }, { id: 'false', label: t('quiz.false') } ].map((v) => {
            const active = choice === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setChoice(v.id)}
                className="flex-1 rounded-xl py-3 font-mono text-[14px] tracking-[0.12em] uppercase"
                style={{
                  background: active ? 'rgba(156,123,172,0.1)' : 'white',
                  border: active ? '1px solid rgba(156,123,172,0.4)' : '1px solid var(--color-border)',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      )}

      {!submitted && (question.type === 'fill_blank' || question.type === 'translation') && (
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          rows={question.type === 'translation' ? 4 : 2}
          placeholder={t('quiz.yourAnswerGerman')}
          className="w-full rounded-xl px-4 py-3 font-sans text-[14px] outline-none resize-none"
          style={{
            background: 'var(--color-bg-sidebar)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
      )}

      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            question.type === 'true_false' || question.type === 'multiple_choice'
              ? !choice
              : !textValue.trim()
          }
          className="mt-6 w-full sm:w-auto text-[15px] tracking-[0.16em] uppercase py-3 px-8 rounded-xl disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 20px rgba(156,123,172,0.3)',
          }}
        >
          {t('quiz.validate')}
        </button>
      )}

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl p-4"
            style={{
              background: correct ? 'rgba(124,176,120,0.10)' : 'rgba(220,100,80,0.08)',
              border: `1px solid ${correct ? 'rgba(124,176,120,0.30)' : 'rgba(220,100,80,0.25)'}`,
            }}
          >
            <div className="flex items-start gap-3">
              {correct ? (
                <CheckCircle2 className="shrink-0" style={{ color: 'var(--color-success)' }} size={22} />
              ) : (
                <XCircle className="shrink-0" style={{ color: 'var(--color-error)' }} size={22} />
              )}
              <div>
                <p className="text-[15px] tracking-[0.14em] uppercase mb-1" style={{ color: correct ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {correct ? t('quiz.correctAnswerMsg') : t('quiz.wrongAnswerMsg')}
                </p>
                {!correct && (
                  <p className="text-[15px] font-sans mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('quiz.expected')}</span>
                    <span style={{ color: 'var(--color-primary)' }}>{question.type === 'true_false' ? (question.correctAnswer === 'true' ? t('quiz.true') : t('quiz.false')) : question.correctAnswer}</span>
                  </p>
                )}
                <p className="text-[15px] font-sans leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {question.explanation}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 text-[15px] tracking-[0.12em] uppercase py-2.5 px-6 rounded-lg"
              style={{
                background: 'rgba(156,123,172,0.08)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-primary)',
              }}
            >
              {questionNumber >= totalQuestions ? t('quiz.seeResults') : t('quiz.nextQuestion')}
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
