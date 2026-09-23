<script setup lang="ts">
/* eslint-disable camelcase */
import { vMaska } from 'maska/vue';
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { formatPrice } from '~/utils/formatPrice';
import { makeGa4Item } from '~/utils/ga4';
import { colorLabel } from '#shared/constants/colors';
import { formatAoPhone } from '#shared/utils/phone';
import { couponLabel, couponReasonMessage, type CouponSummary } from '#shared/constants/coupons';


definePageMeta({ name: 'checkout' });

const title = 'Deixar número | Amoda';
const description = 'Deixa o teu número para a equipa da Amoda entrar em contacto e confirmar a tua escolha.';

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const {
  isLoading,
  items,
  totalKz,
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

if (import.meta.client) {
  onMounted(redirectIfEmpty);
  watch(isLoading, redirectIfEmpty);
}

const checkoutForm = reactive({ phone: '', name: '' });

// Вошедшая клиентка: имя из профиля, номер — тот, под которым вошла (подтверждён по SMS), его не меняем
const { user, canAccessAccount } = useAuth();
const verifiedPhone = ref('');
const isAccountUser = computed(() => Boolean(user.value) && canAccessAccount.value);

if (isAccountUser.value) {
  const { data: profile } = await useAccountProfile();

  checkoutForm.name = profile.value?.name || '';
  verifiedPhone.value = formatAoPhone(profile.value?.phone);
  checkoutForm.phone = verifiedPhone.value;
}

// Купон: только для вошедших. Лучший персональный подставляется сам, публичный код вводится руками
type CouponQuote = { ok: boolean; reason: string | null; coupon: CouponSummary | null; discount: number };

const coupon = reactive({
  input: '',
  applied: null as CouponSummary | null,
  discount: 0,
  error: null as string | null,
  isChecking: false,
  isFieldOpen: false,
});

const discountedTotal = computed(() => Math.max(0, totalKz.value - coupon.discount));

const quoteCoupon = async (code?: string) => {
  if (!isAccountUser.value || !items.value.length) {
    return;
  }

  coupon.isChecking = true;
  coupon.error = null;

  try {
    const quote = await $fetch<CouponQuote>('/api/account/coupons/quote', {
      method: 'POST',
      body: { code: code || undefined, subtotal: totalKz.value },
    });

    if (quote.ok && quote.coupon) {
      coupon.applied = quote.coupon;
      coupon.discount = quote.discount;
      coupon.isFieldOpen = false;
    } else if (code) {
      coupon.error = couponReasonMessage(quote.reason);
    }
  } catch (quoteError: any) {
    if (code) {
      coupon.error = quoteError?.data?.message || couponReasonMessage(null);
    }
  } finally {
    coupon.isChecking = false;
  }
};

const applyCouponCode = () => quoteCoupon(coupon.input.trim());

const removeCoupon = () => {
  coupon.applied = null;
  coupon.discount = 0;
  coupon.input = '';
  coupon.error = null;
};

if (import.meta.client && isAccountUser.value) {
  // Корзина приходит после гидрации; при изменении суммы пересчитываем применённый купон
  watch(() => [isLoading.value, totalKz.value], ([loading]) => {
    if (loading || !items.value.length) {
      return;
    }

    quoteCoupon(coupon.applied?.code);
  }, { immediate: true });
}


const DEFAULT_PICKUP_OFFICE_ID = 1;

const buildContactSnapshot = () => ({
  phone: checkoutForm.phone.trim(),
  pickupOfficeId: DEFAULT_PICKUP_OFFICE_ID,
  name: checkoutForm.name.trim(),
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

      if (typeof snapshot.name === 'string' && !checkoutForm.name) {
        checkoutForm.name = snapshot.name;
      }

      nextTick(() => {
        isApplyingContactSnapshot = false;
      });
    },
    { immediate: true },
  );

  watch(
    () => [checkoutForm.phone, checkoutForm.name],
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

const totalCount = computed(() => items.value.reduce((total, cartItem) => total + cartItem.qty, 0));

const itemVariantLabel = (cartItem: any) =>
  [colorLabel(cartItem.variantLabel), cartItem.sizeLabel].filter(Boolean).join(' · ');

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

// Сервер сам берёт цены из базы — отправляем только идентификаторы и количество
const getOrderItems = () => items.value.map(cartItem => ({
  variantId: cartItem.variantId,
  sizeId: cartItem.sizeId,
  qty: cartItem.qty,
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
      title: 'A tua seleção está vazia.',
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
        contact: {
          name: checkoutForm.name.trim(),
          phone: checkoutForm.phone,
        },
        pickupOfficeId: DEFAULT_PICKUP_OFFICE_ID,
        couponCode: coupon.applied?.code || undefined,
      },
    });

    if (import.meta.client) {
      trackPurchase({
        transaction_id: String(number),
        value: discountedTotal.value,
        coupon: coupon.applied?.code,
        items: getAnalyticsItems(),
        pickup_office_id: DEFAULT_PICKUP_OFFICE_ID,
      } as any);
    }

    await clear();
    await navigateTo({ name: 'order-number', params: { number } });
  } catch (checkoutError: any) {
    toast.add({
      title: checkoutError?.data?.message || 'Não foi possível enviar a tua escolha. Tenta novamente em alguns instantes.',
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
          Deixa o teu número
        </h1>

        <p class="mt-3 text-sm leading-6 text-muted sm:text-base">
          Usa esta opção se preferires que a equipa da Amoda fale contigo. Podemos escrever ou ligar para confirmar a tua escolha.
        </p>
      </section>

      <UForm
        class="mt-5"
        @submit.prevent="submitCheckout"
      >
        <UCard>
          <h2 class="text-lg font-black text-highlighted">
            Nós falamos contigo
          </h2>

          <p class="mt-2 text-sm leading-6 text-muted">
            Indica um número válido em Angola para podermos escrever ou ligar.
          </p>

          <div class="mt-5 grid gap-4">
            <UFormField label="Nome (opcional)">
              <UInput
                v-model="checkoutForm.name"
                name="name"
                placeholder="Como te podemos chamar?"
                type="text"
                size="xl"
                class="w-full sm:max-w-sm"
              />
            </UFormField>

            <UFormField
              :error="formErrors.phone ? 'Por favor, indica o teu número de telefone.' : undefined"
              :help="verifiedPhone ? 'O número da tua conta.' : undefined"
              label="Número de telefone"
              required
            >
              <UInput
                ref="phoneInputRef"
                v-model="checkoutForm.phone"
                v-maska="'+244 ### ### ###'"
                :disabled="Boolean(verifiedPhone)"
                required
                name="phone"
                placeholder="+244 XXX XXX XXX"
                type="tel"
                size="xl"
                class="w-full sm:max-w-sm"
              />
            </UFormField>

            <!-- Не блокируем кнопку при ошибке телефона: сабмит валидирует и подводит к полю -->
            <UButton
              :loading="isSubmitting"
              :disabled="!items.length"
              size="xl"
              color="primary"
              type="submit"
              class="w-full justify-center sm:w-fit"
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
              v-text="formatPrice(discountedTotal)"
            />
          </div>
        </div>

        <!-- Cupão: só para quem entrou na conta -->
        <div
          v-if="isAccountUser"
          class="mt-3 border-t border-primary/10 pt-3"
        >
          <div
            v-if="coupon.applied"
            class="flex items-center justify-between gap-3 text-sm"
          >
            <span class="flex items-center gap-2 text-highlighted">
              <UIcon
                name="i-lucide-ticket"
                class="size-4 text-primary"
              />

              Cupão <strong v-text="coupon.applied.code" /> · {{ couponLabel(coupon.applied) }}
            </span>

            <span class="flex items-center gap-2">
              <span
                class="font-semibold text-primary"
                v-text="`−${formatPrice(coupon.discount)}`"
              />

              <UButton
                variant="ghost"
                color="neutral"
                size="xs"
                icon="i-heroicons-x-mark"
                aria-label="Remover cupão"
                @click="removeCoupon"
              />
            </span>
          </div>

          <UButton
            v-else-if="!coupon.isFieldOpen"
            variant="link"
            color="primary"
            size="sm"
            class="px-0"
            icon="i-lucide-ticket"
            @click="coupon.isFieldOpen = true"
          >
            Tens um cupão?
          </UButton>

          <UFormField
            v-if="coupon.isFieldOpen && !coupon.applied"
            :error="coupon.error || undefined"
            class="mt-1"
          >
            <div class="flex gap-2">
              <UInput
                v-model="coupon.input"
                placeholder="CÓDIGO"
                autocapitalize="characters"
                size="lg"
                class="w-full uppercase"
                @keydown.enter.prevent="applyCouponCode"
              />

              <UButton
                :loading="coupon.isChecking"
                :disabled="!coupon.input.trim()"
                color="primary"
                variant="soft"
                size="lg"
                @click="applyCouponCode"
              >
                Aplicar
              </UButton>
            </div>
          </UFormField>

          <UButton
            v-if="!coupon.applied && coupon.isFieldOpen"
            variant="link"
            color="neutral"
            size="xs"
            class="mt-1 px-0"
            @click="coupon.isFieldOpen = false"
          >
            Cancelar
          </UButton>
        </div>

        <ul class="mt-3 space-y-2 border-t border-primary/10 pt-3">
          <li
            v-for="cartItem in items"
            :key="cartItem.key"
            class="flex items-baseline justify-between gap-3 text-sm"
          >
            <span class="min-w-0 text-highlighted">
              {{ cartItem.productName }}

              <span
                v-if="itemVariantLabel(cartItem)"
                class="text-xs text-muted"
              >
                · {{ itemVariantLabel(cartItem) }}
              </span>

              <span
                v-if="cartItem.qty > 1"
                class="text-xs text-muted"
              >
                ×{{ cartItem.qty }}
              </span>
            </span>

            <span
              class="shrink-0 font-semibold text-highlighted"
              v-text="formatPrice(cartItem.price * cartItem.qty)"
            />
          </li>
        </ul>

        <p class="mt-3 border-t border-primary/10 pt-3 text-xs leading-5 text-muted">
          Este valor é só uma referência. Pagas depois de experimentar e apenas o que decidires levar.
        </p>
      </UCard>
    </UPageBody>
  </UPage>
</template>
