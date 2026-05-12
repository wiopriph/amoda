<script setup lang="ts">
/* eslint-disable camelcase */
import { vMaska } from 'maska/vue';
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'checkout' });

const title = 'Deixar número | Amoda';
const description = 'Deixe o seu número para a equipa da Amoda entrar em contacto e confirmar a sua escolha.';

useHead(() => ({
  title,
  meta: [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { name: 'description', content: description },
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

let contactSyncTimer: ReturnType<typeof setTimeout> | null = null;
let isApplyingContactSnapshot = false;

const redirectIfEmpty = () => {
  if (isLoading.value) {
    return;
  }

  if (!items.value.length) {
    navigateTo({ name: 'cart' });
  }
};

if (process.client) {
  onMounted(redirectIfEmpty);
  watch(isLoading, redirectIfEmpty);
}

const checkoutForm = reactive({ phone: '' });


const DEFAULT_PICKUP_OFFICE_ID = 1;

const buildContactSnapshot = () => ({
  phone: checkoutForm.phone.trim(),
  pickupOfficeId: DEFAULT_PICKUP_OFFICE_ID,
  name: '',
});

const hasContactPhone = () => Boolean(checkoutForm.phone.trim());

const syncContactSnapshot = () => {
  if (!import.meta.client || isApplyingContactSnapshot || !hasContactPhone()) {
    return;
  }

  if (contactSyncTimer) {
    clearTimeout(contactSyncTimer);
  }

  contactSyncTimer = setTimeout(() => {
    contactSyncTimer = null;
    startCheckout(buildContactSnapshot()).catch(() => {});
  }, 900);
};

if (import.meta.client) {
  watch(
    contactSnapshot,
    (snapshot) => {
      if (!snapshot || hasContactPhone()) {
        return;
      }

      isApplyingContactSnapshot = true;

      if (typeof snapshot.phone === 'string') {
        checkoutForm.phone = snapshot.phone;
      }

      nextTick(() => {
        isApplyingContactSnapshot = false;
      });
    },
    { immediate: true },
  );

  watch(
    () => checkoutForm.phone,
    () => {
      syncContactSnapshot();
    },
  );
}

const formErrors = reactive({
  phone: false,
});

const PHONE_DIGITS_MIN_LENGTH = 12;

const validateForm = () => {
  formErrors.phone = !checkoutForm.phone.trim() || checkoutForm.phone.replace(/\D/g, '').length < PHONE_DIGITS_MIN_LENGTH;

  return !formErrors.phone;
};

watch(() => checkoutForm.phone, () => {
  if (formErrors.phone && checkoutForm.phone.trim()) {
    formErrors.phone = false;
  }
});

const isSubmitting = ref(false);

const priceFormatter = new Intl.NumberFormat('pt-AO');
const formatPrice = (price: number) => `${priceFormatter.format(price)} AOA`;

const totalCount = computed(() => items.value.reduce((total, cartItem) => total + cartItem.qty, 0));

const phoneInputRef = ref<any>(null);


const PHONE_FOCUS_DELAY_MS = 300;

const scrollToPhoneInput = async () => {
  await nextTick();

  const phoneInputElement = phoneInputRef.value?.inputRef ||
    phoneInputRef.value?.$el?.querySelector?.('input') ||
    document.querySelector('input[name="phone"]');

  if (!phoneInputElement) {
    return;
  }

  phoneInputElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });

  setTimeout(() => {
    phoneInputElement.focus();
  }, PHONE_FOCUS_DELAY_MS);
};

const getOrderItems = () => items.value.map(cartItem => ({
  productId: cartItem.productId,
  variantId: cartItem.variantId,
  sizeId: cartItem.sizeId,
  title: cartItem.productName,
  price: cartItem.price,
  qty: cartItem.qty,
  slug: cartItem.slug,
  image: cartItem.image ?? null,
}));

const getAnalyticsItems = () => items.value.map(cartItem =>
  makeGa4Item({
    productId: cartItem.productId,
    name: cartItem.productName,
    brand: cartItem.brand ?? undefined,
    price: cartItem.price,
    quantity: cartItem.qty,
    variantId: cartItem.variantId,
    sizeId: cartItem.sizeId,
    variantLabel: cartItem.variantLabel ?? undefined,
    sizeLabel: cartItem.sizeLabel ?? undefined,
    categoryName: cartItem.categoryName ?? undefined,
  }),
);

const toast = useToast();

const submitCheckout = async () => {
  if (!validateForm()) {
    await scrollToPhoneInput();

    return;
  }

  if (!items.value.length) {
    toast.add({
      title: 'A sua seleção está vazia.',
      color: 'error',
    });

    return;
  }

  isSubmitting.value = true;

  try {
    await startCheckout(buildContactSnapshot());

    const { number } = await $fetch('/api/checkout/place-order', {
      method: 'POST',
      body: {
        items: getOrderItems(),
        totals: { total: unref(totalAOA), currency: 'AOA' },
        contact: {
          name: '',
          phone: checkoutForm.phone,
        },
        pickupOfficeId: DEFAULT_PICKUP_OFFICE_ID,
      },
    });

    if (import.meta.client) {
      trackPurchase({
        transaction_id: String(number),
        value: totalAOA.value,
        items: getAnalyticsItems(),
        pickup_office_id: DEFAULT_PICKUP_OFFICE_ID,
      } as any);
    }

    await clear();
    await navigateTo({ name: 'order-number', params: { number } });
  } catch (checkoutError: any) {
    toast.add({
      title: checkoutError?.data?.message || 'Não foi possível enviar a sua escolha. Tente novamente em alguns instantes.',
      color: 'error',
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-3xl sm:px-6 lg:px-8">
      <section class="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-4 shadow-sm sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-3"
        >
          Sem pagamento agora
        </UBadge>

        <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
          Deixe o seu número
        </h1>

        <p class="mt-3 text-sm leading-6 text-muted sm:text-base">
          Use esta opção se preferir que a equipa da Amoda fale consigo. Podemos escrever ou ligar para confirmar a sua escolha.
        </p>
      </section>

      <UForm
        class="mt-5"
        @submit.prevent="submitCheckout"
      >
        <UCard>
          <h2 class="text-lg font-black text-highlighted">
            Nós falamos consigo
          </h2>

          <p class="mt-2 text-sm leading-6 text-muted">
            Digite um número válido em Angola para podermos escrever ou ligar.
          </p>

          <div class="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            <UFormField
              :error="formErrors.phone ? 'Por favor, indique o seu número de telefone.' : undefined"
              label="Número de telefone"
              required
            >
              <UInput
                ref="phoneInputRef"
                v-model="checkoutForm.phone"
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
              :loading="isSubmitting"
              :disabled="!items.length || formErrors.phone"
              size="xl"
              color="primary"
              type="submit"
              class="w-full justify-center sm:mt-6 sm:w-fit"
            >
              Enviar número
            </UButton>
          </div>
        </UCard>
      </UForm>

      <UCard class="mt-4 border-primary/20 bg-primary/5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-black text-highlighted">
              Resumo
            </h2>

            <p
              class="mt-1 text-xs leading-5 text-muted"
              v-text="`${totalCount} item(ns)`"
            />
          </div>

          <div class="shrink-0 text-right">
            <div class="text-xs text-muted">
              Total se levar tudo
            </div>

            <div
              class="text-lg font-black text-primary"
              v-text="formatPrice(totalAOA)"
            />
          </div>
        </div>

        <p class="mt-3 border-t border-primary/10 pt-3 text-xs leading-5 text-muted">
          Este valor é apenas uma referência. Você só paga depois de experimentar e apenas pelo que decidir levar.
        </p>
      </UCard>
    </UPageBody>
  </UPage>
</template>
