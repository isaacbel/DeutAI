import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import AdminQrGrid from '@/components/admin/AdminQrGrid';

// The 4 quiz categories shown on /questions
const QUIZ_LINKS = [
  { slug: 'vocabulaire', title: 'Vocabulaire', icon: 'book-open', color: '#C9A227' },
  { slug: 'grammaire', title: 'Grammaire', icon: 'book-text', color: '#4DA8DA' },
  { slug: 'conjugaison', title: 'Conjugaison', icon: 'pen-line', color: '#E06C6C' },
  { slug: 'comprehension', title: 'Compréhension', icon: 'eye', color: '#7B61FF' },
];

export default async function AdminQrCodesPage() {
  if (!process.env.ADMIN_PASSWORD) {
    redirect('/');
  }

  const cookieStore = await cookies();
  if (cookieStore.get('deutai_admin')?.value !== '1') {
    redirect('/admin/login?next=/admin/qrcodes');
  }

  const base = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

  const items = await Promise.all(
    QUIZ_LINKS.map(async (c) => {
      const url = `${base}/quiz/${c.slug}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: '#0a0a0c', light: '#ffffff' },
        errorCorrectionLevel: 'H',   // highest correction — prints cleanly
      });
      return { ...c, url, dataUrl };
    })
  );

  return <AdminQrGrid items={items} />;
}

export const dynamic = 'force-dynamic';
