'use client';

export function Button({ className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg border border-[#3d3418] bg-[#1c1809] px-3 py-2 text-sm font-medium text-[#d4af37] transition hover:bg-[#251f0d] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
