import { CURRENCY_LOCAL } from '~/constants/currency';


const priceFormatter = new Intl.NumberFormat('pt-AO');

export const formatPrice = (price?: number | null, fallback = '—') => {
  if (price == null) {
    return fallback;
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return fallback;
  }

  return `${priceFormatter.format(numericPrice)} ${CURRENCY_LOCAL}`;
};
