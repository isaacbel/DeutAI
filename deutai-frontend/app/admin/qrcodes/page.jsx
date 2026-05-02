import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { QUIZ_CATEGORIES } from '@/lib/quiz/categories';
import AdminQrGrid from '@/components/admin/AdminQrGrid';

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
    QUIZ_CATEGORIES.map(async (c) => {
      const url = `${base}/quiz/${c.slug}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        color: { dark: '#0a0a0c', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      return { ...c, url, dataUrl };
    })
  );

  return <AdminQrGrid items={items} />;
}

export const dynamic = 'force-dynamic';
