<script setup lang="ts">
/* eslint-disable camelcase */
import { vMaska } from 'maska/vue';
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'checkout' });

const { t } = useI18n();
const toast = useToast();

useHead(() => ({
  title: t('checkout.meta.title'),
  meta: [
    { name: 'description', content: t('checkout.meta.description') },
    { property: 'og:title', content: t('checkout.meta.title') },
    { property: 'og:description', content: t('checkout.meta.description') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const {
  isLoading,
  items,
  totalAOA,
  clear,
  startCheckout,
  contactSnapshot,
} = useCart();

const { trackPurchase } = useAnalyticsEvent();
const localeRoute = useLocaleRoute();
const CONTACT_SYNC_DEBOUNCE_MS = 900;
const DEFAULT_PICKUP_OFFICE_ID = 1;

let contactSyncTimer: ReturnType<typeof setTimeout> | null = null;
let applyingContactSnapshot = false;

const redirectIfEmpty = () => {
  if (isLoading.value) {
    return;
  }

  if (!items.value.length) {
    navigateTo(localeRoute({ name: 'cart' }));
  }
};

if (process.client) {
  onMounted(redirectIfEmpty);
  watch(isLoading, redirectIfEmpty);
}

const form = reactive({
  phone: '',
});

const getContactSnapshot = () => ({
  name: '',
  phone: form.phone.trim(),
  pickupOfficeId: DEFAULT_PICKUP_OFFICE_ID,
});

const hasContactData = () => Boolean(form.phone.trim());

const syncContactSnapshot = () => {
  if (!import.meta.client || applyingContactSnapshot || !hasContactData()) {
    return;
  }

  if (contactSyncTimer) {
    clearTimeout(contactSyncTimer);
  }

  contactSyncTimer = setTimeout(() => {
    contactSyncTimer = null;
    startCheckout(getContactSnapshot()).catch(() => {});
  }, CONTACT_SYNC_DEBOUNCE_MS);
};

if (import.meta.client) {
  watch(
    contactSnapshot,
    (snapshot) => {
      if (!snapshot || hasContactData()) {
        return;
      }

      applyingContactSnapshot = true;

      if (typeof snapshot.phone === 'string') {
        form.phone = snapshot.phone;
      }

      nextTick(() => {
        applyingContactSnapshot = false;
      });
    },
    { immediate: true },
  );

  watch(
    () => form.phone,
    () => {
      syncContactSnapshot();
    },
  );
}

const errors = reactive({
  phone: false,
});

const validateForm = () => {
  errors.phone = !form.phone.trim() || form.phone.replace(/\D/g, '').length < 12;

  return !errors.phone;
};

watch(() => form.phone, () => {
  if (errors.phone && form.phone.trim()) errors.phone = false;
});

const pending = ref(false);

const fmtAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val)} AOA`;

const totalCount = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0));

const phoneInputRef = ref<any>(null);

const scrollToPhoneInput = async () => {
  await nextTick();

  const inputEl = phoneInputRef.value?.inputRef ||
    phoneInputRef.value?.$el?.querySelector?.('input') ||
    document.querySelector('input[name="phone"]');

  if (!inputEl) {
    return;
  }

  inputEl.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });

  setTimeout(() => {
    inputEl.focus();
  }, 300);
};

const submit = async () => {
  if (!validateForm()) {
    await scrollToPhoneInput();

    return;
  }

  if (!items.value.length) {
    toast.add({
      title: t('checkout.errors.empty'),
      color: 'error',
    });

    return;
  }

  pending.value = true;

  try {
    await startCheckout(getContactSnapshot());

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
          name: '',
          phone: form.phone,
        },
        pickupOfficeId: DEFAULT_PICKUP_OFFICE_ID,
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
        pickup_office_id: DEFAULT_PICKUP_OFFICE_ID,
      } as any);
    }

    await clear();
    await navigateTo(localeRoute({ name: 'order-number', params: { number } }));
  } catch (error: any) {
    toast.add({
      title: error?.data?.message || t('checkout.errors.common'),
      color: 'error',
    });
  } finally {
    pending.value = false;
  }
};
</script>

<i18n lang="json">
{
  "pt": {
    "checkout": {
      "title": "Deixe o seu número",
      "subtitle": "Use esta opção se preferir que a equipa da Amoda fale consigo. Podemos escrever ou ligar para confirmar a sua escolha.",
      "badge": "Sem pagamento agora",
      "phone": "Número de telefone",
      "submit": "Enviar número",
      "callback": {
        "title": "Nós falamos consigo",
        "desc": "Digite um número válido em Angola para podermos escrever ou ligar."
      },
      "summary": {
        "title": "Resumo",
        "items": "{count} item(ns)",
        "total": "Total se levar tudo",
        "note": "Este valor é apenas uma referência. Você só paga depois de experimentar e apenas pelo que decidir levar."
      },
      "errors": {
        "phoneRequired": "Por favor, indique o seu número de telefone.",
        "empty": "A sua seleção está vazia.",
        "common": "Não foi possível enviar a sua escolha. Tente novamente em alguns instantes."
      },
      "meta": {
        "title": "Deixar número {'|'} Amoda",
        "description": "Deixe o seu número para a equipa da Amoda entrar em contacto e confirmar a sua escolha."
      }
    }
  },
  "en": {
    "checkout": {
      "title": "Leave your number",
      "subtitle": "Use this option if you prefer the Amoda team to contact you. We can message or call you to confirm your selection.",
      "badge": "No payment now",
      "phone": "Phone number",
      "submit": "Send number",
      "callback": {
        "title": "We contact you",
        "desc": "Enter a valid Angola number so we can message or call you."
      },
      "summary": {
        "title": "Summary",
        "items": "{count} item(s)",
        "total": "Total if you keep everything",
        "note": "This amount is only a reference. You pay only after trying and only for what you decide to keep."
      },
      "errors": {
        "phoneRequired": "Please enter your phone number.",
        "empty": "Your selection is empty.",
        "common": "We could not send your selection. Please try again shortly."
      },
      "meta": {
        "title": "Leave number {'|'} Amoda",
        "description": "Leave your number so the Amoda team can contact you and confirm your selection."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-3xl sm:px-6 lg:px-8">
      <section class="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-4 shadow-sm sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-3"
        >
          {{ t('checkout.badge') }}
        </UBadge>

        <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
          {{ t('checkout.title') }}
        </h1>

        <p class="mt-3 text-sm leading-6 text-muted sm:text-base">
          {{ t('checkout.subtitle') }}
        </p>
      </section>

      <UForm
        class="mt-5"
        @submit.prevent="submit"
      >
        <UCard>
          <h2 class="text-lg font-black text-highlighted">
            {{ t('checkout.callback.title') }}
          </h2>

          <p class="mt-2 text-sm leading-6 text-muted">
            {{ t('checkout.callback.desc') }}
          </p>

          <div class="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <UFormField
              :label="t('checkout.phone')"
              :error="errors.phone ? t('checkout.errors.phoneRequired') : undefined"
              required
            >
              <UInput
                ref="phoneInputRef"
                v-model="form.phone"
                v-maska="'+244 ### ### ###'"
                required
                name="phone"
                placeholder="+244 XXX XXX XXX"
                type="tel"
                size="xl"
                class="w-full"
              />
            </UFormField>

            <UButton
              :loading="pending"
              :disabled="!items.length || errors.phone"
              size="xl"
              color="primary"
              type="submit"
              class="w-full justify-center sm:mt-6 sm:w-fit"
            >
              {{ t('checkout.submit') }}
            </UButton>
          </div>
        </UCard>
      </UForm>

      <UCard class="mt-4 border-primary/20 bg-primary/5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-black text-highlighted">
              {{ t('checkout.summary.title') }}
            </h2>

            <p class="mt-1 text-xs leading-5 text-muted">
              {{ t('checkout.summary.items', { count: totalCount }) }}
            </p>
          </div>

          <div class="shrink-0 text-right">
            <div class="text-xs text-muted">
              {{ t('checkout.summary.total') }}
            </div>

            <div class="text-lg font-black text-primary">
              {{ fmtAOA(totalAOA) }}
            </div>
          </div>
        </div>

        <p class="mt-3 border-t border-primary/10 pt-3 text-xs leading-5 text-muted">
          {{ t('checkout.summary.note') }}
        </p>
      </UCard>
    </UPageBody>
  </UPage>
</template>
