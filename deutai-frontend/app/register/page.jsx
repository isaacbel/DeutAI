'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/Auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      router.replace('/analyze');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-4 py-12 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 grid-scan-bg opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-gold opacity-10 blur-3xl rounded-full" />

      <div className="w-full max-w-sm mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold text-gold"
            style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '4px' }}
          >
            DeutAI
          </h1>
          <p className="system-subtitle mt-2" style={{ fontSize: '10px' }}>
            CRÉATION DE PROFIL 404
          </p>
        </div>

        <div className="auth-card p-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
