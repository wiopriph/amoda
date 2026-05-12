<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'cart' });

const title = 'Seleção para experimentar';
const description = 'Revise a sua seleção na Amoda antes de confirmar. Você não paga online: experimenta primeiro e paga apenas pelo que gostar.';

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
  items: cartItems,
  totalAOA,
  increment,
  decrement,
  setQty,
  remove,
  publicCode: cartPublicCode,
  isPending: isCartPending,
  error: cartError,
} = useCart();

const priceFormatter = new Intl.NumberFormat('pt-AO');
const formatPrice = (price: number) => `${priceFormatter.format(price)} AOA`;

const { trackBeginCheckout } = useAnalyticsEvent();

const totalCount = computed(() => cartItems.value.reduce((total, cartItem) => total + cartItem.qty, 0));

const trustBadges = [
  {
    icon: 'i-lucide-wallet',
    title: 'Sem pagamento online',
  },
  {
    icon: 'i-lucide-shirt',
    title: 'Experimente antes',
  },
  {
    icon: 'i-lucide-check-circle-2',
    title: 'Pague só o que gostar',
  },
];

const nextSteps = [
  {
    title: 'Confirme a escolha',
    description: 'Enviaremos o pedido com os itens escolhidos.',
  },
  {
    title: 'Falamos consigo no WhatsApp',
    description: 'Confirmamos disponibilidade, ponto e horário.',
  },
  {
    title: 'Experimente e decida',
    description: 'Você leva apenas o que gostar. Sem obrigação.',
  },
];

const getProductTo = (cartItem: any) => ({
  name: 'product-slug',
  params: { slug: cartItem.slug },
});

const normalizeQuantity = (quantity: unknown) => Math.max(1, Number(quantity) || 1);

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
      value: totalAOA.value,
      items: getAnalyticsItems(),
    });
  }
};

const openCheckout = () => {
  trackCheckoutIntent();

  navigateTo({ name: 'checkout' });
};

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => 'Olá! Quero confirmar a minha escolha na Amoda.');
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
          A sua seleção para experimentar
        </h1>

        <p class="mt-4 text-base leading-7 text-muted sm:text-lg">
          Estes itens ainda não estão comprados. Esta é a sua escolha para experimentar primeiro.
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
              A sua seleção está vazia
            </h2>

            <p class="mt-2 max-w-sm text-sm leading-6 text-muted">
              Escolha algumas peças para experimentar. Não precisa pagar agora.
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

                  <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted sm:text-sm">
                    <span>Cor: {{ cartItem.variantLabel || '—' }}</span>

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
                          size="sm"
                          variant="outline"
                          @click="decrement(cartItem.key)"
                        >
                          −
                        </UButton>

                        <UInput
                          :modelValue="cartItem.qty"
                          type="number"
                          inputmode="numeric"
                          pattern="[0-9]*"
                          size="sm"
                          class="w-14 sm:w-16"
                          @update:model-value="quantity => setQty(cartItem.key, normalizeQuantity(quantity))"
                        />

                        <UButton
                          size="sm"
                          variant="outline"
                          @click="increment(cartItem.key)"
                        >
                          +
                        </UButton>
                      </div>
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
                      v-text="formatPrice(totalAOA)"
                    />
                  </div>

                  <p class="text-xs leading-5 text-muted">
                    Se tiver WhatsApp, envie a escolha agora. Se preferir, deixe o seu número e a nossa equipa escreve ou liga para si.
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
                  :to="whatsappHref"
                  :disabled="!cartItems.length"
                  size="xl"
                  color="success"
                  icon="i-simple-icons-whatsapp"
                  class="mt-5 w-full justify-center"
                  target="_blank"
                  @click="trackCheckoutIntent"
                >
                  Enviar no WhatsApp
                </UButton>

                <UButton
                  :disabled="!cartItems.length"
                  size="lg"
                  color="neutral"
                  variant="ghost"
                  class="mt-2 w-full justify-center"
                  @click="openCheckout"
                >
                  Deixar número
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
                  v-text="formatPrice(totalAOA)"
                />
              </div>

              <div
                class="text-right text-xs leading-5 text-muted"
                v-text="`${totalCount} item(ns)`"
              />
            </div>

            <p class="mb-2 text-xs leading-5 text-muted">
              WhatsApp é mais rápido. Sem WhatsApp? Deixe o número e falamos consigo.
            </p>

            <UButton
              :to="whatsappHref"
              :disabled="!cartItems.length"
              size="xl"
              color="success"
              icon="i-simple-icons-whatsapp"
              class="w-full justify-center"
              target="_blank"
              @click="trackCheckoutIntent"
            >
              Enviar no WhatsApp
            </UButton>

            <UButton
              :disabled="!cartItems.length"
              size="sm"
              color="neutral"
              variant="ghost"
              class="mt-1 w-full justify-center"
              @click="openCheckout"
            >
              Deixar número
            </UButton>
          </div>
        </div>
      </template>
    </UPageBody>
  </UPage>
</template>
