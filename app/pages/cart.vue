<script setup lang="ts">
definePageMeta({ name: 'cart' });

const { t } = useI18n();

useHead(() => ({
  title: t('cart.meta.title'),
  meta: [
    { name: 'description', content: t('cart.meta.description') },
    { property: 'og:title', content: t('cart.meta.title') },
    { property: 'og:description', content: t('cart.meta.description') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));


const {
  items,
  totalAOA,
  increment,
  decrement,
  setQty,
  remove,
} = useCart();

const fmtAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val)} AOA`;


const localeRoute = useLocaleRoute();

const goCheckout = () => {
  if (!items.value.length) {
    return;
  }

  navigateTo(localeRoute({ name: 'checkout' }));
};

const totalCount = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0));
</script>

<i18n lang="json">
{
  "en": {
    "cart": {
      "title": "Cart",
      "empty": "Your cart is empty. Browse our categories and add items to start shopping!",
      "women": "Women",
      "men": "Men",
      "kids": "Kids",
      "priceEach": "Price each",
      "remove": "Remove",
      "total": "Total",
      "checkout": "Checkout Now",
      "delivery": "Free delivery on all orders today! 🚚",
      "meta": {
        "title": "Cart | Amoda",
        "description": "Review your selected items before checkout."
      }
    }
  },
  "pt": {
    "cart": {
      "title": "Carrinho",
      "empty": "O seu carrinho está vazio. Explore as nossas categorias e adicione produtos ao carrinho para começar!",
      "women": "Mulheres",
      "men": "Homens",
      "kids": "Crianças",
      "priceEach": "Preço por unidade",
      "remove": "Remover",
      "total": "Total",
      "checkout": "Finalizar agora",
      "delivery": "Entrega gratuita em todas as encomendas de hoje! 🚚",
      "meta": {
        "title": "Carrinho | Amoda",
        "description": "Revise os produtos selecionados antes de finalizar a compra."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader :title="t('cart.title')" />

    <UPageBody class="max-w-3xl mx-auto">
      <!-- Пустая корзина -->
      <div
        v-if="!items.length"
        class="text-center py-16 text-gray-600 space-y-4"
      >
        <p class="text-base">
          {{ t('cart.empty') }}
        </p>

        <div class="flex justify-center gap-2">
          <UButton
            v-for="gender in [
              { key: 'women', val: 'women' },
              { key:'men', val: 'men' },
              { key: 'kids', val: 'kids' }
            ]"
            :key="gender.key"
            :to="localeRoute({ name: 'gender', params: { gender: gender.val } })"
            variant="soft"
          >
            {{ t(`cart.${gender.key}`) }}
          </UButton>
        </div>
      </div>

      <!-- Содержимое корзины -->
      <div
        v-else
        class="space-y-4"
      >
        <UCard
          v-for="cartItem in items"
          :key="cartItem.id"
          class="p-4"
        >
          <div class="flex items-center gap-4">
            <NuxtLink
              :to="localeRoute({ name: 'product-slug', params: { slug: cartItem.slug } })"
              class="shrink-0"
            >
              <NuxtImg
                :src="cartItem.image || ''"
                :alt="cartItem.title"
                width="80"
                height="80"
                class="rounded-md border object-cover w-20 h-20"
              />
            </NuxtLink>

            <div class="flex-1 min-w-0">
              <NuxtLink
                class="font-medium line-clamp-2 hover:underline"
                :to="localeRoute({ name: 'product-slug', params: { slug: cartItem.slug } })"
              >
                {{ cartItem.title }}
              </NuxtLink>

              <div class="text-sm text-gray-500 mt-1">
                {{ t('cart.priceEach') }}: {{ fmtAOA(cartItem.price) }}
              </div>

              <div class="flex items-center gap-2 mt-2">
                <UButton
                  size="xs"
                  variant="ghost"
                  aria-label="decrement"
                  @click="decrement(cartItem.id)"
                >
                  −
                </UButton>

                <UInput
                  type="number"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  size="xs"
                  class="w-16 text-center"
                  :modelValue="cartItem.qty"
                  @update:model-value="val => setQty(cartItem.id, Number(val))"
                />

                <UButton
                  size="xs"
                  variant="ghost"
                  aria-label="increment"
                  @click="increment(cartItem.id)"
                >
                  +
                </UButton>
              </div>
            </div>

            <div class="text-right">
              <div class="font-semibold">
                {{ fmtAOA(cartItem.price * cartItem.qty) }}
              </div>

              <UButton
                variant="ghost"
                size="xs"
                class="mt-1 text-gray-500 hover:text-red-600"
                @click="remove(cartItem.id)"
              >
                {{ t('cart.remove') }}
              </UButton>
            </div>
          </div>
        </UCard>

        <div class="flex items-center justify-between border-t pt-4 font-semibold text-lg">
          <span>{{ t('cart.total') }}</span>

          <span>{{ fmtAOA(totalAOA) }}</span>
        </div>

        <UAlert
          :description="t('cart.delivery')"
          icon="i-heroicons-information-circle"
          color="primary"
          variant="soft"
          class="text-sm"
        />

        <UButton
          size="xl"
          color="primary"
          class="w-full py-4 text-lg font-semibold tracking-wide uppercase justify-center"
          :disabled="!items.length"
          @click="goCheckout"
        >
          {{ t('cart.checkout') }} ({{ totalCount }})
        </UButton>
      </div>
    </UPageBody>
  </UPage>
</template>
