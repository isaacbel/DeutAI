'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

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
        background: 'rgba(10,10,16,0.98)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="font-mono text-[10px] text-[#5c6078] tracking-wider">
          Question {questionNumber}/{totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] tracking-[0.18em] uppercase px-2 py-1 rounded-md"
            style={{
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.22)',
              color: '#c9a227',
            }}
          >
            {TYPE_LABELS[question.type] || question.type}
          </span>
          <span className="font-mono text-[10px] text-[#5c6078] tracking-wider">
            +{question.points} pt{question.points > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <p
        className="font-sans text-[16px] sm:text-[17px] leading-relaxed mb-6"
        style={{ color: '#e8e8f0' }}
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
                  background: active ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                  border: active ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  color: active ? '#f5e6b8' : '#b8bdd4',
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
          {['Vrai', 'Faux'].map((v) => {
            const active = choice === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setChoice(v)}
                className="flex-1 rounded-xl py-3 font-mono text-[12px] tracking-[0.12em] uppercase"
                style={{
                  background: active ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                  border: active ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  color: active ? '#f1d98d' : '#8a90a8',
                }}
              >
                {v}
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
          placeholder="Votre réponse en allemand…"
          className="w-full rounded-xl px-4 py-3 font-sans text-[14px] outline-none resize-none"
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e8e8f0',
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
          className="mt-6 w-full sm:w-auto font-mono text-[11px] tracking-[0.16em] uppercase py-3 px-8 rounded-xl disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #c9a227, #e8d48a)',
            color: '#0a0a0c',
            border: 'none',
            boxShadow: '0 4px 20px rgba(201,162,39,0.35)',
          }}
        >
          Valider
        </button>
      )}

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-xl p-4"
            style={{
              background: correct ? 'rgba(40,130,70,0.12)' : 'rgba(180,60,60,0.12)',
              border: `1px solid ${correct ? 'rgba(40,130,70,0.28)' : 'rgba(180,60,60,0.28)'}`,
            }}
          >
            <div className="flex items-start gap-3">
              {correct ? (
                <CheckCircle2 className="shrink-0 text-emerald-400" size={22} />
              ) : (
                <XCircle className="shrink-0 text-red-400" size={22} />
              )}
              <div>
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase mb-1" style={{ color: correct ? '#6ee7b7' : '#fca5a5' }}>
                  {correct ? 'Bonne réponse' : 'Mauvaise réponse'}
                </p>
                {!correct && (
                  <p className="text-[13px] font-sans mb-2" style={{ color: '#e8e8f0' }}>
                    <span className="text-[#8a90a8]">Attendu : </span>
                    <span className="text-[#f1d98d]">{question.correctAnswer}</span>
                  </p>
                )}
                <p className="text-[13px] font-sans leading-relaxed" style={{ color: '#b8bdd4' }}>
                  {question.explanation}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase py-2.5 px-6 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#c9a227',
              }}
            >
              {questionNumber >= totalQuestions ? 'Voir les résultats' : 'Question suivante'}
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
