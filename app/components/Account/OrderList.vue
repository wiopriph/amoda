<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice';
import { formatDate } from '~/utils/formatDate';
import { orderStatusColor, orderStatusLabel } from '#shared/constants/orderStatus';


export type AccountOrderSummary = {
  number: string
  status: string
  paymentStatus: string
  total: number
  createdAt: string
  itemsCount: number
  images: string[]
};

defineProps<{
  orders: AccountOrderSummary[]
}>();

const itemsLabel = (count: number) => (count === 1 ? '1 peça' : `${count} peças`);
</script>

<template>
  <div class="grid gap-3">
    <NuxtLink
      v-for="order in orders"
      :key="order.number"
      :to="{ name: 'conta-pedidos-number', params: { number: order.number } }"
      class="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition hover:border-primary/30 sm:p-4"
    >
      <div class="flex shrink-0 -space-x-3">
        <NuxtImg
          v-for="(image, imageIndex) in order.images.length ? order.images : ['/placeholder.webp']"
          :key="`${order.number}-${imageIndex}`"
          :src="image"
          alt=""
          class="h-16 w-12 rounded-xl border-2 border-white object-cover"
        />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="text-sm font-black text-highlighted">
            #{{ order.number }}
          </span>

          <UBadge
            :color="orderStatusColor(order.status)"
            variant="subtle"
            size="sm"
          >
            {{ orderStatusLabel(order.status) }}
          </UBadge>
        </div>

        <div class="mt-1 text-xs text-muted">
          {{ formatDate(order.createdAt) }} · {{ itemsLabel(order.itemsCount) }}
        </div>

        <div class="mt-1 text-sm font-bold text-primary">
          {{ formatPrice(order.total) }}
        </div>
      </div>

      <UIcon
        name="i-heroicons-chevron-right"
        class="size-5 shrink-0 text-muted"
      />
    </NuxtLink>
  </div>
</template>
