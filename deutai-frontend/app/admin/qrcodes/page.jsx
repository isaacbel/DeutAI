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
  { slug: 'homepage', title: 'Homepage', icon: 'home', color: '#D4AF37', isHome: true },
];

const GRAMMAR_PHRASES = [
  { slug: 'a1-phrase-1', title: 'A1: Ihr macht Hausaufgaben', icon: 'book-text', color: '#9C7BAC', hash: '#a1-phrase-1' },
  { slug: 'a1-phrase-2', title: 'A1: Du fährst nach Berlin', icon: 'book-text', color: '#9C7BAC', hash: '#a1-phrase-2' },
  { slug: 'a1-phrase-3', title: 'A1: Ich lerne Deutsch', icon: 'book-text', color: '#9C7BAC', hash: '#a1-phrase-3' },
  { slug: 'a1-phrase-4', title: 'A1: Das Kind fragt viel', icon: 'book-text', color: '#9C7BAC', hash: '#a1-phrase-4' },
  { slug: 'a2-phrase-1', title: 'A2: Ich bin nach Hause gegangen', icon: 'book-text', color: '#9C7BAC', hash: '#a2-phrase-1' },
  { slug: 'a2-phrase-2', title: 'A2: Er hat den Brief geschrieben', icon: 'book-text', color: '#9C7BAC', hash: '#a2-phrase-2' },
  { slug: 'a2-phrase-3', title: 'A2: Er will heute nicht arbeiten', icon: 'book-text', color: '#9C7BAC', hash: '#a2-phrase-3' },
  { slug: 'a2-phrase-4', title: 'A2: Ich habe gestern studiert', icon: 'book-text', color: '#9C7BAC', hash: '#a2-phrase-4' },
  { slug: 'a2-phrase-5', title: 'A2: Letztes Jahr bin ich gereist', icon: 'book-text', color: '#9C7BAC', hash: '#a2-phrase-5' },
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

  const quizItems = await Promise.all(
    QUIZ_LINKS.map(async (c) => {
      const url = c.isHome ? base : `${base}/quiz/${c.slug}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: '#0a0a0c', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });
      return { ...c, url, dataUrl };
    })
  );

  const grammarItems = await Promise.all(
    GRAMMAR_PHRASES.map(async (p) => {
      const url = `${base}/grammar/${p.slug}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: { dark: '#0a0a0c', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });
      return { ...p, url, dataUrl };
    })
  );

  return <AdminQrGrid items={[...quizItems, ...grammarItems]} />;
}

export const dynamic = 'force-dynamic';
