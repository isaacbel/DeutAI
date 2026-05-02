'use client';

import { motion } from 'framer-motion';

const LEVELS = [
  { id: 'easy', label: 'Facile', hint: 'A1–A2' },
  { id: 'medium', label: 'Moyen', hint: 'B1' },
  { id: 'hard', label: 'Difficile', hint: 'B2+' },
];

export default function DifficultySelector({ value, onChange }) {
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
              background: active ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
              border: active ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(255,255,255,0.07)',
              boxShadow: active ? '0 0 20px rgba(212,175,55,0.12)' : 'none',
            }}
          >
            <span
              className="block font-mono text-[11px] tracking-[0.14em] uppercase"
              style={{ color: active ? '#f1d98d' : '#8a90a8' }}
            >
              {lvl.label}
            </span>
            <span className="block mt-1 text-[12px] text-[#6b7088] font-sans">{lvl.hint}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
