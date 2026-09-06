export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUND_PARTIAL' | 'REFUND_FULL';

// Тексты для клиентки в кабинете (в админке свои, см. admin/orders)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: 'Recebido',
  CONFIRMED: 'Confirmado',
  DELIVERED: 'Pronto para levantar',
  CANCELLED: 'Cancelado',
};

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PLACED: 'Recebemos o teu pedido. Vamos confirmar contigo no WhatsApp.',
  CONFIRMED: 'Pedido confirmado. Estamos a preparar as tuas peças.',
  DELIVERED: 'As peças estão prontas para experimentares no ponto de levantamento.',
  CANCELLED: 'Este pedido foi cancelado. Se tiveres dúvidas, fala connosco.',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, 'neutral' | 'primary' | 'success' | 'error'> = {
  PLACED: 'neutral',
  CONFIRMED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
};

export const orderStatusLabel = (status: string) => ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
export const orderStatusDescription = (status: string) => ORDER_STATUS_DESCRIPTIONS[status as OrderStatus] ?? '';
export const orderStatusColor = (status: string) => ORDER_STATUS_COLORS[status as OrderStatus] ?? 'neutral';
