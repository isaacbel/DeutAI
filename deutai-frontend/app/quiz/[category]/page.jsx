import { notFound } from 'next/navigation';
import { QUIZ_SLUGS } from '@/lib/quiz/categories';
import QuizClient from './QuizClient';

export default async function QuizCategoryPage({ params }) {
  const { category } = await params;
  const slug = String(category || '').toLowerCase();
  if (!QUIZ_SLUGS.has(slug)) notFound();
  return <QuizClient slug={slug} />;
}
