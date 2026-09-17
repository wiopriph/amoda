// Конфиг блога: пути к статичным ассетам заведены здесь, чтобы менять без правки компонентов

export const BLOG_AUTHOR = {
  id: 'manuel',
  name: 'Manuel',
  role: 'Amoda, Luanda',
  // TODO: заменить на реальное фото автора (положить файл в public/blog/)
  photo: '/blog/manuel.webp',
} as const;

// Дефолтная og-image статей блога
// TODO: заменить на выделенную картинку блога (положить файл в public/blog/)
export const BLOG_OG_IMAGE = '/logo.webp';

// Заглушка обложки карточки статьи, когда cover в frontmatter пуст
export const BLOG_COVER_FALLBACK = '/placeholder.webp';

export const BLOG_PER_PAGE = 12;
