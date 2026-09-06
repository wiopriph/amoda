<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice';
import { formatDate } from '~/utils/formatDate';
import { colorLabel } from '#shared/constants/colors';
import { orderStatusColor, orderStatusDescription, orderStatusLabel } from '#shared/constants/orderStatus';


const props = defineProps<{
  order: any
}>();

const pickupOffice = computed(() => props.order?.pickupOffice || null);

const pickupMapUrl = computed(() => {
  const office = pickupOffice.value;

  if (!office) {
    return null;
  }

  if (office.mapUrl) {
    return office.mapUrl;
  }

  return office.locationLat && office.locationLng ?
    `https://www.google.com/maps?q=${office.locationLat},${office.locationLng}` :
    null;
});

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => `Olá! Tenho uma dúvida sobre o meu pedido #${props.order?.number}.`);

const variantLabel = (item: any) => [item.variant?.size, colorLabel(item.variant?.color)].filter(Boolean).join(' · ');
</script>

<template>
  <div class="space-y-5">
    <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
      <UButton
        :to="{ name: 'conta' }"
        variant="link"
        color="neutral"
        icon="i-heroicons-arrow-left"
        class="-ml-2 mb-3 px-2"
        size="sm"
      >
        Os meus pedidos
      </UButton>

      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
          Pedido #{{ order.number }}
        </h1>

        <UBadge
          :color="orderStatusColor(order.status)"
          variant="subtle"
        >
          {{ orderStatusLabel(order.status) }}
        </UBadge>
      </div>

      <p class="mt-2 text-sm text-muted">
        {{ formatDate(order.createdAt) }}
      </p>

      <p class="mt-3 text-sm leading-6 text-toned sm:text-base">
        {{ orderStatusDescription(order.status) }}
      </p>

      <UButton
        :to="whatsappHref"
        target="_blank"
        color="success"
        icon="i-simple-icons-whatsapp"
        class="mt-4 justify-center"
      >
        Falar sobre este pedido
      </UButton>
    </section>

    <div class="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
      <UCard>
        <h2 class="text-lg font-black text-highlighted">
          Peças
        </h2>

        <div class="mt-4 divide-y divide-gray-100">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex gap-3 py-3 first:pt-0 last:pb-0"
          >
            <NuxtImg
              :src="item.image || '/placeholder.webp'"
              :alt="item.title"
              class="h-20 w-16 shrink-0 rounded-2xl object-cover"
            />

            <div class="min-w-0 flex-1">
              <NuxtLink
                :to="{ name: 'product-slug', params: { slug: item.slug } }"
                class="line-clamp-2 text-sm font-bold text-highlighted hover:text-primary"
              >
                {{ item.title }}
              </NuxtLink>

              <div
                v-if="variantLabel(item)"
                class="mt-1 text-xs text-muted"
                v-text="variantLabel(item)"
              />

              <div class="mt-2 flex items-center justify-between gap-3">
                <div class="text-xs text-muted">
                  {{ item.qty }} × {{ formatPrice(item.unitPrice) }}
                </div>

                <div class="text-sm font-black text-primary">
                  {{ formatPrice(item.totalPrice) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between gap-4 border-t pt-4">
          <span class="text-sm font-semibold text-highlighted">
            Total se levares tudo
          </span>

          <span class="text-lg font-black text-primary">
            {{ formatPrice(order.totals?.total ?? 0) }}
          </span>
        </div>

        <p class="mt-2 text-xs leading-5 text-muted">
          Pagas só depois de experimentar e apenas o que decidires levar.
        </p>
      </UCard>

      <UCard v-if="pickupOffice">
        <h2 class="text-base font-bold text-highlighted">
          Ponto para experimentar
        </h2>

        <div class="mt-3 font-bold text-highlighted">
          {{ pickupOffice.name }}
        </div>

        <p
          v-if="pickupOffice.address"
          class="mt-1 text-sm leading-6 text-muted"
        >
          {{ pickupOffice.address }}
        </p>

        <UButton
          v-if="pickupMapUrl"
          :to="pickupMapUrl"
          target="_blank"
          icon="i-lucide-map-pin"
          color="primary"
          variant="soft"
          size="md"
          class="mt-4 w-full justify-center"
        >
          Abrir no Google Maps
        </UButton>
      </UCard>
    </div>
  </div>
</template>
