export const CATEGORIES = [
  { slug: 'language-learning', label: 'Language Learning', icon: '🗣️', color: '#6366f1' },
  { slug: 'sports',            label: 'Sports',            icon: '⚽',  color: '#22c55e' },
  { slug: 'music',             label: 'Music',             icon: '🎵', color: '#f59e0b' },
  { slug: 'arts-crafts',       label: 'Arts & Crafts',     icon: '🎨', color: '#ec4899' },
  { slug: 'tech',              label: 'Tech',              icon: '💻', color: '#0ea5e9' },
  { slug: 'fitness',           label: 'Fitness',           icon: '🏋️', color: '#f97316' },
  { slug: 'food',              label: 'Food & Cooking',    icon: '🍳', color: '#84cc16' },
  { slug: 'gaming',            label: 'Gaming',            icon: '🎮', color: '#8b5cf6' },
  { slug: 'study',             label: 'Study / Work',      icon: '📚', color: '#14b8a6' },
  { slug: 'other',             label: 'Other',             icon: '💡', color: '#94a3b8' },
] as const

export type CategorySlug = typeof CATEGORIES[number]['slug']
