'use client';

export function Badge({ className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[#343445] bg-[#181821] px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-[#b7b7c6] ${className}`}
    >
      {children}
    </span>
  );
}
