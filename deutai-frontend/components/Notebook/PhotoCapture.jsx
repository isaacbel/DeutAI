'use client';
import { useRef, useState } from 'react';

export default function PhotoCapture({ onCapture, loading }) {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const streamRef = useRef(null);

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
      setCameraError('Accès caméra refusé. Utilisez l\'import d\'image à la place.');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }

  function capturePhoto() {
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
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target.result.split(',')[1];
      onCapture(base64);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Camera view */}
      {cameraActive && (
        <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            muted
            playsInline
          />
          {/* Scan overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', animation: 'scanLineLoop 2s ease-in-out infinite' }} />
            <div className="absolute inset-4 border border-gold/30 rounded" />
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
            <button
              onClick={capturePhoto}
              className="btn-gold px-6 py-3 text-sm"
            >
              📸 Capturer
            </button>
            <button
              onClick={stopCamera}
              className="btn-outline px-4 py-3 text-sm"
            >
              ✕ Annuler
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
              border: '2px dashed #2a2a2a',
              background: 'rgba(10,10,10,0.5)',
            }}
          >
            <span className="text-4xl opacity-40">📷</span>
            <p className="text-sm text-text-muted text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
              Prenez une photo de votre texte manuscrit<br />
              <span className="text-xs">ou importez une image</span>
            </p>
          </div>

          {cameraError && (
            <div className="px-4 py-3 rounded-lg text-sm text-error" style={{ background: '#1A0A0A', border: '1px solid #3A1A1A' }}>
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
              📷 Prendre une photo
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="btn-outline w-full py-3 text-sm"
            >
              ⬆ Importer une image
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
