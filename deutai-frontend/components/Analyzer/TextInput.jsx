'use client';
import { PenLine } from 'lucide-react';

const MAX_CHARS = 1000;

export default function TextInput({ value, onChange, disabled }) {
  const count = value.length;
  const isOver = count > MAX_CHARS;

  return (
    <div className="relative group">
      {/* Subtle glow effect behind textarea */}
      <div className={`absolute -inset-0.5 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 ${isOver ? 'bg-error/30' : 'bg-gold/10'}`} />
      
      <div className="relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Saisir une phrase en allemand..."
          rows={5}
          className="input-dark px-5 py-4 text-sm resize-none w-full bg-[#0a0a0a] transition-all duration-300"
          style={{
            fontFamily: 'Inter, sans-serif',
            borderColor: isOver ? 'rgba(204,85,85,0.5)' : 'rgba(42,42,42,0.8)',
            boxShadow: isOver ? '0 0 0 1px rgba(204,85,85,0.2) inset' : undefined,
          }}
        />
        
        {/* Decorative icon */}
        <div className="absolute right-4 top-4 text-text-muted/30 pointer-events-none group-focus-within:text-gold/30 transition-colors">
          <PenLine size={16} />
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 px-1">
        {isOver ? (
          <span className="text-[10px] text-error font-mono tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Limite dépassée ({count - MAX_CHARS} en trop)
          </span>
        ) : (
          <span className="text-[10px] text-text-muted invisible">_</span>
        )}
        <span
          className="text-[10px] font-mono tabular-nums tracking-wider px-2 py-0.5 rounded"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            color: isOver ? '#CC5555' : count > 800 ? '#D4AF37' : '#666',
            background: isOver ? 'rgba(204,85,85,0.1)' : count > 800 ? 'rgba(212,175,55,0.1)' : 'transparent',
          }}
        >
          {count} / {MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
