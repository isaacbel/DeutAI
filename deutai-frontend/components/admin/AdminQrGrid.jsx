'use client';

import { BookOpen, BookText, PenLine, Eye, Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const ICONS = {
  'book-open':  BookOpen,
  'book-text':  BookText,
  'pen-line':   PenLine,
  eye:          Eye,
};

export default function AdminQrGrid({ items }) {
  const [downloading, setDownloading] = useState(false);

  /** Single download — returns a Promise that resolves after the file is triggered */
  function downloadPng(dataUrl, slug) {
    return fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deutai-quiz-${slug}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Give the browser 800 ms to start the download before we revoke + move on
        return new Promise((resolve) => {
          setTimeout(() => {
            URL.revokeObjectURL(url);
            resolve();
          }, 800);
        });
      });
  }

  /** Download all sequentially — awaits each file fully before starting the next */
  async function downloadAll() {
    setDownloading(true);
    for (const item of items) {
      await downloadPng(item.dataUrl, item.slug);
    }
    setDownloading(false);
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: '#08080a', color: '#e8e8f0' }}>
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: '#c9a227' }}>
              Administration · DeutAI
            </p>
            <h1 className="font-sans text-2xl sm:text-3xl font-semibold mb-1" style={{ color: '#f1d98d' }}>
              QR Codes — Quiz
            </h1>
            <p className="text-[13px]" style={{ color: '#8a90a8' }}>
              Scannez ou téléchargez un code pour accéder directement à la page du quiz correspondante.
            </p>
          </div>

          {/* Download all */}
          <button
            type="button"
            onClick={downloadAll}
            disabled={downloading}
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase py-3 px-6 rounded-xl shrink-0 disabled:opacity-60 disabled:cursor-wait"
            style={{
              background: 'linear-gradient(135deg, #c9a227, #e8d48a)',
              color: '#0a0a0c',
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(201,162,39,0.35)',
            }}
          >
            <Download size={14} />
            {downloading ? 'Téléchargement…' : 'Tout télécharger'}
          </button>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || BookOpen;
            const color = item.color || '#c9a227';

            return (
              <div
                key={item.slug}
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: 'rgba(10,10,16,0.98)',
                  border: `1px solid ${color}28`,
                  boxShadow: `0 20px 50px rgba(0,0,0,0.45), 0 0 0 1px ${color}10`,
                }}
              >
                {/* Card top bar */}
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom: `1px solid ${color}18` }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${color}18`,
                        border: `1px solid ${color}35`,
                      }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div>
                      <h2 className="font-sans text-base font-semibold" style={{ color: '#f1d98d' }}>
                        {item.title}
                      </h2>

                    </div>
                  </div>

                  {/* Open link */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      background: `${color}12`,
                      border: `1px solid ${color}30`,
                      color,
                    }}
                    title="Ouvrir dans un nouvel onglet"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* QR code */}
                <div className="flex flex-col items-center py-8 px-6 gap-6">
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: '#ffffff',
                      boxShadow: `0 0 0 6px ${color}15, 0 8px 32px rgba(0,0,0,0.4)`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.dataUrl}
                      alt={`QR code — ${item.title}`}
                      width={200}
                      height={200}
                      style={{ display: 'block', borderRadius: '8px' }}
                    />
                  </div>



                  {/* Download button */}
                  <button
                    type="button"
                    onClick={() => downloadPng(item.dataUrl, item.slug)}
                    className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase py-2.5 px-6 rounded-xl w-full justify-center transition-all"
                    style={{
                      background: `${color}15`,
                      border: `1px solid ${color}40`,
                      color,
                      fontWeight: 600,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${color}28`;
                      e.currentTarget.style.boxShadow = `0 4px 16px ${color}25`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = `${color}15`;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Download size={14} />
                    Télécharger — deutai-quiz-{item.slug}.png
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer hint ── */}
        <p className="mt-10 text-center font-mono text-[10px] tracking-wider uppercase" style={{ color: '#2a2a38' }}>
          DeutAI · Administration
        </p>
      </div>
    </div>
  );
}
