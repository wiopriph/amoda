<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui';
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'checkout' });

const { t } = useI18n();

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
  offices.value.map(o => ({
    label: o.name,
    value: o.id,
    address: o.address,
  })),
);

const form = reactive({
  name: '',
  phone: '',
  pickupOfficeId: 2, // Talatona
});

const pending = ref(false);
const message = ref<string | null>(null);

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
      "title": "Reservar para experimentar",
      "subtitle": "Sem pagamento — reserve e venha experimentar",
      "hint": "✅ Reserva grátis. Só precisamos do seu nome e WhatsApp para confirmar.\n📍 Escolha o ponto e venha experimentar. Você decide na hora se vai levar.",
      "name": "Nome",
      "phone": "WhatsApp / Telefone",
      "pickup": {
        "label": "Ponto de levantamento",
        "placeholder": "Selecione um ponto",
        "help": "Vamos preparar os itens para você experimentar neste ponto."
      },
      "submit": "Reservar grátis",
      "note": "📦 Vamos confirmar no WhatsApp quando estiver pronto para experimentar.",
      "errors": {
        "empty": "O seu carrinho está vazio.",
        "common": "Não foi possível enviar a reserva. Tente novamente em alguns instantes.",
        "pickupRequired": "Selecione um ponto de levantamento."
      },
      "meta": {
        "title": "Reserva para experimentar | Amoda Angola",
        "description": "Reserva grátis: escolha os itens, deixe o seu contacto e venha experimentar no ponto. Sem pagamento online."
      },
      "summary": {
        "title": "Sua reserva",
        "items": "Itens reservados"
      }
    }
  },
  "en": {
    "checkout": {
      "title": "Reserve to try on",
      "subtitle": "No payment — reserve and come try for free",
      "hint": "✅ Free reservation. We only need your name and WhatsApp to confirm.\n📍 Choose a pickup point and come try on. You decide on the spot if you want to take it.",
      "name": "Name",
      "phone": "WhatsApp / Phone",
      "pickup": {
        "label": "Pickup point",
        "placeholder": "Select a pickup point",
        "help": "We’ll prepare your items for fitting at this location."
      },
      "submit": "Reserve for free",
      "note": "📦 We’ll confirm on WhatsApp when it’s ready to try on.",
      "errors": {
        "empty": "Your cart is empty.",
        "common": "We couldn’t send your reservation. Please try again shortly.",
        "pickupRequired": "Please select a pickup point."
      },
      "meta": {
        "title": "Reserve to try on | Amoda Angola",
        "description": "Free reservation: pick items, leave your contact, and try them at the pickup point. No online payment."
      },
      "summary": {
        "title": "Your reservation",
        "items": "Reserved items"
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('checkout.title')"
      :description="t('checkout.subtitle')"
    />

    <UPageBody class="max-w-3xl mx-auto">
      <UAlert
        :description="t('checkout.hint')"
        icon="i-heroicons-information-circle"
        color="success"
        variant="soft"
        class="mb-4 text-sm"
      />

      <UForm
        class="space-y-5"
        @submit.prevent="submit"
      >
        <UFormField :label="t('checkout.name')">
          <UInput
            v-model="form.name"
            required
            name="name"
            class="block w-full"
          />
        </UFormField>

        <UFormField :label="t('checkout.phone')">
          <UInput
            v-model="form.phone"
            required
            name="phone"
            placeholder="+244 ..."
            type="tel"
            class="block w-full"
          />
        </UFormField>

        <UFormField :label="t('checkout.pickup.label')">
          <USelectMenu
            v-model="form.pickupOfficeId"
            :items="officeItems"
            valueKey="value"
            :placeholder="t('checkout.pickup.placeholder')"
            class="w-full"
          >
            <template #item-label="{ item }">
              <div class="flex flex-col">
                <span class="font-medium">
                  {{ item.label }}
                </span>

                <span class="text-xs text-gray-500">
                  {{ item.address }}
                </span>
              </div>
            </template>
          </USelectMenu>

          <p class="mt-1 text-xs text-gray-500">
            {{ t('checkout.pickup.help') }}
          </p>
        </UFormField>

        <div class="border-t pt-4 text-sm text-gray-600">
          {{ t('checkout.summary.items') }}:
          <span class="font-semibold">{{ items.length }}</span>
        </div>

        <UButton
          :loading="pending"
          :disabled="!items.length"
          size="xl"
          color="primary"
          type="submit"
          class="w-full uppercase justify-center mt-4"
        >
          {{ t('checkout.submit') }}
        </UButton>

        <UAlert
          v-if="message"
          color="error"
          variant="subtle"
          class="text-sm"
          icon="i-heroicons-exclamation-triangle"
        >
          {{ message }}
        </UAlert>

        <UAlert
          :description="t('checkout.note')"
          color="success"
          variant="soft"
          icon="i-heroicons-check-circle"
          class="mt-4 text-sm leading-relaxed"
        />
      </UForm>
    </UPageBody>
  </UPage>
</template>
