<script setup lang="ts">
definePageMeta({ name: 'order-number' });

const { t } = useI18n();
const route = useRoute();
const localeRoute = useLocaleRoute();

const { data: orderData, error: orderError, pending: isPending } = await useFetch('/api/orders/get', {
  query: { number: route.params.number },
});

const order = computed(() => orderData.value as any || null);
const formatAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val)} AOA`;

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
</script>

<i18n lang="json">
{
  "pt": {
    "order": {
      "title": "Encomenda",
      "loading": "A carregar...",
      "notFound": "Encomenda não encontrada",
      "summary": "Resumo da encomenda",
      "contact": "Contacto",
      "pickup": {
        "title": "Ponto de levantamento",
        "notSelected": "O ponto de levantamento não foi selecionado."
      },
      "saveNotice": "Guarde o número da sua encomenda para acompanhar o levantamento no ponto de entrega. A Amoda irá notificá-lo quando estiver pronta para recolha.",
      "colItem": "Artigo",
      "colPrice": "Preço",
      "colQty": "Qtd.",
      "colSum": "Total",
      "size": "Tamanho",
      "color": "Cor",
      "total": "Total",
      "meta": {
        "description": "Veja os detalhes e o estado da sua encomenda nº {number} — contacto, artigos e total. A Amoda Angola simplifica as suas compras online."
      },
      "seo": {
        "h1": "Detalhes da sua encomenda nº {number}"
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
      "pickup": {
        "title": "Pickup point",
        "notSelected": "Pickup point was not selected."
      },
      "saveNotice": "Save your order number to track pickup status. Amoda will contact you once your order is ready.",
      "colItem": "Item",
      "colPrice": "Price",
      "colQty": "Qty",
      "colSum": "Total",
      "size": "Size",
      "color": "Color",
      "total": "Total",
      "meta": {
        "description": "View details and status of your order No. {number} — contact info, items and total. Amoda Angola makes online shopping simple."
      },
      "seo": {
        "h1": "Order details No. {number}"
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('order.seo.h1', { number: route.params.number })"
      :ui="{ root: 'py-4', title: 'text-lg font-semibold md:text-xl' }"
    />

    <UPageBody class="max-w-4xl mx-auto">
      <UCard
        v-if="isPending"
        class="p-6 text-center text-gray-500"
      >
        {{ t('order.loading') }}
      </UCard>

      <UAlert
        v-else-if="orderError || !order"
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
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-1">
              <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {{ t('order.contact') }}
              </p>

              <p class="font-semibold">
                {{ order.guestContact?.name }}
              </p>

              <p
                v-if="order.guestContact?.email"
                class="text-sm text-gray-500 break-all"
              >
                {{ order.guestContact.email }}
              </p>

              <p class="text-sm text-gray-500">
                {{ order.guestContact?.phone }}
              </p>
            </div>

            <div class="space-y-1">
              <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {{ t('order.pickup.title') }}
              </p>

              <template v-if="order.pickupOffice">
                <p class="font-semibold">
                  {{ order.pickupOffice.name }}
                </p>

                <p class="text-sm text-gray-500">
                  {{ order.pickupOffice.address }}
                </p>

                <p class="text-sm mt-1">
                  <a
                    :href="`tel:${order.pickupOffice.phone}`"
                    class="text-primary underline underline-offset-2"
                  >
                    {{ order.pickupOffice.phone }}
                  </a>
                </p>
              </template>

              <template v-else>
                <p class="text-sm text-gray-500 italic">
                  {{ t('order.pickup.notSelected') }}
                </p>
              </template>
            </div>
          </div>
        </UCard>

        <UCard>
          <h2 class="text-lg font-semibold mb-4">
            {{ t('order.summary') }}
          </h2>

          <div class="divide-y divide-gray-200">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div class="flex items-center gap-3 min-w-0">
                <NuxtImg
                  :src="item.image"
                  class="w-16 h-16 rounded border object-cover flex-none"
                />

                <div class="min-w-0">
                  <NuxtLink
                    class="font-medium hover:underline line-clamp-2"
                    :to="localeRoute({ name: 'product-slug', params: { slug: item.slug } })"
                  >
                    {{ item.title }}
                  </NuxtLink>

                  <div class="mt-1 text-xs text-gray-500">
                    {{ t('order.size') }}: {{ item.variant?.size }} ·
                    {{ t('order.color') }}: {{ item.variant?.color }}
                  </div>
                </div>
              </div>

              <div class="text-right md:min-w-[140px]">
                <div class="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
                  {{ t('order.colQty') }} / {{ t('order.colPrice') }}
                </div>

                <div class="text-sm text-gray-600">
                  {{ item.qty }} × {{ formatAOA(item.unitPrice) }}
                </div>

                <div class="font-semibold">
                  {{ formatAOA(item.totalPrice) }}
                </div>
              </div>
            </div>
          </div>

          <div class="border-t mt-4 pt-3 text-right text-lg font-semibold">
            {{ t('order.total') }}: {{ formatAOA(order.totals.total) }}
          </div>
        </UCard>
      </template>
    </UPageBody>
  </UPage>
</template>
