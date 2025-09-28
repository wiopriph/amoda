<script setup lang="ts">
definePageMeta({ name: 'order-number' });

const { t } = useI18n();
const currentRoute = useRoute();
const localeRoute = useLocaleRoute();

const {
  data: orderResponse,
  error: fetchError,
  pending: isLoading,
} = await useFetch('/api/orders/get', {
  query: { number: currentRoute.params.number },
});

const orderData = computed(() => orderResponse.value);
const formatPrice = (value?: number) => `${((value ?? 0) / 100).toFixed(2)} AOA`;

const pageTitle = computed(() =>
  `${t('order.title')} №${currentRoute.params.number} | Amoda`,
);
const pageDescription = computed(() =>
  t('order.meta.description', { number: String(currentRoute.params.number) }),
);

useHead(() => ({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: pageDescription.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDescription.value },
    { property: 'og:type', content: 'website' },
    { property: 'twitter:title', content: pageTitle.value },
    { property: 'twitter:description', content: pageDescription.value },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));
</script>

<i18n lang="json">
{
  "pt-AO": {
    "order": {
      "title": "Encomenda",
      "loading": "A carregar...",
      "notFound": "Encomenda não encontrada",
      "colItem": "Artigo",
      "colPrice": "Preço",
      "colQty": "Qtd.",
      "colSum": "Total",
      "subtotal": "Subtotal",
      "discount": "Desconto",
      "delivery": "Entrega",
      "total": "Total",
      "meta": {
        "description": "Detalhes da encomenda n.º {number}."
      }
    }
  },
  "en": {
    "order": {
      "title": "Order",
      "loading": "Loading...",
      "notFound": "Order not found",
      "colItem": "Item",
      "colPrice": "Price",
      "colQty": "Qty",
      "colSum": "Amount",
      "subtotal": "Subtotal",
      "discount": "Discount",
      "delivery": "Delivery",
      "total": "Total",
      "meta": {
        "description": "Order details No. {number}."
      }
    }
  }
}
</i18n>

<template>
  <section class="container mx-auto px-3 py-6 max-w-4xl">
    <h1 class="text-2xl font-semibold mb-6">
      {{ t('order.title') }} №{{ currentRoute.params.number }}
    </h1>

    <div v-if="isLoading">
      {{ t('order.loading') }}
    </div>

    <div v-else-if="fetchError">
      {{ t('order.notFound') }}
    </div>

    <div v-else-if="orderData">
      <!-- Таблица покупок -->
      <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-800">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead class="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium">
                {{ t('order.colItem') }}
              </th>

              <th class="px-4 py-3 text-right text-sm font-medium">
                {{ t('order.colPrice') }}
              </th>

              <th class="px-4 py-3 text-right text-sm font-medium">
                {{ t('order.colQty') }}
              </th>

              <th class="px-4 py-3 text-right text-sm font-medium">
                {{ t('order.colSum') }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
            <tr
              v-for="orderRow in orderData.items"
              :key="orderRow.id"
            >
              <!-- Товар -->
              <td class="px-4 py-3 text-left">
                <div class="flex items-center gap-3">
                  <img
                    :src="orderRow.image"
                    alt=""
                    class="w-14 h-14 object-cover rounded border"
                  >

                  <div>
                    <NuxtLink
                      class="font-medium hover:underline"
                      :to="localeRoute({ name: 'product-slug', params: { slug: orderRow.slug } })"
                    >
                      {{ orderRow.title }}
                    </NuxtLink>

                    <div class="text-xs text-gray-500">
                      <span v-if="orderRow.variant?.size">Size: {{ orderRow.variant.size }}</span>

                      <span v-if="orderRow.variant?.color">
                        <span v-if="orderRow.variant?.size"> · </span>Color: {{ orderRow.variant.color }}
                      </span>

                      <span v-if="orderRow.variant?.sku">
                        <span v-if="orderRow.variant?.size || orderRow.variant?.color"> · </span>SKU: {{ orderRow.variant.sku }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Цена / Количество / Сумма -->
              <td class="px-4 py-3 text-sm text-right">
                {{ formatPrice(orderRow.unit_price) }}
              </td>

              <td class="px-4 py-3 text-sm text-right">
                {{ orderRow.qty }}
              </td>

              <td class="px-4 py-3 font-semibold text-right">
                {{ formatPrice(orderRow.total_price) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Итоги -->
      <div class="mt-6 max-w-sm ml-auto space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-300">{{ t('order.subtotal') }}</span>

          <span class="text-right">{{ formatPrice(orderData.totals?.subtotal ?? orderData.totals?.total) }}</span>
        </div>

        <div
          v-if="orderData.totals?.discount"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-gray-600 dark:text-gray-300">{{ t('order.discount') }}</span>

          <span class="text-right">-{{ formatPrice(orderData.totals.discount) }}</span>
        </div>

        <div
          v-if="orderData.totals?.delivery"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-gray-600 dark:text-gray-300">{{ t('order.delivery') }}</span>

          <span class="text-right">{{ formatPrice(orderData.totals.delivery) }}</span>
        </div>

        <div class="flex items-center justify-between text-lg font-semibold border-t pt-3">
          <span>{{ t('order.total') }}</span>

          <span class="text-right">{{ formatPrice(orderData.totals?.total) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
