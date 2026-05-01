'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      router.replace('/analyze');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div
        className="w-8 h-8 rounded-full border-2 border-gold/20"
        style={{ animation: 'spin-slow 1s linear infinite', borderTopColor: '#D4AF37' }}
      />
    </div>
  );
}
