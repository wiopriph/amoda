<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui';
import { vMaska } from 'maska/vue';
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'checkout' });

const { t, tm, rt } = useI18n();

useHead(() => ({
  title: t('checkout.meta.title'),
  meta: [
    { name: 'description', content: t('checkout.meta.description') },
    { property: 'og:title', content: t('checkout.meta.title') },
    { property: 'og:description', content: t('checkout.meta.description') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const { items, totalAOA, clear } = useCart();
const { trackPurchase } = useAnalyticsEvent();

const localeRoute = useLocaleRoute();

const redirectIfEmpty = () => {
  if (!items.value.length) {
    navigateTo(localeRoute({ name: 'cart' }));
  }
};

if (process.client) {
  onMounted(redirectIfEmpty);
}

const { data: officesData } = await useFetch('/api/offices/list');
const offices = computed(() => officesData.value?.items || []);

const officeItems = computed<SelectMenuItem[]>(() =>
  offices.value.map((o: any) => ({
    label: o.name,
    value: o.id,
    address: o.address,
  })),
);

const form = reactive({
  name: '',
  phone: '',
  pickupOfficeId: offices.value?.[0]?.id ?? null,
});

const pending = ref(false);
const message = ref<string | null>(null);

const fmtAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val)} AOA`;

const totalCount = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0));

const steps = computed(() =>
  (tm('checkout.steps.items') as any[]).map((item) => ({
    title: rt(item.title),
    desc: rt(item.desc),
  })),
);

const trustItems = computed(() =>
  (tm('checkout.trust.items') as any[]).map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
  })),
);

const selectedOffice = computed(() =>
  offices.value.find((office: any) => office.id === form.pickupOfficeId),
);

const toTel = (phone?: string | null) => {
  if (!phone) {
    return '';
  }

  return phone.replace(/[^\d+]/g, '');
};

const selectedOfficeMapUrl = computed(() => {
  const office = selectedOffice.value;

  if (!office) {
    return null;
  }

  if (office.map_url) {
    return office.map_url;
  }

  if (office.location_lat && office.location_lng) {
    return `https://www.google.com/maps?q=${office.location_lat},${office.location_lng}`;
  }

  return null;
});

const submit = async () => {
  if (!items.value.length) {
    message.value = t('checkout.errors.empty');

    return;
  }

  if (!form.pickupOfficeId) {
    message.value = t('checkout.errors.pickupRequired');

    return;
  }

  pending.value = true;
  message.value = null;

  try {
    const dtoItems = items.value.map(i => ({
      productId: i.productId,
      variantId: i.variantId,
      sizeId: i.sizeId,
      title: i.productName,
      price: i.price,
      qty: i.qty,
      slug: i.slug,
      image: i.image ?? null,
    }));

    const { number } = await $fetch('/api/checkout/place-order', {
      method: 'POST',
      body: {
        items: dtoItems,
        totals: { total: unref(totalAOA), currency: 'AOA' },
        contact: {
          name: form.name,
          phone: form.phone,
        },
        pickupOfficeId: form.pickupOfficeId,
      },
    });

    if (import.meta.client) {
      trackPurchase({
        transaction_id: String(number),
        value: totalAOA.value,
        items: items.value.map(i =>
          makeGa4Item({
            productId: i.productId,
            name: i.productName,
            brand: i.brand ?? undefined,
            price: i.price,
            quantity: i.qty,
            variantId: i.variantId,
            sizeId: i.sizeId,
            variantLabel: i.variantLabel ?? undefined,
            sizeLabel: i.sizeLabel ?? undefined,
            categoryName: i.categoryName ?? undefined,
          }),
        ),
        pickup_office_id: form.pickupOfficeId,
      } as any);
    }

    await navigateTo(localeRoute({ name: 'order-number', params: { number } }));

    clear();
  } catch (error: any) {
    message.value = error?.data?.message || t('checkout.errors.common');
  } finally {
    pending.value = false;
  }
};
</script>

<i18n lang="json">
{
  "pt": {
    "checkout": {
      "title": "Confirmar reserva",
      "subtitle": "Não paga agora. Só precisamos dos seus dados para preparar as peças para experimentar.",
      "badge": "Reserva grátis",
      "name": "O seu nome",
      "phone": "WhatsApp",
      "submit": "Confirmar reserva grátis",
      "backToCart": "Voltar à seleção",
      "formTitle": "Os seus dados",
      "formDesc": "Vamos usar estes dados apenas para confirmar a reserva no WhatsApp.",
      "pickup": {
        "title": "Onde quer experimentar?",
        "label": "Ponto de experimentação",
        "placeholder": "Escolha um ponto",
        "help": "Vamos preparar os itens neste ponto. Depois confirmamos tudo pelo WhatsApp."
      },
      "office": {
        "selectedTitle": "Ponto escolhido",
        "call": "Ligar",
        "map": "Abrir no Google Maps"
      },
      "summary": {
        "title": "Resumo",
        "items": "{count} item(ns)",
        "total": "Total se levar tudo",
        "note": "Este valor é apenas uma referência. Você só paga depois de experimentar e apenas pelo que decidir levar."
      },
      "trust": {
        "title": "Sem risco para você",
        "items": [
          {
            "icon": "i-lucide-wallet",
            "title": "Sem pagamento online"
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Experimente primeiro"
          },
          {
            "icon": "i-lucide-check-circle-2",
            "title": "Pague só o que gostar"
          }
        ]
      },
      "steps": {
        "title": "Depois de confirmar",
        "items": [
          {
            "title": "Recebemos a sua reserva",
            "desc": "A nossa equipa vê os itens escolhidos."
          },
          {
            "title": "Falamos no WhatsApp",
            "desc": "Confirmamos disponibilidade, ponto e horário."
          },
          {
            "title": "Você experimenta e decide",
            "desc": "Leva apenas o que gostar. Sem obrigação."
          }
        ]
      },
      "errors": {
        "empty": "A sua seleção está vazia.",
        "common": "Não foi possível enviar a reserva. Tente novamente em alguns instantes.",
        "pickupRequired": "Escolha um ponto de experimentação."
      },
      "meta": {
        "title": "Confirmar reserva | Amoda Angola",
        "description": "Confirme a sua reserva grátis na Amoda. Sem pagamento online: experimente primeiro e pague apenas pelo que gostar."
      }
    }
  },
  "en": {
    "checkout": {
      "title": "Confirm reservation",
      "subtitle": "You do not pay now. We only need your details to prepare the items for try-on.",
      "badge": "Free reservation",
      "name": "Your name",
      "phone": "WhatsApp",
      "submit": "Confirm free reservation",
      "backToCart": "Back to selection",
      "formTitle": "Your details",
      "formDesc": "We will use these details only to confirm your reservation on WhatsApp.",
      "pickup": {
        "title": "Where do you want to try?",
        "label": "Try-on point",
        "placeholder": "Choose a point",
        "help": "We will prepare your items at this point. Then we confirm everything on WhatsApp."
      },
      "office": {
        "selectedTitle": "Selected point",
        "call": "Call",
        "map": "Open in Google Maps"
      },
      "summary": {
        "title": "Summary",
        "items": "{count} item(s)",
        "total": "Total if you keep everything",
        "note": "This amount is only a reference. You pay only after trying and only for what you decide to keep."
      },
      "trust": {
        "title": "No risk for you",
        "items": [
          {
            "icon": "i-lucide-wallet",
            "title": "No online payment"
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Try first"
          },
          {
            "icon": "i-lucide-check-circle-2",
            "title": "Pay only for what you like"
          }
        ]
      },
      "steps": {
        "title": "After confirmation",
        "items": [
          {
            "title": "We receive your reservation",
            "desc": "Our team sees your selected items."
          },
          {
            "title": "We message you on WhatsApp",
            "desc": "We confirm availability, point and time."
          },
          {
            "title": "You try and decide",
            "desc": "Keep only what you like. No obligation."
          }
        ]
      },
      "errors": {
        "empty": "Your selection is empty.",
        "common": "We could not send your reservation. Please try again shortly.",
        "pickupRequired": "Choose a try-on point."
      },
      "meta": {
        "title": "Confirm reservation | Amoda Angola",
        "description": "Confirm your free reservation at Amoda. No online payment: try first and pay only for what you like."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-5xl px-4 py-5 pb-28 sm:px-6 sm:py-8 sm:pb-8 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          {{ t('checkout.badge') }}
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          {{ t('checkout.title') }}
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          {{ t('checkout.subtitle') }}
        </p>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-toned">
          <div
            v-for="item in trustItems"
            :key="item.title"
            class="flex items-center gap-2"
          >
            <UIcon
              :name="item.icon"
              class="size-4 text-primary"
            />

            <span>{{ item.title }}</span>
          </div>
        </div>
      </section>

      <div class="mt-5 grid gap-5 sm:mt-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <section>
          <UForm
            class="space-y-4"
            @submit.prevent="submit"
          >
            <UCard>
              <h2 class="text-xl font-black text-highlighted">
                {{ t('checkout.formTitle') }}
              </h2>

              <p class="mt-1 text-sm leading-6 text-muted">
                {{ t('checkout.formDesc') }}
              </p>

              <div class="mt-5 grid gap-4">
                <UFormField :label="t('checkout.name')">
                  <UInput
                    v-model="form.name"
                    required
                    name="name"
                    placeholder="Ex: Maria Silva"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>

                <UFormField :label="t('checkout.phone')">
                  <UInput
                    v-model="form.phone"
                    v-maska="'+244 ### ### ###'"
                    required
                    name="phone"
                    placeholder="+244 XXX XXX XXX"
                    type="tel"
                    size="lg"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </UCard>

            <UCard>
              <h2 class="text-xl font-black text-highlighted">
                {{ t('checkout.pickup.title') }}
              </h2>

              <div class="mt-5">
                <UFormField :label="t('checkout.pickup.label')">
                  <USelectMenu
                    v-model="form.pickupOfficeId"
                    :items="officeItems"
                    valueKey="value"
                    :placeholder="t('checkout.pickup.placeholder')"
                    size="lg"
                    class="w-full"
                  >
                    <template #item-label="{ item }">
                      <div class="flex flex-col">
                        <span class="font-medium">
                          {{ item.label }}
                        </span>

                        <span class="text-xs text-muted">
                          {{ item.address }}
                        </span>
                      </div>
                    </template>
                  </USelectMenu>

                  <p class="mt-2 text-xs leading-5 text-muted">
                    {{ t('checkout.pickup.help') }}
                  </p>
                </UFormField>

                <div
                  v-if="selectedOffice"
                  class="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4"
                >
                  <div class="text-sm font-semibold text-primary">
                    {{ t('checkout.office.selectedTitle') }}
                  </div>

                  <div class="mt-2 font-bold text-highlighted">
                    {{ selectedOffice.name }}
                  </div>

                  <p
                    v-if="selectedOffice.description"
                    class="mt-2 text-sm leading-6 text-toned"
                  >
                    {{ selectedOffice.description }}
                  </p>

                  <p
                    v-if="selectedOffice.address"
                    class="mt-2 text-sm leading-6 text-muted"
                  >
                    {{ selectedOffice.address }}
                  </p>

                  <div class="mt-4 grid gap-2 sm:flex">
                    <UButton
                      v-if="selectedOffice.phone"
                      :to="`tel:${toTel(selectedOffice.phone)}`"
                      icon="i-lucide-phone"
                      color="neutral"
                      variant="soft"
                      size="md"
                      class="justify-center"
                    >
                      {{ t('checkout.office.call') }}
                    </UButton>

                    <UButton
                      v-if="selectedOfficeMapUrl"
                      :to="selectedOfficeMapUrl"
                      icon="i-lucide-map-pin"
                      target="_blank"
                      color="primary"
                      variant="soft"
                      size="md"
                      class="justify-center"
                    >
                      {{ t('checkout.office.map') }}
                    </UButton>
                  </div>
                </div>
              </div>
            </UCard>

            <UAlert
              v-if="message"
              color="error"
              variant="subtle"
              icon="i-heroicons-exclamation-triangle"
              :description="message"
            />

            <div class="lg:hidden">
              <UButton
                :loading="pending"
                :disabled="!items.length"
                size="xl"
                color="primary"
                type="submit"
                class="w-full justify-center"
              >
                {{ t('checkout.submit') }}
              </UButton>
            </div>
          </UForm>
        </section>

        <aside class="hidden lg:block">
          <div class="sticky top-24 space-y-4">
            <UCard class="border-primary/20 bg-primary/5">
              <h2 class="text-lg font-black text-highlighted">
                {{ t('checkout.summary.title') }}
              </h2>

              <div class="mt-4 space-y-3">
                <div class="flex justify-between text-sm text-muted">
                  <span>{{ t('checkout.summary.items', { count: totalCount }) }}</span>

                  <span>{{ totalCount }}</span>
                </div>

                <div class="flex justify-between gap-4 border-t border-primary/10 pt-3">
                  <span class="text-sm font-semibold text-highlighted">
                    {{ t('checkout.summary.total') }}
                  </span>

                  <span class="text-lg font-black text-primary">
                    {{ fmtAOA(totalAOA) }}
                  </span>
                </div>

                <p class="text-xs leading-5 text-muted">
                  {{ t('checkout.summary.note') }}
                </p>
              </div>

              <UButton
                :loading="pending"
                :disabled="!items.length"
                size="xl"
                color="primary"
                type="button"
                class="mt-5 w-full justify-center"
                @click="submit"
              >
                {{ t('checkout.submit') }}
              </UButton>

              <UButton
                size="lg"
                color="neutral"
                variant="ghost"
                class="mt-2 w-full justify-center"
                :to="localeRoute({ name: 'cart' })"
              >
                {{ t('checkout.backToCart') }}
              </UButton>
            </UCard>

            <UCard>
              <h2 class="text-base font-bold text-highlighted">
                {{ t('checkout.steps.title') }}
              </h2>

              <div class="mt-4 space-y-3">
                <div
                  v-for="(step, index) in steps"
                  :key="step.title"
                  class="flex gap-3"
                >
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {{ index + 1 }}
                  </div>

                  <div>
                    <div class="text-sm font-semibold text-highlighted">
                      {{ step.title }}
                    </div>

                    <div class="text-sm leading-6 text-muted">
                      {{ step.desc }}
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </aside>
      </div>

      <section class="mt-5 lg:hidden">
        <UCard>
          <h2 class="text-base font-bold text-highlighted">
            {{ t('checkout.steps.title') }}
          </h2>

          <div class="mt-4 space-y-3">
            <div
              v-for="(step, index) in steps"
              :key="step.title"
              class="flex gap-3"
            >
              <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {{ index + 1 }}
              </div>

              <div>
                <div class="text-sm font-semibold text-highlighted">
                  {{ step.title }}
                </div>

                <div class="text-sm leading-6 text-muted">
                  {{ step.desc }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <div class="fixed bottom-0 left-0 right-0 z-60 border-t border-gray-200 bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] lg:hidden">
        <div class="mx-auto max-w-5xl">
          <div class="mb-2 flex items-center justify-between gap-3">
            <div>
              <div class="text-xs text-muted">
                {{ t('checkout.summary.total') }}
              </div>

              <div class="text-lg font-black text-primary">
                {{ fmtAOA(totalAOA) }}
              </div>
            </div>

            <div class="text-right text-xs leading-5 text-muted">
              {{ t('checkout.summary.items', { count: totalCount }) }}
            </div>
          </div>

          <UButton
            :loading="pending"
            :disabled="!items.length"
            size="xl"
            color="primary"
            class="w-full justify-center"
            @click="submit"
          >
            {{ t('checkout.submit') }}
          </UButton>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
