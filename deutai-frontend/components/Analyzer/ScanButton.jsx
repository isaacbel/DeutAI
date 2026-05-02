'use client';
import { Cpu, Loader2, ScanLine } from 'lucide-react';

export default function ScanButton({ onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full py-4 text-[14px] relative overflow-hidden rounded-xl font-bold font-mono transition-all duration-300
        ${disabled && !loading 
          ? 'bg-[#15151b] text-[#666d86] border border-[#2b2b37] cursor-not-allowed' 
          : 'bg-linear-to-r from-gold/12 via-gold/22 to-gold/12 border border-gold/40 text-[#f0d787] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:border-gold/60 cursor-pointer'}
      `}
      style={{ letterSpacing: '2.5px', fontFamily: 'JetBrains Mono, monospace' }}
    >
      {/* Animated shimmer overlay on active state */}
      {!disabled && !loading && (
        <div className="btn-scan-shimmer absolute top-0 bottom-0 w-1/4 bg-linear-to-r from-transparent via-gold/20 to-transparent pointer-events-none" />
      )}

      {loading ? (
        <span className="flex items-center justify-center gap-3 relative z-10">
          <Loader2 className="animate-spin text-gold" size={18} />
          <span className="tracking-[4px] animate-pulse">SCAN EN COURS...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-3 relative z-10 group">
          <ScanLine size={19} className="group-hover:scale-110 transition-transform duration-300" />
          <span>ANALYSER — SCAN 404</span>
          <Cpu size={15} className="opacity-60" />
        </span>
      )}
    </button>
  );
}
