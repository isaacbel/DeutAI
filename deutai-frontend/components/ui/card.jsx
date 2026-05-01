'use client';

export function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#0f0f12]/90 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`p-5 pb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return <h3 className={`text-sm font-semibold text-[#e8e8ef] ${className}`}>{children}</h3>;
}

export function CardDescription({ className = '', children }) {
  return <p className={`text-xs text-[#8b8b98] ${className}`}>{children}</p>;
}

export function CardContent({ className = '', children }) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}
