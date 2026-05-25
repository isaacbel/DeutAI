'use client';

export function Button({ className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{ borderColor: 'rgba(156,123,172,0.35)', background: 'rgba(156,123,172,0.08)', color: 'var(--color-primary)' }}
      {...props}
    >
      {children}
    </button>
  );
}
