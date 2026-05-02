'use client';

import {
  BookOpen,
  BookText,
  PenLine,
  SpellCheck,
  Eye,
  Languages,
  Download,
} from 'lucide-react';

const ICONS = {
  'book-open': BookOpen,
  'book-text': BookText,
  'pen-line': PenLine,
  'spell-check': SpellCheck,
  eye: Eye,
  languages: Languages,
};

export default function AdminQrGrid({ items }) {
  function downloadPng(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#08080a', color: '#e8e8f0' }}>
      <div className="max-w-6xl mx-auto">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: '#c9a227' }}>
          Administration
        </p>
        <h1 className="font-sans text-2xl sm:text-3xl font-semibold mb-2" style={{ color: '#f1d98d' }}>
          QR codes — Quiz
        </h1>
        <p className="text-[14px] mb-10" style={{ color: '#8a90a8' }}>
          Un code par catégorie. Scannez pour ouvrir la page du quiz correspondante.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || BookOpen;
            return (
              <div
                key={item.slug}
                className="rounded-2xl p-6 flex flex-col items-center text-center"
                style={{
                  background: 'rgba(10,10,16,0.98)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: 'rgba(212,175,55,0.12)',
                    border: '1px solid rgba(212,175,55,0.25)',
                  }}
                >
                  <Icon className="text-[#c9a227]" size={22} />
                </div>
                <h2 className="font-sans text-lg font-semibold mb-1" style={{ color: '#f1d98d' }}>
                  {item.title}
                </h2>
                <p className="text-[12px] mb-4 line-clamp-2" style={{ color: '#6b7088' }}>
                  {item.url}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.dataUrl}
                  alt={`QR ${item.title}`}
                  className="rounded-lg mb-4 bg-white p-2"
                  width={200}
                  height={200}
                />
                <button
                  type="button"
                  onClick={() => downloadPng(item.dataUrl, `deutai-quiz-${item.slug}.png`)}
                  className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase py-2.5 px-5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#c9a227',
                  }}
                >
                  <Download size={14} />
                  Télécharger
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
