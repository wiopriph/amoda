<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { formatPrice } from '~/utils/formatPrice';
import { makeGa4Item } from '~/utils/ga4';
import { colorLabel } from '#shared/constants/colors';


definePageMeta({ name: 'cart' });

const title = 'Seleção para experimentar';
const description = 'Revê a tua seleção na Amoda antes de confirmar. Não pagas online: experimentas primeiro e pagas só o que gostares.';

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
  items: cartItems,
  totalKz,
  increment,
  decrement,
  remove,
  publicCode: cartPublicCode,
  isPending: isCartPending,
  error: cartError,
} = useCart();

const { trackBeginCheckout } = useAnalyticsEvent();

const totalCount = computed(() => cartItems.value.reduce((total, cartItem) => total + cartItem.qty, 0));

const trustBadges = [
  {
    icon: 'i-lucide-wallet',
    title: 'Sem pagamento online',
  },
  {
    icon: 'i-lucide-shirt',
    title: 'Experimenta antes',
  },
  {
    icon: 'i-lucide-check-circle-2',
    title: 'Paga só o que gostar',
  },
];

const nextSteps = [
  {
    title: 'Confirma a escolha',
    description: 'Enviamos o pedido com as peças escolhidas.',
  },
  {
    title: 'Falamos contigo no WhatsApp',
    description: 'Confirmamos disponibilidade, ponto e horário.',
  },
  {
    title: 'Experimenta e decide',
    description: 'Levas só o que gostares. Sem compromisso.',
  },
];

const getProductTo = (cartItem: any) => ({
  name: 'product-slug',
  params: { slug: cartItem.slug },
});

const isAtStockLimit = (cartItem: any) => cartItem.stock !== null && cartItem.qty >= cartItem.stock;

const getAnalyticsItems = () => cartItems.value.map(cartItem =>
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

const trackCheckoutIntent = () => {
  if (!cartItems.value.length) {
    return;
  }

  if (import.meta.client) {
    trackBeginCheckout({
      value: totalKz.value,
      items: getAnalyticsItems(),
    });
  }
};

const openCheckout = () => {
  trackCheckoutIntent();

  navigateTo({ name: 'checkout' });
};

const buildCartMessage = () => {
  if (!cartItems.value.length) {
    return 'Olá! Quero confirmar a minha escolha na Amoda.';
  }

  const lines = cartItems.value.map((cartItem, index) => {
    const variant = [colorLabel(cartItem.variantLabel), cartItem.sizeLabel].filter(Boolean).join(' / ');
    const suffix = variant ? ` (${variant})` : '';

    return `${index + 1}. ${cartItem.productName}${suffix} ×${cartItem.qty} — ${formatPrice(cartItem.price * cartItem.qty)}`;
  });

  return [
    'Olá! Quero confirmar a minha escolha na Amoda:',
    '',
    ...lines,
    '',
    `Total: ${formatPrice(totalKz.value)}`,
  ].join('\n');
};

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(buildCartMessage);

const { user } = useAuth();
const isAccountUser = computed(() => Boolean(user.value));
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-6xl sm:px-6 lg:px-8">
      <section class="overflow-hidden mb-2 sm:mb-2 rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          Entrega gratuita
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          A tua seleção para experimentar
        </h1>

        <p class="mt-4 text-base leading-7 text-muted sm:text-lg">
          Estas peças ainda não estão compradas. É a tua escolha para experimentar primeiro.
        </p>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-toned">
          <div
            v-for="trustBadge in trustBadges"
            :key="trustBadge.title"
            class="flex items-center gap-2"
          >
            <UIcon
              :name="trustBadge.icon"
              class="size-4 text-primary"
            />

            <span v-text="trustBadge.title" />
          </div>
        </div>
      </section>

      <section
        v-if="!cartItems.length"
        class="mt-5 sm:mt-6"
      >
        <UCard>
          <div class="flex flex-col items-center py-10 text-center">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UIcon
                name="i-lucide-shopping-bag"
                class="size-7"
              />
            </div>

            <h2 class="mt-4 text-xl font-bold text-highlighted">
              A tua seleção está vazia
            </h2>

            <p class="mt-2 max-w-sm text-sm leading-6 text-muted">
              Escolhe algumas peças para experimentar. Não precisas de pagar agora.
            </p>

            <UButton
              :to="{ name: 'index' }"
              color="primary"
              size="lg"
              class="mt-5 justify-center"
            >
              Ver produtos
            </UButton>
          </div>
        </UCard>
      </section>

      <template v-else>
        <div class="mt-5 grid gap-5 sm:mt-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <section class="space-y-3">
            <UCard
              v-for="cartItem in cartItems"
              :key="cartItem.key"
            >
              <div class="flex gap-3 sm:gap-4">
                <NuxtLink
                  :to="getProductTo(cartItem)"
                  class="shrink-0"
                >
                  <NuxtImg
                    :src="cartItem.image || '/placeholder.webp'"
                    :alt="cartItem.productName"
                    width="96"
                    height="120"
                    class="h-24 w-20 rounded-2xl object-cover sm:h-28 sm:w-24"
                  />
                </NuxtLink>

                <div class="min-w-0 flex-1">
                  <NuxtLink
                    :to="getProductTo(cartItem)"
                    class="line-clamp-2 text-sm font-bold text-highlighted hover:text-primary sm:text-base"
                  >
                    {{ cartItem.productName }}
                  </NuxtLink>

                  <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted sm:text-sm">
                    <span class="inline-flex items-center gap-1.5">
                      Cor:
                      <ColorSwatch
                        v-if="cartItem.variantLabel"
                        :color="cartItem.variantLabel"
                        :size="14"
                      />
                      {{ colorLabel(cartItem.variantLabel) || '—' }}
                    </span>

                    <span>Tamanho: {{ cartItem.sizeLabel || '—' }}</span>
                  </div>

                  <div class="mt-2 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div class="mb-1 text-xs font-medium text-muted">
                        Qtd.
                      </div>

                      <div class="flex items-center gap-2">
                        <UButton
                          :disabled="cartItem.qty <= 1"
                          size="lg"
                          variant="outline"
                          @click="decrement(cartItem.key)"
                        >
                          −
                        </UButton>

                        <div
                          class="w-10 text-center text-base font-bold text-highlighted sm:w-12"
                          aria-live="polite"
                          v-text="cartItem.qty"
                        />

                        <UButton
                          :disabled="isAtStockLimit(cartItem)"
                          size="lg"
                          variant="outline"
                          @click="increment(cartItem.key)"
                        >
                          +
                        </UButton>
                      </div>

                      <p
                        v-if="isAtStockLimit(cartItem)"
                        class="mt-1 text-xs text-amber-600"
                      >
                        {{ cartItem.stock === 1 ? 'Só resta 1 unidade' : `Só restam ${cartItem.stock} unidades` }}
                      </p>
                    </div>

                    <div class="flex min-w-0 items-center justify-between gap-3 sm:block sm:text-right">
                      <div
                        class="text-base font-black text-primary sm:text-lg"
                        v-text="formatPrice(cartItem.price * cartItem.qty)"
                      />

                      <UButton
                        variant="ghost"
                        size="xs"
                        color="neutral"
                        class="mt-0 shrink-0 px-0 text-muted hover:text-red-600 sm:mt-1"
                        @click="remove(cartItem.key)"
                      >
                        Remover
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </section>

          <aside>
            <div class="sticky top-24 space-y-4">
              <!-- На мобиле резюме скрыто, но код корзины нужен — его диктуют в WhatsApp -->
              <div
                v-if="cartPublicCode"
                class="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs text-muted lg:hidden"
              >
                <span>Código do carrinho:</span>

                <span
                  class="ml-1 font-bold text-highlighted"
                  v-text="cartPublicCode"
                />
              </div>

              <UCard class="border-primary/20 bg-primary/5 hidden lg:block">
                <h2 class="text-lg font-black text-highlighted">
                  Resumo da escolha
                </h2>

                <div class="mt-4 space-y-3">
                  <div class="flex justify-between text-sm text-muted">
                    <span v-text="`${totalCount} item(ns)`" />

                    <span v-text="totalCount" />
                  </div>

                  <div class="flex justify-between gap-4 border-t border-primary/10 pt-3">
                    <span class="text-sm font-semibold text-highlighted">
                      Total se levar tudo
                    </span>

                    <span
                      class="text-lg font-black text-primary"
                      v-text="formatPrice(totalKz)"
                    />
                  </div>

                  <p class="text-xs leading-5 text-muted">
                    {{ isAccountUser
                      ? 'Confirma o pedido em segundos — já temos o teu número. Se preferires, envia pelo WhatsApp.'
                      : 'Faz o pedido no site em menos de um minuto, sem pagamento online. Se preferires, envia a escolha pelo WhatsApp.' }}
                  </p>

                  <div
                    v-if="cartPublicCode"
                    class="rounded-xl border border-primary/15 bg-white/80 px-3 py-2 text-xs text-muted"
                  >
                    <span>Código do carrinho:</span>

                    <span
                      class="ml-1 font-bold text-highlighted"
                      v-text="cartPublicCode"
                    />
                  </div>

                  <UAlert
                    v-if="cartError"
                    color="warning"
                    variant="soft"
                    icon="i-lucide-cloud-off"
                    description="Não foi possível atualizar a escolha. Tente novamente."
                  />

                  <div
                    v-else-if="isCartPending"
                    class="flex items-center gap-2 text-xs text-muted"
                  >
                    <UIcon
                      name="i-lucide-loader-2"
                      class="size-4 animate-spin"
                    />

                    <span>A guardar escolha...</span>
                  </div>
                </div>

                <UButton
                  :disabled="!cartItems.length"
                  size="xl"
                  color="primary"
                  icon="i-lucide-shopping-bag"
                  class="mt-5 w-full justify-center"
                  @click="openCheckout"
                >
                  {{ isAccountUser ? 'Confirmar pedido' : 'Fazer o pedido' }}
                </UButton>

                <UButton
                  :to="whatsappHref"
                  :disabled="!cartItems.length"
                  size="lg"
                  color="success"
                  variant="soft"
                  icon="i-simple-icons-whatsapp"
                  class="mt-2 w-full justify-center"
                  target="_blank"
                  @click="trackCheckoutIntent"
                >
                  Enviar no WhatsApp
                </UButton>
              </UCard>

              <UCard>
                <h2 class="text-base font-bold text-highlighted">
                  O que acontece depois?
                </h2>

                <div class="mt-4 space-y-3">
                  <div
                    v-for="(nextStep, stepIndex) in nextSteps"
                    :key="nextStep.title"
                    class="flex gap-3"
                  >
                    <div
                      class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                      v-text="stepIndex + 1"
                    />

                    <div>
                      <div
                        class="text-sm font-semibold text-highlighted"
                        v-text="nextStep.title"
                      />

                      <div
                        class="text-sm leading-6 text-muted"
                        v-text="nextStep.description"
                      />
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </aside>
        </div>

        <div class="fixed bottom-0 left-0 right-0 z-60 border-t border-gray-200 bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] lg:hidden">
          <div class="mx-auto max-w-5xl">
            <div class="mb-2 flex items-center justify-between gap-3">
              <div>
                <div class="text-xs text-muted">
                  Total se levar tudo
                </div>

                <div
                  class="text-lg font-black text-primary"
                  v-text="formatPrice(totalKz)"
                />
              </div>

              <div
                class="text-right text-xs leading-5 text-muted"
                v-text="`${totalCount} item(ns)`"
              />
            </div>

            <p class="mb-2 text-xs leading-5 text-muted">
              Pedido no site em menos de um minuto, sem pagamento online. WhatsApp também funciona.
            </p>

            <UButton
              :disabled="!cartItems.length"
              size="xl"
              color="primary"
              icon="i-lucide-shopping-bag"
              class="w-full justify-center"
              @click="openCheckout"
            >
              {{ isAccountUser ? 'Confirmar pedido' : 'Fazer o pedido' }}
            </UButton>

            <UButton
              :to="whatsappHref"
              :disabled="!cartItems.length"
              size="md"
              color="success"
              variant="soft"
              icon="i-simple-icons-whatsapp"
              class="mt-1 w-full justify-center"
              target="_blank"
              @click="trackCheckoutIntent"
            >
              Enviar no WhatsApp
            </UButton>
          </div>
        </div>
      </template>
    </UPageBody>
  </UPage>
</template>
