'use client';
import { useEffect, useState } from 'react';
import { Fingerprint, Radar, BrainCircuit } from 'lucide-react';

const SCAN_MESSAGES = [
  { msg: 'INITIATING SYSTEM...', icon: Radar },
  { msg: 'ANALYSING SYNTAX...', icon: BrainCircuit },
  { msg: 'DETECTING ANOMALIES...', icon: Fingerprint },
  { msg: 'CLASSIFICATION KLEPPIN...', icon: BrainCircuit },
];

export default function ScanAnimation({ text }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [hexCode, setHexCode] = useState('0x0000');

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % SCAN_MESSAGES.length);
    }, 600);
    
    const hexInterval = setInterval(() => {
      setHexCode('0x' + Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(6, '0'));
    }, 100);

    return () => {
      clearInterval(interval);
      clearInterval(hexInterval);
    };
  }, []);

  const ActiveIcon = SCAN_MESSAGES[msgIndex].icon;

  return (
    <div
      className="relative rounded-xl overflow-hidden p-5"
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(212,175,55,0.2)',
        minHeight: '160px',
        boxShadow: '0 0 30px rgba(212,175,55,0.05) inset'
      }}
    >
      {/* Abstract decorative tech lines */}
      <div className="absolute top-0 left-4 w-px h-full bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
      <div className="absolute top-0 right-4 w-px h-full bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
      <div className="absolute top-4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
      
      {/* Corner markers */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-gold/50" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-gold/50" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-gold/50" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-gold/50" />

      {/* Hex processor code */}
      <div className="absolute top-3 right-5 text-[8px] font-mono text-gold/40" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        MEM: {hexCode}
      </div>

      <div className="flex flex-col items-center justify-center h-full gap-4 relative z-10 pt-2">
        <div className="relative">
          <ActiveIcon size={32} className="text-gold animate-pulse" />
          <div className="absolute inset-0 bg-gold blur-lg opacity-30 animate-pulse" />
        </div>
        
        {/* Text preview */}
        <p
          className="text-xs text-text-muted leading-relaxed text-center max-w-[80%] mx-auto"
          style={{ fontFamily: 'Inter, sans-serif', filter: 'blur(2px)', opacity: 0.4 }}
        >
          {text}
        </p>
      </div>

      {/* Advanced Gold scan line */}
      <div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #D4AF37 30%, #fff 50%, #D4AF37 70%, transparent 100%)',
          boxShadow: '0 0 20px rgba(212, 175, 55, 1), 0 0 40px rgba(212, 175, 55, 0.4)',
          animation: 'scanLineLoop 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAwdjhINFYweiIgZmlsbD0icmdiYSgyMTIsMTc1LDU1LDAuMDIpIi8+PC9zdmc+')] pointer-events-none mix-blend-screen" />

      {/* Status message */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
        <span
          className="text-[10px] font-mono text-gold px-4 py-1.5 rounded-sm flex items-center gap-2 uppercase font-bold"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(20, 15, 0, 0.9)',
            border: '1px solid rgba(212,175,55,0.4)',
            letterSpacing: '2px',
            boxShadow: '0 0 10px rgba(212,175,55,0.1)'
          }}
        >
          <span className="w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
          {SCAN_MESSAGES[msgIndex].msg}
        </span>
      </div>
    </div>
  );
}
