<script setup lang="ts">
import { CONTACT_PHONE } from '~/constants/contacts';


definePageMeta({ name: 'order-number' });

const { t } = useI18n();
const route = useRoute();
const localeRoute = useLocaleRoute();

const { data: orderData, error: orderError, pending: isPending } = await useFetch('/api/orders/get', {
  query: { number: route.params.number },
});

const order = computed(() => orderData.value as any || null);

const formatAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val || 0)} AOA`;

const toTel = (phone?: string | null) => {
  if (!phone) {
    return '';
  }

  return phone.replace(/[^\d+]/g, '');
};

const pickupMapUrl = computed(() => {
  const office = order.value?.pickupOffice;

  if (!office) {
    return null;
  }

  if (office.mapUrl) {
    return office.mapUrl;
  }

  if (office.locationLat && office.locationLng) {
    return `https://www.google.com/maps?q=${office.locationLat},${office.locationLng}`;
  }

  return null;
});

const whatsappHref = computed(() => {
  const text = encodeURIComponent(
    `Olá! Quero confirmar a minha reserva #${route.params.number}.`,
  );

  return `https://wa.me/${toTel(CONTACT_PHONE)}?text=${text}`;
});

const pageTitle = computed(() => `${t('order.title')} #${route.params.number} | Amoda`);
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
      "title": "Reserva",
      "loading": "A carregar reserva...",
      "notFound": "Reserva não encontrada",
      "successTitle": "Reserva criada com sucesso",
      "number": "Número da reserva",
      "contact": "Os seus dados",
      "summary": "Itens reservados",
      "total": "Total se levar tudo",
      "size": "Tamanho",
      "color": "Cor",
      "call": "Ligar",
      "map": "Abrir no Google Maps",
      "whatsapp": "Falar connosco no WhatsApp",
      "note": "Você ainda não pagou nada. O valor é apenas uma referência. Pague apenas depois de experimentar e só pelo que decidir levar.",
      "pickup": {
        "title": "Ponto para experimentar",
        "notSelected": "O ponto não foi selecionado."
      },
      "next": {
        "title": "O que acontece agora?",
        "step1": "Preparamos os seus itens.",
        "step2": "Entramos em contacto no WhatsApp.",
        "step3": "Você experimenta e decide com calma."
      },
      "meta": {
        "description": "Detalhes da sua reserva #{number}: contacto, ponto de experimentação e itens reservados. Sem pagamento online."
      }
    }
  },
  "en": {
    "order": {
      "title": "Reservation",
      "loading": "Loading reservation...",
      "notFound": "Reservation not found",
      "successTitle": "Reservation created successfully",
      "number": "Reservation number",
      "contact": "Your details",
      "summary": "Reserved items",
      "total": "Total if you keep everything",
      "size": "Size",
      "color": "Color",
      "call": "Call",
      "map": "Open in Google Maps",
      "whatsapp": "Chat with us on WhatsApp",
      "note": "You have not paid anything yet. The amount is only a reference. Pay only after trying and only for what you decide to keep.",
      "pickup": {
        "title": "Try-on point",
        "notSelected": "Pickup point was not selected."
      },
      "next": {
        "title": "What happens next?",
        "step1": "We prepare your items.",
        "step2": "We contact you on WhatsApp.",
        "step3": "You try and decide calmly."
      },
      "meta": {
        "description": "Details of your reservation #{number}: contact, try-on point and reserved items. No online payment."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <UCard
        v-if="isPending"
        class="py-10 text-center text-muted"
      >
        {{ t('order.loading') }}
      </UCard>

      <UAlert
        v-else-if="orderError || !order"
        color="error"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :description="t('order.notFound')"
      />

      <template v-else>
        <section class="overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-primary/5 p-5 text-center shadow-sm sm:p-8">
          <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-700">
            <UIcon
              name="i-lucide-check"
              class="size-7"
            />
          </div>

          <h1 class="mt-4 text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
            {{ t('order.successTitle') }}
          </h1>

          <div class="mt-5 rounded-2xl bg-white/80 px-4 py-3">
            <div class="text-sm text-muted">
              {{ t('order.number') }}
            </div>

            <div class="text-2xl font-black text-primary">
              #{{ route.params.number }}
            </div>
          </div>

          <div class="mt-5 grid gap-3 sm:flex sm:justify-center">
            <UButton
              size="xl"
              color="success"
              :to="whatsappHref"
              target="_blank"
              icon="i-simple-icons-whatsapp"
              class="justify-center"
            >
              {{ t('order.whatsapp') }}
            </UButton>
          </div>
        </section>

        <section class="mt-5 grid gap-5 sm:mt-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div class="space-y-5">
            <UCard>
              <h2 class="text-lg font-black text-highlighted">
                {{ t('order.pickup.title') }}
              </h2>

              <template v-if="order.pickupOffice">
                <div class="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <div class="font-bold text-highlighted">
                    {{ order.pickupOffice.name }}
                  </div>

                  <p
                    v-if="order.pickupOffice.address"
                    class="mt-2 text-sm leading-6"
                  >
                    {{ order.pickupOffice.address }}
                  </p>

                  <div class="mt-4 grid gap-2 sm:flex">
                    <UButton
                      v-if="order.pickupOffice.phone"
                      :to="`tel:${toTel(order.pickupOffice.phone)}`"
                      icon="i-lucide-phone"
                      color="neutral"
                      variant="soft"
                      size="md"
                      class="justify-center"
                    >
                      {{ t('order.call') }}
                    </UButton>

                    <UButton
                      v-if="pickupMapUrl"
                      :to="pickupMapUrl"
                      target="_blank"
                      icon="i-lucide-map-pin"
                      color="primary"
                      variant="soft"
                      size="md"
                      class="justify-center"
                    >
                      {{ t('order.map') }}
                    </UButton>
                  </div>
                </div>
              </template>

              <p
                v-else
                class="mt-3 text-sm italic text-muted"
              >
                {{ t('order.pickup.notSelected') }}
              </p>
            </UCard>

            <UCard>
              <h2 class="text-lg font-black text-highlighted">
                {{ t('order.summary') }}
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
                      class="line-clamp-2 text-sm font-bold text-highlighted hover:text-primary"
                      :to="localeRoute({ name: 'product-slug', params: { slug: item.slug } })"
                    >
                      {{ item.title }}
                    </NuxtLink>

                    <div class="mt-1 text-xs text-muted">
                      {{ t('order.size') }}: {{ item.variant?.size || '—' }} ·
                      {{ t('order.color') }}: {{ item.variant?.color || '—' }}
                    </div>

                    <div class="mt-2 flex items-center justify-between gap-3">
                      <div class="text-xs text-muted">
                        {{ item.qty }} × {{ formatAOA(item.unitPrice) }}
                      </div>

                      <div class="text-sm font-black text-primary">
                        {{ formatAOA(item.totalPrice) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 border-t pt-4">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold text-highlighted">
                    {{ t('order.total') }}
                  </span>

                  <span class="text-lg font-black text-primary">
                    {{ formatAOA(order.totals.total) }}
                  </span>
                </div>

                <p class="mt-2 text-xs leading-5 text-muted">
                  {{ t('order.note') }}
                </p>
              </div>
            </UCard>
          </div>

          <aside class="space-y-5">
            <UCard>
              <h2 class="text-base font-bold text-highlighted">
                {{ t('order.next.title') }}
              </h2>

              <div class="mt-4 space-y-3">
                <div class="flex gap-3">
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    1
                  </div>

                  <p class="text-sm leading-6 text-muted">
                    {{ t('order.next.step1') }}
                  </p>
                </div>

                <div class="flex gap-3">
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    2
                  </div>

                  <p class="text-sm leading-6 text-muted">
                    {{ t('order.next.step2') }}
                  </p>
                </div>

                <div class="flex gap-3">
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    3
                  </div>

                  <p class="text-sm leading-6 text-muted">
                    {{ t('order.next.step3') }}
                  </p>
                </div>
              </div>
            </UCard>

            <UCard>
              <h2 class="text-base font-bold text-highlighted">
                {{ t('order.contact') }}
              </h2>

              <div class="mt-3 text-sm leading-6">
                <div class="font-semibold text-highlighted">
                  {{ order.guestContact?.name || '—' }}
                </div>

                <a
                  v-if="order.guestContact?.phone"
                  :href="`tel:${toTel(order.guestContact.phone)}`"
                  class="text-primary underline underline-offset-4"
                >
                  {{ order.guestContact.phone }}
                </a>
              </div>
            </UCard>
          </aside>
        </section>
      </template>
    </UPageBody>
  </UPage>
</template>
