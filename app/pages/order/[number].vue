<script setup lang="ts">
definePageMeta({ name: 'order-number' });

const route = useRoute();
const orderNumber = String(route.params.number);


const {
  data: order,
  error: orderError,
  pending: isOrderPending,
} = await useFetch<any>('/api/orders/get', { query: { number: orderNumber } });

const orderItems = computed(() => order.value?.items || []);
const orderTotal = computed(() => order.value?.totals?.total ?? 0);

const pickupOffice = computed(() => order.value?.pickupOffice || null);
const pickupMapUrl = computed(() => {
  const office = pickupOffice.value;

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

const guestContact = computed(() => order.value?.guestContact || null);

const nextSteps = [
  'Preparamos os seus itens.',
  'Entramos em contacto no WhatsApp.',
  'Você experimenta e decide com calma.',
];

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => `Olá! Quero confirmar a minha escolha #${orderNumber}.`);


const formatPrice = (price: number) => `${new Intl.NumberFormat('pt-AO').format(price || 0)} AOA`;
const normalizePhoneNumber = (phone?: string | null) => phone?.replace(/[^\d+]/g, '') || '';


const title = `Reserva #${orderNumber} | Amoda`;
const description = `Detalhes da sua reserva #${orderNumber}: contacto, ponto de experimentação e itens reservados. Sem pagamento online.`;

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-6xl sm:px-6 lg:px-8">
      <UCard
        v-if="isOrderPending"
        class="py-10 text-center text-muted"
      >
        A carregar reserva...
      </UCard>

      <UAlert
        v-else-if="orderError || !order"
        color="error"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        description="Reserva não encontrada"
      />

      <template v-else>
        <section class="mb-2 overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-50 via-white to-primary/5 p-5 text-center shadow-sm sm:p-8">
          <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-700">
            <UIcon
              name="i-lucide-check"
              class="size-7"
            />
          </div>

          <h1 class="mt-4 text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
            Reserva criada com sucesso
          </h1>

          <div class="mt-5 rounded-2xl bg-white/80 px-4 py-3">
            <div class="text-sm text-muted">
              Número da reserva
            </div>

            <div class="text-2xl font-black text-primary">
              #{{ orderNumber }}
            </div>
          </div>

          <div class="mt-5 grid gap-3 sm:flex sm:justify-center">
            <UButton
              :to="whatsappHref"
              size="xl"
              color="success"
              target="_blank"
              icon="i-simple-icons-whatsapp"
              class="justify-center"
            >
              Falar connosco no WhatsApp
            </UButton>
          </div>
        </section>

        <section class="mt-5 grid gap-5 sm:mt-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div class="space-y-5">
            <UCard>
              <h2 class="text-lg font-black text-highlighted">
                Ponto para experimentar
              </h2>

              <template v-if="pickupOffice">
                <div class="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <div class="font-bold text-highlighted">
                    {{ pickupOffice.name }}
                  </div>

                  <p
                    v-if="pickupOffice.address"
                    class="mt-2 text-sm leading-6"
                  >
                    {{ pickupOffice.address }}
                  </p>

                  <div class="mt-4 grid gap-2 sm:flex">
                    <UButton
                      v-if="pickupOffice.phone"
                      :to="`tel:${normalizePhoneNumber(pickupOffice?.phone)}`"
                      icon="i-lucide-phone"
                      color="neutral"
                      variant="soft"
                      size="md"
                      class="justify-center"
                    >
                      Ligar
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
                      Abrir no Google Maps
                    </UButton>
                  </div>
                </div>
              </template>

              <p
                v-else
                class="mt-3 text-sm italic text-muted"
              >
                O ponto não foi selecionado.
              </p>
            </UCard>

            <UCard>
              <h2 class="text-lg font-black text-highlighted">
                Itens reservados
              </h2>

              <div class="mt-4 divide-y divide-gray-100">
                <div
                  v-for="orderItem in orderItems"
                  :key="orderItem.id"
                  class="flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <NuxtImg
                    :src="orderItem.image || '/placeholder.webp'"
                    :alt="orderItem.title"
                    class="h-20 w-16 shrink-0 rounded-2xl object-cover"
                  />

                  <div class="min-w-0 flex-1">
                    <NuxtLink
                      :to="{ name: 'product-slug', params: { slug: orderItem.slug } }"
                      class="line-clamp-2 text-sm font-bold text-highlighted hover:text-primary"
                    >
                      {{ orderItem.title }}
                    </NuxtLink>

                    <div class="mt-1 text-xs text-muted">
                      Tamanho: {{ orderItem.variant?.size || '—' }} ·
                      Cor: {{ orderItem.variant?.color || '—' }}
                    </div>

                    <div class="mt-2 flex items-center justify-between gap-3">
                      <div class="text-xs text-muted">
                        {{ orderItem.qty }} × {{ formatPrice(orderItem.unitPrice) }}
                      </div>

                      <div class="text-sm font-black text-primary">
                        {{ formatPrice(orderItem.totalPrice) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 border-t pt-4">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm font-semibold text-highlighted">
                    Total se levar tudo
                  </span>

                  <span class="text-lg font-black text-primary">
                    {{ formatPrice(orderTotal) }}
                  </span>
                </div>

                <p class="mt-2 text-xs leading-5 text-muted">
                  Você ainda não pagou nada. O valor é apenas uma referência. Pague apenas depois de experimentar e só pelo que decidir levar.
                </p>
              </div>
            </UCard>
          </div>

          <aside class="space-y-5">
            <UCard>
              <h2 class="text-base font-bold text-highlighted">
                O que acontece agora?
              </h2>

              <div class="mt-4 space-y-3">
                <div
                  v-for="(nextStep, nextStepIndex) in nextSteps"
                  :key="nextStep"
                  class="flex gap-3"
                >
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {{ nextStepIndex + 1 }}
                  </div>

                  <p class="text-sm leading-6 text-muted">
                    {{ nextStep }}
                  </p>
                </div>
              </div>
            </UCard>

            <UCard>
              <h2 class="text-base font-bold text-highlighted">
                Os seus dados
              </h2>

              <div class="mt-3 text-sm leading-6">
                <div
                  v-if="guestContact?.name"
                  class="font-semibold text-highlighted"
                  v-text="guestContact.name"
                />

                <a
                  v-if="guestContact?.phone"
                  :href="`tel:${normalizePhoneNumber(guestContact?.phone)}`"
                  class="text-primary underline underline-offset-4"
                >
                  {{ guestContact.phone }}
                </a>
              </div>
            </UCard>
          </aside>
        </section>
      </template>
    </UPageBody>
  </UPage>
</template>
