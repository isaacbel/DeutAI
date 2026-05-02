/** Métadonnées des catégories de quiz (slug = segment d’URL). */

export const QUIZ_CATEGORIES = [
  {
    slug: 'vocabulaire',
    title: 'Vocabulaire',
    description: 'Lexique allemand : sens, usage et nuances.',
    icon: 'book-open',
  },
  {
    slug: 'grammaire',
    title: 'Grammaire',
    description: 'Structures, cas, prépositions et syntaxe.',
    icon: 'book-text',
  },
  {
    slug: 'conjugaison',
    title: 'Conjugaison',
    description: 'Temps, modes et accords verbaux.',
    icon: 'pen-line',
  },
  {
    slug: 'orthographe',
    title: 'Orthographe',
    description: 'Graphie, majuscules, composition des mots.',
    icon: 'spell-check',
  },
  {
    slug: 'comprehension',
    title: 'Compréhension',
    description: 'Comprendre et interpréter des énoncés.',
    icon: 'eye',
  },
  {
    slug: 'traduction',
    title: 'Traduction',
    description: 'Transposer correctement entre français et allemand.',
    icon: 'languages',
  },
];

export const QUIZ_SLUGS = new Set(QUIZ_CATEGORIES.map((c) => c.slug));

export function getCategoryMeta(slug) {
  return QUIZ_CATEGORIES.find((c) => c.slug === slug) || null;
}
