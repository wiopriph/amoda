// Порядок отображения бейджей на карточке
export const PRODUCT_BADGES = ['novo', 'sale', 'hot'] as const;

// Бейджи, которые проставляются вручную в админке и хранятся в БД.
// «novo» вычисляется автоматически по возрасту товара
export const MANUAL_PRODUCT_BADGES = ['sale', 'hot'] as const;

export const NEW_BADGE_MAX_AGE_DAYS = 14;

export type ProductBadge = typeof PRODUCT_BADGES[number];

export type ManualProductBadge = typeof MANUAL_PRODUCT_BADGES[number];

export type ProductBadgeColor = 'success' | 'error' | 'warning' | 'neutral';

export const PRODUCT_BADGE_LABELS: Record<ProductBadge, string> = {
  novo: 'NOVO',
  sale: 'SALE',
  hot: 'HOT',
};

export const PRODUCT_BADGE_COLORS: Record<ProductBadge, ProductBadgeColor> = {
  novo: 'success',
  sale: 'error',
  hot: 'warning',
};

export const isProductBadge = (badge: string): badge is ProductBadge =>
  PRODUCT_BADGES.includes(badge as ProductBadge);

export const getProductBadgeLabel = (badge: string) =>
  isProductBadge(badge) ? PRODUCT_BADGE_LABELS[badge] : badge.toUpperCase();

export const getProductBadgeColor = (badge: string): ProductBadgeColor =>
  isProductBadge(badge) ? PRODUCT_BADGE_COLORS[badge] : 'neutral';

const toBadgeSet = (badges: unknown): Set<string> => {
  if (!Array.isArray(badges)) {
    return new Set();
  }

  return new Set(badges.filter((badge): badge is string => typeof badge === 'string'));
};

export const normalizeProductBadges = (badges: unknown): ProductBadge[] => {
  const badgeSet = toBadgeSet(badges);

  return PRODUCT_BADGES.filter(badge => badgeSet.has(badge));
};

// Для сохранения из админки: «novo» отбрасывается, даже если пришёл с клиента
export const normalizeManualProductBadges = (badges: unknown): ManualProductBadge[] => {
  const badgeSet = toBadgeSet(badges);

  return MANUAL_PRODUCT_BADGES.filter(badge => badgeSet.has(badge));
};

export const isNewProduct = (createdAt: string | null | undefined): boolean => {
  if (!createdAt) {
    return false;
  }

  const createdTime = new Date(createdAt).getTime();

  if (!Number.isFinite(createdTime)) {
    return false;
  }

  return Date.now() - createdTime < NEW_BADGE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
};

// Бейджи для витрины: ручные из БД + автоматический «novo» по возрасту товара
export const withAutoBadges = (badges: unknown, createdAt: string | null | undefined): ProductBadge[] => {
  const badgeSet = new Set<string>(normalizeProductBadges(badges));

  badgeSet.delete('novo');

  if (isNewProduct(createdAt)) {
    badgeSet.add('novo');
  }

  return PRODUCT_BADGES.filter(badge => badgeSet.has(badge));
};
