'use client';

export function Badge({ className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[15px] uppercase tracking-[0.15em] ${className}`}
      style={{ border: '1px solid rgba(156,123,172,0.3)', background: 'rgba(156,123,172,0.1)', color: 'var(--color-primary)' }}
    >
      {children}
    </span>
  );
}
