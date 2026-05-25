'use client';
import { useRef, useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function PhotoCapture({ onCapture, loading }) {
  const { t, lang } = useLanguage();
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(tk => tk.stop());
        streamRef.current = null;
      }
    };
  }, []);

  async function startCamera() {
    setCameraError('');
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
        setCameraActive(true);
      }
    } catch {
      setCameraError(t('scanner.cameraDenied'));
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(tk => tk.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    stopCamera();
    onCapture(base64);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError(t('notebook.errorFileNotImage'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCameraError(t('notebook.errorFileTooLarge'));
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target.result.split(',')[1];
      onCapture(base64);
    };
    reader.onerror = () => {
      setCameraError(t('notebook.errorFileRead'));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const isRtl = lang === 'ar';

  return (
    <div className="flex flex-col gap-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Camera view */}
      {cameraActive && (
        <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            muted
            playsInline
          />
          {/* Scan overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)', animation: 'scanLineLoop 2s ease-in-out infinite' }} />
            <div className="absolute inset-4 rounded" style={{ border: '1px solid rgba(156,123,172,0.30)' }} />
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
            <button
              onClick={capturePhoto}
              className="btn-gold px-6 py-3 text-sm"
            >
              📸 {t('notebook.capture')}
            </button>
            <button
              onClick={stopCamera}
              className="btn-outline px-4 py-3 text-sm"
            >
              ✕ {t('notebook.cancel')}
            </button>
          </div>
        </div>
      )}

      {!cameraActive && (
        <>
          {/* Placeholder */}
          <div
            className="flex flex-col items-center justify-center gap-3 py-12 rounded-xl"
            style={{
              border: '2px dashed var(--color-border)',
              background: 'var(--color-bg-sidebar)',
            }}
          >
            <span className="text-4xl opacity-40">📷</span>
            <p className="text-sm text-text-muted text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t('notebook.placeholderMain')}<br />
              <span className="text-sm">{t('notebook.placeholderSub')}</span>
            </p>
          </div>

          {cameraError && (
            <div className="px-4 py-3 rounded-lg text-sm flex items-start gap-2" style={{ background: 'rgba(220,100,80,0.06)', border: '1px solid rgba(220,100,80,0.20)', color: 'var(--color-error)' }}>
              ⚠ {cameraError}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={startCamera}
              disabled={loading}
              className="btn-gold w-full py-3 text-sm"
            >
              {t('notebook.takePhoto')}
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="btn-outline w-full py-3 text-sm"
            >
              {t('notebook.importImage')}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
