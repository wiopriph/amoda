<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice';
import { formatDate } from '~/utils/formatDate';
import { couponLabel, type CouponSummary } from '#shared/constants/coupons';


definePageMeta({ name: 'conta-cupoes', layout: 'account', middleware: 'account' });

useHead({
  title: 'Os meus cupões | Amoda',
  meta: [
    { name: 'description', content: 'Os cupões de desconto disponíveis na tua conta Amoda.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

type AccountCoupon = CouponSummary & {
  minSubtotal: number | null
  maxDiscount: number | null
  expiresAt: string | null
  status: 'available' | 'used' | 'expired' | 'inactive'
  usedInOrder: string | null
};

const { data: coupons, error } = await useFetch<AccountCoupon[]>('/api/account/coupons');

const STATUS_LABELS: Record<AccountCoupon['status'], string> = {
  available: 'Disponível',
  used: 'Usado',
  expired: 'Expirado',
  inactive: 'Indisponível',
};

const STATUS_COLORS: Record<AccountCoupon['status'], 'success' | 'neutral' | 'error'> = {
  available: 'success',
  used: 'neutral',
  expired: 'error',
  inactive: 'neutral',
};

const conditions = (coupon: AccountCoupon) => {
  const parts: string[] = [];

  if (coupon.minSubtotal) {
    parts.push(`em compras a partir de ${formatPrice(coupon.minSubtotal)}`);
  }

  if (coupon.maxDiscount) {
    parts.push(`até ${formatPrice(coupon.maxDiscount)}`);
  }

  return parts.join(' · ');
};
</script>

<template>
  <div class="space-y-5">
    <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
      <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
        Os meus cupões
      </h1>

      <p class="mt-2 text-sm leading-6 text-muted sm:text-base">
        Os cupões disponíveis aplicam-se sozinhos quando fazes um pedido no site.
      </p>
    </section>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      description="Não foi possível carregar os cupões. Atualiza a página."
    />

    <div
      v-else-if="coupons?.length"
      class="grid gap-3"
    >
      <div
        v-for="coupon in coupons"
        :key="coupon.code"
        :class="coupon.status === 'available' ? 'border-primary/30' : 'opacity-70'"
        class="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4"
      >
        <div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UIcon
            name="i-lucide-ticket"
            class="size-6"
          />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="text-lg font-black text-highlighted">
              {{ couponLabel(coupon) }}
            </span>

            <span class="text-sm font-semibold text-muted">
              {{ coupon.code }}
            </span>

            <UBadge
              :color="STATUS_COLORS[coupon.status]"
              variant="subtle"
              size="sm"
            >
              {{ STATUS_LABELS[coupon.status] }}
            </UBadge>
          </div>

          <div class="mt-1 text-xs text-muted">
            <span v-if="coupon.status === 'used' && coupon.usedInOrder">
              Usado no pedido #{{ coupon.usedInOrder }}
            </span>

            <span v-else-if="coupon.expiresAt">
              Válido até {{ formatDate(coupon.expiresAt) }}
            </span>

            <span v-if="conditions(coupon)">
              · {{ conditions(coupon) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <UEmpty
      v-else
      icon="i-lucide-ticket"
      title="Ainda não tens cupões."
      description="Quando tiveres um desconto disponível, ele aparece aqui."
    />
  </div>
</template>
