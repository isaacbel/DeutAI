import Link from 'next/link';

export default function QuizNotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#08080a', color: '#e8e8f0' }}
    >
      <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-3" style={{ color: '#c9a227' }}>
        Quiz introuvable
      </p>
      <p className="text-center text-[14px] text-[#8a90a8] mb-6">
        Cette catégorie n’existe pas.
      </p>
      <Link
        href="/"
        className="font-mono text-[11px] tracking-[0.14em] uppercase underline"
        style={{ color: '#f1d98d' }}
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
