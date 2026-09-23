/* eslint-disable camelcase */
export type CouponDiscountType = 'percent' | 'fixed';
export type CouponKind = 'public' | 'personal';

export type CouponSummary = {
  code: string
  discountType: CouponDiscountType
  value: number
};

export type OrderTotals = {
  subtotal: number
  discount: number
  total: number
  coupon?: CouponSummary | null
};

// Причины отказа из coupon_check() → текст для клиентки
export const COUPON_REASON_MESSAGES: Record<string, string> = {
  not_found: 'Este cupão não existe. Confirma o código.',
  inactive: 'Este cupão já não está ativo.',
  not_granted: 'Este cupão não está disponível para a tua conta.',
  expired: 'Este cupão expirou.',
  min_subtotal: 'O valor mínimo para este cupão ainda não foi atingido.',
  exhausted: 'Este cupão já foi todo utilizado.',
  already_used: 'Já usaste este cupão.',
};

export const couponReasonMessage = (reason?: string | null) =>
  (reason && COUPON_REASON_MESSAGES[reason]) || 'Não foi possível aplicar o cupão.';

export const couponLabel = (coupon: CouponSummary) =>
  (coupon.discountType === 'percent' ? `${coupon.value}%` : `${coupon.value.toLocaleString('pt-PT')} kz`);

// Старые заказы хранят только { total } — приводим к полной форме
export const normalizeTotals = (totals: any): OrderTotals => {
  const total = Number(totals?.total ?? 0);
  const subtotal = Number(totals?.subtotal ?? total);
  const discount = Number(totals?.discount ?? 0);

  return { subtotal, discount, total, coupon: totals?.coupon ?? null };
};
