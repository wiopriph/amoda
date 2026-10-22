<script setup lang="ts">
/* eslint-disable camelcase */
import { vMaska } from 'maska/vue';
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { formatPrice } from '~/utils/formatPrice';
import { makeGa4Item } from '~/utils/ga4';
import { colorLabel } from '#shared/constants/colors';
import { formatAoPhone } from '#shared/utils/phone';
import { formatOpeningStatus, getOpeningStatus, resolveOfficeMapUrl, toTelHref } from '#shared/utils/openingHours';


definePageMeta({ name: 'checkout' });

const title = 'Confirmar pedido | Amoda';
const description = 'Confirma o teu pedido sem pagamento online: escolhe como receber e acompanha tudo na tua conta.';

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

// Список вещей по умолчанию свёрнут: при большом заказе он раздувал страницу
const isItemsOpen = ref(false);

const checkoutForm = reactive({ phone: '', name: '' });

const { user } = useAuth();
const verifiedPhone = ref('');
const isAccountUser = computed(() => Boolean(user.value));

// Гость: вход по SMS прямо здесь (по умолчанию) или заказ без аккаунта
type ContactMode = 'login' | 'guest';

const contactMode = ref<ContactMode>('login');

const contactOptions: { value: ContactMode; label: string; hint: string }[] = [
  { value: 'login', label: 'Entrar com SMS', hint: 'Cupão e estado do pedido na tua conta' },
  { value: 'guest', label: 'Continuar sem conta', hint: 'Só o número, sem cupão' },
];

const loadProfileIntoForm = async () => {
  const profile = await $fetch<{ name: string | null; phone: string | null }>('/api/account/profile');

  checkoutForm.name = profile.name || '';
  verifiedPhone.value = formatAoPhone(profile.phone);
  checkoutForm.phone = verifiedPhone.value;
};

if (isAccountUser.value) {
  const { data: profile } = await useAccountProfile();

  checkoutForm.name = profile.value?.name || '';
  verifiedPhone.value = formatAoPhone(profile.value?.phone);
  checkoutForm.phone = verifiedPhone.value;
}

// Вошла прямо в чекауте: подтягиваем профиль без перезагрузки, купон пересчитает watchCart
const onSignedIn = async () => {
  await loadProfileIntoForm().catch(() => {});
};

// Получение: шоурум (по умолчанию, бесплатно) или доставка на дом (null, такса согласуется после заказа)
const { offices, load: loadOffices } = useOffices();

await loadOffices();

const showroom = computed(() => offices.value[0] ?? null);

const showroomInfo = computed(() => {
  const office = showroom.value;

  if (!office) {
    return null;
  }

  const [street, ...rest] = String(office.address || '').replace(/^Luanda,\s*/i, '')
    .split(/\s*\(|\)\s*/)
    .filter(Boolean);

  return {
    name: office.name,
    street,
    note: rest.join(' '),
    mapUrl: resolveOfficeMapUrl(office as any),
    telHref: toTelHref(office.phone),
    status: getOpeningStatus(office.opening_hours as any),
  };
});

type DeliveryMode = 'showroom' | 'delivery';

const deliveryMode = ref<DeliveryMode>('showroom');

const deliveryOptions: { value: DeliveryMode; label: string; hint: string }[] = [
  { value: 'showroom', label: 'No showroom', hint: 'Grátis · Luanda' },
  { value: 'delivery', label: 'Entrega ao domicílio*', hint: '* Taxa a combinar' },
];

const pickupOfficeId = computed(() => (deliveryMode.value === 'showroom' && showroom.value ? Number(showroom.value.id) : null));

const {
  total: discountedTotal,
  applied: appliedCoupon,
  watchCart: watchCartCoupon,
  clear: clearCoupon,
} = useCheckoutCoupon();

watchCartCoupon();


const buildContactSnapshot = () => ({
  phone: checkoutForm.phone.trim(),
  pickupOfficeId: pickupOfficeId.value,
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
  if (isAccountUser.value) {
    formErrors.phone = false;

    return true;
  }

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
        pickupOfficeId: pickupOfficeId.value,
        couponCode: appliedCoupon.value?.code || undefined,
      },
    });

    if (import.meta.client) {
      trackPurchase({
        transaction_id: String(number),
        value: discountedTotal.value,
        coupon: appliedCoupon.value?.code,
        items: getAnalyticsItems(),
        pickup_office_id: pickupOfficeId.value,
      } as any);
    }

    await clear();
    clearCoupon();

    // Вошедшая видит заказ в кабинете, гость — публичную страницу с приглашением создать аккаунт
    await navigateTo(isAccountUser.value ?
      { name: 'conta-pedidos-number', params: { number } } :
      { name: 'order-number', params: { number } });
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
    <UPageBody
      :ui="{ base: 'space-y-0' }"
      class="mx-auto max-w-6xl pb-28 sm:px-6 lg:px-8 lg:pb-16"
    >
      <div>
        <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
          Confirma o teu pedido
        </h1>

        <p class="mt-1 text-sm text-muted sm:text-base">
          Escolhe como queres receber
        </p>
      </div>

      <UForm
        id="checkout-form"
        class="mt-5 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start"
        @submit.prevent="submitCheckout"
      >
        <div class="grid gap-5">
          <UCard>
            <h2 class="text-lg font-black text-highlighted">
              O teu contacto
            </h2>

            <div
              v-if="isAccountUser && verifiedPhone"
              class="mt-4 flex items-center gap-3"
            >
              <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UIcon
                  name="i-lucide-user-round"
                  class="size-5"
                />
              </div>

              <div class="min-w-0">
                <div
                  v-if="checkoutForm.name"
                  class="font-semibold text-highlighted"
                  v-text="checkoutForm.name"
                />

                <div
                  class="text-muted"
                  v-text="verifiedPhone"
                />
              </div>
            </div>

            <template v-else>
              <div
                role="radiogroup"
                class="mt-4 grid gap-3 sm:grid-cols-2"
              >
                <button
                  v-for="option in contactOptions"
                  :key="option.value"
                  :aria-checked="contactMode === option.value"
                  :class="contactMode === option.value ? 'border-primary/40 bg-primary/5' : 'border-gray-100 hover:border-primary/30 hover:bg-primary/5'"
                  type="button"
                  role="radio"
                  class="flex items-start gap-3 rounded-2xl border bg-white p-4 text-left transition"
                  @click="contactMode = option.value"
                >
                  <span
                    :class="contactMode === option.value ? 'border-primary' : 'border-gray-300'"
                    class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2"
                  >
                    <span
                      v-if="contactMode === option.value"
                      class="size-2.5 rounded-full bg-primary"
                    />
                  </span>

                  <span class="min-w-0">
                    <span
                      class="block font-bold text-highlighted"
                      v-text="option.label"
                    />

                    <span
                      class="mt-0.5 block text-sm text-muted"
                      v-text="option.hint"
                    />
                  </span>
                </button>
              </div>

              <div
                v-if="contactMode === 'login'"
                class="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4"
              >
                <AuthPhoneLogin
                  compact
                  :initialPhone="checkoutForm.phone"
                  @success="onSignedIn"
                />
              </div>

              <div
                v-else
                class="mt-4 grid gap-4"
              >
                <UFormField
                  :error="formErrors.phone ? 'Indica o teu número de telefone.' : undefined"
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
                    class="w-full sm:max-w-sm"
                  />
                </UFormField>

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

                <p class="text-xs leading-5 text-muted">
                  Sem conta não há cupão e não vês o estado do pedido.
                </p>
              </div>
            </template>
          </UCard>

          <UCard>
            <h2 class="text-lg font-black text-highlighted">
              Como queres receber?
            </h2>

            <div
              role="radiogroup"
              class="mt-4 grid gap-3 sm:grid-cols-2"
            >
              <button
                v-for="option in deliveryOptions"
                :key="option.value"
                :aria-checked="deliveryMode === option.value"
                :class="deliveryMode === option.value ? 'border-primary/40 bg-primary/5' : 'border-gray-100 hover:border-primary/30 hover:bg-primary/5'"
                type="button"
                role="radio"
                class="flex items-start gap-3 rounded-2xl border bg-white p-4 text-left transition"
                @click="deliveryMode = option.value"
              >
                <span
                  :class="deliveryMode === option.value ? 'border-primary' : 'border-gray-300'"
                  class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2"
                >
                  <span
                    v-if="deliveryMode === option.value"
                    class="size-2.5 rounded-full bg-primary"
                  />
                </span>

                <span class="min-w-0">
                  <span
                    class="block font-bold text-highlighted"
                    v-text="option.label"
                  />

                  <span
                    class="mt-0.5 block text-sm text-muted"
                    v-text="option.hint"
                  />
                </span>
              </button>
            </div>

            <div
              v-if="deliveryMode === 'showroom' && showroomInfo"
              class="mt-4 space-y-3 rounded-2xl border border-primary/15 bg-primary/5 p-4"
            >
              <div class="font-bold text-highlighted">
                Showroom · {{ showroomInfo.name }}
              </div>

              <div class="text-sm leading-6 text-muted">
                <div v-text="showroomInfo.street" />

                <div
                  v-if="showroomInfo.note"
                  v-text="showroomInfo.note"
                />
              </div>

              <div
                :class="showroomInfo.status.isOpen ? 'text-success' : 'text-muted'"
                class="flex items-center gap-2 text-sm font-medium"
              >
                <UIcon
                  name="i-lucide-clock"
                  class="size-4"
                />
                {{ formatOpeningStatus(showroomInfo.status) }}
              </div>

              <div class="flex flex-wrap gap-2 pt-1">
                <UButton
                  v-if="showroomInfo.mapUrl"
                  :to="showroomInfo.mapUrl"
                  target="_blank"
                  variant="soft"
                  color="primary"
                  icon="i-lucide-map-pin"
                >
                  Abrir no Google Maps
                </UButton>

                <UButton
                  v-if="showroomInfo.telHref"
                  :to="showroomInfo.telHref"
                  variant="soft"
                  color="neutral"
                  icon="i-lucide-phone"
                >
                  Ligar
                </UButton>
              </div>
            </div>

            <div
              v-else-if="deliveryMode === 'delivery'"
              class="mt-4 space-y-2 rounded-2xl border border-primary/15 bg-primary/5 p-4"
            >
              <div class="font-bold text-highlighted">
                Entrega na tua morada
              </div>

              <p class="text-sm leading-6 text-muted">
                A morada, a data e a taxa de entrega são combinadas após o pedido. A taxa não está incluída no valor dos artigos.
              </p>
            </div>
          </UCard>

          <UCard :ui="{ body: isItemsOpen ? '' : 'py-4 sm:py-4' }">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 text-left"
              :aria-expanded="isItemsOpen"
              @click="isItemsOpen = !isItemsOpen"
            >
              <span class="text-lg font-black text-highlighted">
                Artigos do pedido · {{ totalCount }}
              </span>

              <span class="flex items-center gap-1 text-sm font-medium text-primary">
                {{ isItemsOpen ? 'Ocultar' : 'Ver artigos' }}

                <UIcon
                  :name="isItemsOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  class="size-4"
                />
              </span>
            </button>

            <ul
              v-if="isItemsOpen"
              class="mt-4 divide-y divide-gray-100 border-t border-gray-100"
            >
              <li
                v-for="cartItem in items"
                :key="cartItem.key"
                class="flex items-start justify-between gap-4 py-3"
              >
                <div class="min-w-0">
                  <div
                    class="font-medium leading-snug text-highlighted"
                    v-text="cartItem.productName"
                  />

                  <div class="mt-1 text-sm text-muted">
                    {{ [itemVariantLabel(cartItem), `${cartItem.qty} un.`].filter(Boolean).join(' · ') }}
                  </div>
                </div>

                <span
                  class="shrink-0 font-semibold text-highlighted"
                  v-text="formatPrice(cartItem.price * cartItem.qty)"
                />
              </li>
            </ul>
          </UCard>
        </div>

        <UCard class="border-primary/20 bg-primary/5 lg:sticky lg:top-24">
          <h2 class="text-lg font-black text-highlighted">
            Resumo do pedido
          </h2>

          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-muted">
                {{ totalCount === 1 ? '1 artigo' : `${totalCount} artigos` }}
              </dt>

              <dd
                class="text-highlighted"
                v-text="formatPrice(totalKz)"
              />
            </div>

            <div class="flex items-center justify-between gap-3">
              <dt class="text-muted">
                {{ deliveryMode === 'showroom' ? 'Recolha no showroom' : 'Entrega ao domicílio' }}
              </dt>

              <dd class="text-highlighted">
                {{ deliveryMode === 'showroom' ? 'Grátis' : 'Taxa a combinar' }}
              </dd>
            </div>
          </dl>

          <div class="mt-3">
            <CheckoutCouponLine
              redirectTo="/checkout"
              allowCode
              :total="totalKz"
            />
          </div>

          <div class="mt-4 border-t border-primary/10 pt-4">
            <div class="flex items-baseline justify-between gap-4">
              <span class="text-sm font-semibold text-highlighted">
                Total se ficares com tudo
              </span>

              <span
                class="text-lg font-black text-primary"
                v-text="formatPrice(discountedTotal)"
              />
            </div>

            <p class="mt-2 text-xs leading-5 text-muted">
              Experimenta primeiro. Paga apenas o que decidires levar.
            </p>
          </div>

          <div class="hidden lg:block">
            <UButton
              :loading="isSubmitting"
              :disabled="!items.length"
              type="submit"
              color="primary"
              size="xl"
              class="mt-4 w-full justify-center"
            >
              {{ isAccountUser ? 'Confirmar pedido' : 'Enviar pedido' }}
            </UButton>

            <p class="mt-2 text-center text-xs text-muted">
              Sem pagamento agora
            </p>
          </div>

          <p class="mt-4 border-t border-primary/10 pt-4 text-xs leading-5 text-muted">
            <strong class="text-highlighted">E depois?</strong>
            Recebes a confirmação por SMS e acompanhas o pedido na tua conta. Se precisares, falamos pelo WhatsApp.
          </p>
        </UCard>
      </UForm>

      <div class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div class="mx-auto flex max-w-6xl items-center gap-3">
          <div class="min-w-0">
            <div class="text-xs text-muted">
              Total dos artigos
            </div>

            <div
              class="text-lg font-black text-primary"
              v-text="formatPrice(discountedTotal)"
            />
          </div>

          <UButton
            :loading="isSubmitting"
            :disabled="!items.length"
            type="submit"
            form="checkout-form"
            color="primary"
            size="xl"
            class="ml-auto justify-center"
          >
            {{ isAccountUser ? 'Confirmar pedido' : 'Enviar pedido' }}
          </UButton>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
