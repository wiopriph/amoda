// Новые фото грузятся парой: <uuid>_m.webp (мастер) + <uuid>_s.webp (превью 480px).
// Для карточек каталога подменяем суффикс; старые фото без пары остаются как есть.
export const smallImageUrl = (url?: string | null): string | null =>
  (url ? url.replace(/_m\.webp$/, '_s.webp') : null);
