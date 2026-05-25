import Link from 'next/link';

export default function QuizNotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--color-bg-ice)', color: 'var(--color-text-primary)' }}
    >
      <p className="text-[15px] tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--color-primary)' }}>
        Quiz introuvable
      </p>
      <p className="text-center text-[14px] mb-6" style={{ color: 'var(--color-text-muted)' }}>
        Cette catégorie n'existe pas.
      </p>
      <Link
        href="/"
        className="text-[15px] tracking-[0.14em] uppercase underline"
        style={{ color: 'var(--color-primary)' }}
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
