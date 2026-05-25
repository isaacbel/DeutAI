'use client';

export function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-2xl border bg-bg-main shadow-[0_4px_24px_rgba(156,123,172,0.08)] backdrop-blur ${className}`}
      style={{ borderColor: 'var(--color-border)' }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`p-5 pb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return <h3 className={`text-sm font-semibold text-text-primary ${className}`}>{children}</h3>;
}

export function CardDescription({ className = '', children }) {
  return <p className={`text-sm text-text-muted ${className}`}>{children}</p>;
}

export function CardContent({ className = '', children }) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}
