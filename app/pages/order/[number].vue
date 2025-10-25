<script setup lang="ts">
definePageMeta({ name: 'order-number' });

const { t } = useI18n();
const route = useRoute();

const { data, error, pending } = await useFetch('/api/orders/get', {
  query: { number: route.params.number },
});

const order = computed(() => data.value);

const fmtAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val)} AOA`;


const pageTitle = computed(() => `${t('order.title')} №${route.params.number} | Amoda`);
const pageDescription = computed(() => t('order.meta.description', { number: String(route.params.number) }));

useHead(() => ({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: pageDescription.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDescription.value },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const localeRoute = useLocaleRoute();
</script>

<i18n lang="json">
{
  "pt-AO": {
    "order": {
      "title": "Encomenda",
      "loading": "A carregar...",
      "notFound": "Encomenda não encontrada",
      "summary": "Resumo da encomenda",
      "contact": "Contacto",
      "saveNotice": "Guarde o número da sua encomenda para acompanhar o levantamento no ponto de entrega.",
      "colItem": "Artigo",
      "colPrice": "Preço",
      "colQty": "Qtd.",
      "colSum": "Total",
      "size": "Tamanho",
      "color": "Cor",
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
      "summary": "Order summary",
      "contact": "Contact",
      "saveNotice": "Please save your order number to track and collect your purchase at the pickup point.",
      "colItem": "Item",
      "colPrice": "Price",
      "colQty": "Qty",
      "colSum": "Total",
      "size": "Size",
      "color": "Color",
      "total": "Total",
      "meta": {
        "description": "Order details No. {number}."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="`${t('order.title')} №${route.params.number}`"
    />

    <UPageBody class="max-w-4xl mx-auto">
      <UCard
        v-if="pending"
        class="p-6 text-center text-gray-500"
      >
        {{ t('order.loading') }}
      </UCard>

      <UAlert
        v-else-if="error || !order"
        color="error"
        variant="soft"
        :description="t('order.notFound')"
        icon="i-heroicons-exclamation-triangle"
      />

      <template v-else>
        <UAlert
          :description="t('order.saveNotice')"
          color="primary"
          variant="subtle"
          icon="i-heroicons-information-circle"
          class="mb-4"
        />

        <UCard class="mb-6">
          <p class="text-sm text-gray-500">
            {{ t('order.contact') }}
          </p>

          <p class="font-semibold">
            {{ order.guest_contact?.name }}
          </p>

          <p class="text-sm text-gray-500">
            {{ order.guest_contact?.phone }} · {{ order.guest_contact?.email }}
          </p>
        </UCard>

        <UCard>
          <h2 class="text-lg font-semibold mb-4">
            {{ t('order.summary') }}
          </h2>

          <div class="divide-y divide-gray-200">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex items-center justify-between py-3 gap-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <NuxtImg
                  :src="item.image"
                  class="w-16 h-16 rounded border object-cover"
                />

                <div class="min-w-0">
                  <NuxtLink
                    class="font-medium hover:underline line-clamp-2"
                    :to="localeRoute({ name: 'product-slug', params: { slug: item.slug } })"
                  >
                    {{ item.title }}
                  </NuxtLink>

                  <div class="text-xs text-gray-500">
                    {{ t('order.size') }}: {{ item.variant?.size }} ·
                    {{ t('order.color') }}: {{ item.variant?.color }}
                  </div>
                </div>
              </div>

              <div class="text-right shrink-0">
                <div class="text-sm text-gray-600">
                  {{ item.qty }} × {{ fmtAOA(item.unit_price) }}
                </div>

                <div class="font-semibold">
                  {{ fmtAOA(item.total_price) }}
                </div>
              </div>
            </div>
          </div>

          <div class="border-t mt-4 pt-3 text-right text-lg font-semibold">
            {{ t('order.total') }}: {{ fmtAOA(order.totals.total) }}
          </div>
        </UCard>
      </template>
    </UPageBody>
  </UPage>
</template>
