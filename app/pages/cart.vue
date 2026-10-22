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
  add: addToCart,
  isPending: isCartPending,
  error: cartError,
} = useCart();

const { trackBeginCheckout } = useAnalyticsEvent();

const totalCount = computed(() => cartItems.value.reduce((total, cartItem) => total + cartItem.qty, 0));

const isHowItWorksOpen = ref(false);

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

const variantLine = (cartItem: any) => [colorLabel(cartItem.variantLabel), cartItem.sizeLabel ? `Tamanho ${cartItem.sizeLabel}` : null]
  .filter(Boolean)
  .join(' · ');

const toast = useToast();

// Удаление с отменой: снимок строки хранит всё, что нужно, чтобы вернуть вещь тем же addItem
const removeWithUndo = async (cartItem: any) => {
  const snapshot = { ...cartItem };

  await remove(cartItem.key);

  toast.add({
    title: 'Artigo removido',
    description: snapshot.productName,
    color: 'neutral',
    actions: [{
      label: 'Anular',
      color: 'primary',
      variant: 'soft',
      onClick: () => {
        addToCart(
          { id: snapshot.productId, slug: snapshot.slug, title: snapshot.productName, images: snapshot.image ? [{ url: snapshot.image }] : [] },
          { id: snapshot.variantId, color: snapshot.variantLabel, price: snapshot.price },
          { id: snapshot.sizeId, size: snapshot.sizeLabel, stock: snapshot.stock },
          snapshot.qty,
        );
      },
    }],
  });
};

const { total: totalWithCoupon, watchCart: watchCartCoupon } = useCheckoutCoupon();

watchCartCoupon();
</script>

<template>
  <UPage>
    <UPageBody
      :ui="{ base: 'space-y-0' }"
      class="mx-auto max-w-6xl sm:px-6 lg:px-8"
    >
      <div>
        <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
          O teu carrinho
        </h1>

        <p class="mt-1 text-sm text-muted sm:text-base">
          Experimenta primeiro. Paga só o que levares.
        </p>
      </div>

      <section
        v-if="!cartItems.length"
        class="mt-5"
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
        <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
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

                  <div class="mt-2 flex items-center gap-1.5 text-xs text-muted sm:text-sm">
                    <ColorSwatch
                      v-if="cartItem.variantLabel"
                      :color="cartItem.variantLabel"
                      :size="14"
                    />

                    <span v-text="variantLine(cartItem) || '—'" />
                  </div>

                  <div class="mt-3 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div
                        class="flex items-center gap-2"
                        role="group"
                        aria-label="Quantidade"
                      >
                        <UButton
                          :disabled="cartItem.qty <= 1"
                          size="lg"
                          variant="outline"
                          aria-label="Diminuir quantidade"
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
                          aria-label="Aumentar quantidade"
                          @click="increment(cartItem.key)"
                        >
                          +
                        </UButton>
                      </div>

                      <p
                        class="mt-1 min-h-4 text-xs text-amber-600"
                        aria-live="polite"
                      >
                        <template v-if="isAtStockLimit(cartItem)">
                          {{ cartItem.stock === 1 ? 'Última unidade disponível' : `Só restam ${cartItem.stock} unidades` }}
                        </template>
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
                        @click="removeWithUndo(cartItem)"
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
                  Resumo do pedido
                </h2>

                <div class="mt-4 space-y-3">
                  <div class="flex justify-between text-sm">
                    <span
                      class="text-muted"
                      v-text="`Artigos (${totalCount})`"
                    />

                    <span
                      class="text-highlighted"
                      v-text="formatPrice(totalKz)"
                    />
                  </div>

                  <CheckoutCouponLine
                    redirectTo="/cart"
                    :total="totalKz"
                  />

                  <div class="flex justify-between gap-4 border-t border-primary/10 pt-3">
                    <span class="text-sm font-semibold text-highlighted">
                      Total se levares tudo
                    </span>

                    <span
                      class="text-lg font-black text-primary"
                      v-text="formatPrice(totalWithCoupon)"
                    />
                  </div>

                  <p class="text-xs leading-5 text-muted">
                    No próximo passo, escolhes entrega ou recolha.
                  </p>

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
                  Continuar para o pedido
                </UButton>

                <p class="mt-2 text-center text-xs text-muted">
                  Sem pagamento agora
                </p>

                <UButton
                  :to="whatsappHref"
                  :disabled="!cartItems.length"
                  variant="link"
                  color="neutral"
                  size="sm"
                  icon="i-simple-icons-whatsapp"
                  class="mt-2 w-full justify-center"
                  target="_blank"
                  @click="trackCheckoutIntent"
                >
                  Prefiro enviar pelo WhatsApp
                </UButton>
              </UCard>

              <UCard :ui="{ body: 'py-4 sm:py-4' }">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-highlighted"
                  :aria-expanded="isHowItWorksOpen"
                  @click="isHowItWorksOpen = !isHowItWorksOpen"
                >
                  Como funciona a prova?

                  <UIcon
                    :name="isHowItWorksOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                    class="size-4 shrink-0 text-muted"
                  />
                </button>

                <p
                  v-if="isHowItWorksOpen"
                  class="mt-2 text-sm leading-6 text-muted"
                >
                  Experimenta em casa ou no showroom e paga apenas pelas peças que decidires levar.
                </p>
              </UCard>
            </div>
          </aside>
        </div>

        <div class="fixed bottom-0 left-0 right-0 z-60 border-t border-gray-200 bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] lg:hidden">
          <div class="mx-auto max-w-5xl">
            <div class="mb-2 flex items-center justify-between gap-3">
              <div>
                <div class="text-xs text-muted">
                  Total se levares tudo
                </div>

                <div
                  class="text-lg font-black text-primary"
                  v-text="formatPrice(totalWithCoupon)"
                />
              </div>

              <div
                class="text-right text-xs leading-5 text-muted"
                v-text="`Artigos (${totalCount})`"
              />
            </div>

            <div class="mb-2">
              <CheckoutCouponLine
                redirectTo="/cart"
                :total="totalKz"
              />
            </div>

            <UButton
              :disabled="!cartItems.length"
              size="xl"
              color="primary"
              icon="i-lucide-shopping-bag"
              class="w-full justify-center"
              @click="openCheckout"
            >
              Continuar para o pedido
            </UButton>

            <p class="mt-1 text-center text-xs text-muted">
              Sem pagamento agora
            </p>

            <UButton
              :to="whatsappHref"
              :disabled="!cartItems.length"
              variant="link"
              color="neutral"
              size="sm"
              icon="i-simple-icons-whatsapp"
              class="mt-1 w-full justify-center"
              target="_blank"
              @click="trackCheckoutIntent"
            >
              Prefiro enviar pelo WhatsApp
            </UButton>
          </div>
        </div>
      </template>
    </UPageBody>
  </UPage>
</template>
