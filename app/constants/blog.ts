// Конфиг блога: пути к статичным ассетам заведены здесь, чтобы менять без правки компонентов

export const BLOG_AUTHOR = {
  id: 'manuel',
  name: 'Manuel',
  role: 'Amoda, Luanda',
  // TODO: заменить заглушку на реальное фото автора
  photo: '/blog-assets/manuel.webp',
} as const;

// Дефолтная og-image статей блога (заглушка, сгенерирована вместе с обложками)
export const BLOG_OG_IMAGE = '/blog-assets/og-default.webp';

// Заглушка обложки карточки статьи, когда cover в frontmatter пуст
export const BLOG_COVER_FALLBACK = '/placeholder.webp';

export const BLOG_PER_PAGE = 12;
