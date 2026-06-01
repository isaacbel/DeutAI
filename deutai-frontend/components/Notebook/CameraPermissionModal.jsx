'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CameraPermissionModal
 *
 * Props:
 *   visible   – boolean  – whether to display the modal
 *   onGranted – fn       – called when getUserMedia resolves successfully
 *   onDenied  – fn       – called when getUserMedia is denied / unavailable
 */
export default function CameraPermissionModal({ visible, onGranted, onDenied }) {
  const requested = useRef(false);

  // Auto-request immediately once the modal becomes visible
  useEffect(() => {
    if (!visible || requested.current) return;
    requested.current = true;

    if (!navigator.mediaDevices?.getUserMedia) {
      onDenied();
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        // Stop the stream immediately — we only needed the permission grant
        stream.getTracks().forEach((t) => t.stop());
        onGranted();
      })
      .catch(() => {
        onDenied();
      });
  }, [visible, onGranted, onDenied]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="camera-permission-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(10, 14, 22, 0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <motion.div
            key="camera-permission-card"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26, delay: 0.05 }}
            style={{
              background: 'linear-gradient(145deg, #1c1f2e 0%, #151825 100%)',
              border: '1px solid rgba(156,123,172,0.22)',
              borderRadius: '20px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(156,123,172,0.08)',
              maxWidth: '420px',
              width: '100%',
              padding: '2.25rem 2rem 2rem',
              textAlign: 'center',
            }}
          >
            {/* Animated camera icon */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(156,123,172,0.18) 0%, rgba(156,123,172,0.06) 100%)',
                border: '1.5px solid rgba(156,123,172,0.30)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.4rem',
                fontSize: '2rem',
              }}
            >
              📷
            </motion.div>

            <h2
              style={{
                color: '#e8e4f0',
                fontSize: '1.2rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                marginBottom: '0.5rem',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Camera Access Required
            </h2>

            <p
              style={{
                color: '#8b8fa8',
                fontSize: '0.875rem',
                lineHeight: 1.65,
                fontFamily: 'Inter, sans-serif',
                marginBottom: '1.6rem',
              }}
            >
              The Notebook feature uses your camera to capture and analyse German text from your notes.
              <br />
              <span style={{ color: '#6b6e82', fontSize: '0.8rem' }}>
                Your browser will show a permission prompt momentarily.
              </span>
            </p>

            {/* Spinner row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                color: '#9C7BAC',
                fontSize: '0.8rem',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.12em',
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(156,123,172,0.20)',
                  borderTop: '2px solid #9C7BAC',
                  borderRadius: '50%',
                }}
              />
              AWAITING PERMISSION…
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
