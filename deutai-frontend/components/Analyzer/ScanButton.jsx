'use client';
import { Cpu, Loader2, ScanLine } from 'lucide-react';

export default function ScanButton({ onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full py-4 text-[13px] relative overflow-hidden rounded-xl font-bold font-mono transition-all duration-300
        ${disabled && !loading 
          ? 'bg-[#111] text-[#444] border border-[#222] cursor-not-allowed' 
          : 'bg-gradient-to-r from-gold/10 via-gold/20 to-gold/10 border border-gold/30 text-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:border-gold/50 cursor-pointer'}
      `}
      style={{ letterSpacing: '3px', fontFamily: 'JetBrains Mono, monospace' }}
    >
      {/* Animated shimmer overlay on active state */}
      {!disabled && !loading && (
        <div className="btn-scan-shimmer absolute top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent via-gold/20 to-transparent pointer-events-none" />
      )}

      {loading ? (
        <span className="flex items-center justify-center gap-3 relative z-10">
          <Loader2 className="animate-spin text-gold" size={18} />
          <span className="tracking-[4px] animate-pulse">SCAN EN COURS...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-3 relative z-10 group">
          <ScanLine size={18} className="group-hover:scale-110 transition-transform duration-300" />
          <span>ANALYSER — SCAN 404</span>
          <Cpu size={14} className="opacity-50" />
        </span>
      )}
    </button>
  );
}
