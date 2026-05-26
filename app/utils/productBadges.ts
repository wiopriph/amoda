export const PRODUCT_BADGES = ['novo', 'sale', 'hot'] as const;

export type ProductBadge = typeof PRODUCT_BADGES[number];

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

export const normalizeProductBadges = (badges: unknown): ProductBadge[] => {
  if (!Array.isArray(badges)) {
    return [];
  }

  const badgeSet = new Set(badges.filter((badge): badge is string => typeof badge === 'string'));

  return PRODUCT_BADGES.filter(badge => badgeSet.has(badge));
};
