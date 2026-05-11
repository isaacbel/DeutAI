'use client';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function QRScanner({ onDetected, onError }) {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const streamRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [permissionError, setPermissionError] = useState('');

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  async function startScanner() {
    setPermissionError('');
    stopScanner();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        try {
          await video.play();
        } catch (err) {
          if (err?.name !== 'AbortError') throw err;
          return;
        }
        setStarted(true);
        requestAnimationFrame(tick);
      }
    } catch {
      const msg = t('scanner.cameraDenied');
      setPermissionError(msg);
      onError?.(msg);
    }
  }

  function stopScanner() {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setStarted(false);
  }

  async function tick() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animRef.current = requestAnimationFrame(tick);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    try {
      // Dynamically import jsQR (client-side only)
      const jsQR = (await import('jsqr')).default;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      if (code && code.data) {
        stopScanner();
        onDetected(code.data);
        return;
      }
    } catch {
      // jsQR error, continue scanning
    }

    animRef.current = requestAnimationFrame(tick);
  }

  if (permissionError) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: '#1A0A0A', border: '1px solid #3A1A1A' }}
      >
        <p className="text-sm text-error mb-4">⚠ {permissionError}</p>
        <button onClick={startScanner} className="btn-gold px-6 py-2 text-sm">
          ↺ {t('scanner.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative rounded-xl overflow-hidden"
        style={{ border: '1px solid #2a2a2a', aspectRatio: '1 / 1' }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Corner markers */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-48 h-48">
            {/* Corners */}
            {[
              'top-0 left-0 border-t-2 border-l-2 rounded-tl',
              'top-0 right-0 border-t-2 border-r-2 rounded-tr',
              'bottom-0 left-0 border-b-2 border-l-2 rounded-bl',
              'bottom-0 right-0 border-b-2 border-r-2 rounded-br',
            ].map((cls, i) => (
              <div
                key={i}
                className={`absolute w-8 h-8 border-gold ${cls}`}
                style={{ borderColor: '#D4AF37' }}
              />
            ))}
            {/* Scan line */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                boxShadow: '0 0 10px rgba(212,175,55,0.6)',
                animation: 'scanLineLoop 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>

      {!started && (
        <p className="text-sm font-mono text-text-muted text-center" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {t('scanner.initCamera')}
        </p>
      )}
    </div>
  );
}
