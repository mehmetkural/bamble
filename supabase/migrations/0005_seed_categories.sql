INSERT INTO categories (slug, label, icon, color) VALUES
  ('language-learning', 'Language Learning', '🗣️', '#6366f1'),
  ('sports',            'Sports',            '⚽',  '#22c55e'),
  ('music',             'Music',             '🎵', '#f59e0b'),
  ('arts-crafts',       'Arts & Crafts',     '🎨', '#ec4899'),
  ('tech',              'Tech',              '💻', '#0ea5e9'),
  ('fitness',           'Fitness',           '🏋️', '#f97316'),
  ('food',              'Food & Cooking',    '🍳', '#84cc16'),
  ('gaming',            'Gaming',            '🎮', '#8b5cf6'),
  ('study',             'Study / Work',      '📚', '#14b8a6'),
  ('other',             'Other',             '💡', '#94a3b8')
ON CONFLICT (slug) DO NOTHING;
