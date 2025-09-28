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

const localeRoute = useLocaleRoute();

const goCheckout = () => navigateTo(localeRoute({ name: 'checkout' }));
</script>

<i18n lang="json">
{
  "pt-AO": {
    "cart": {
      "title": "Carrinho",
      "empty": "O seu carrinho está vazio. Escolha alguns produtos da nossa loja e adicione-os ao carrinho para começar a comprar!",
      "priceEach": "Preço por unidade",
      "remove": "Remover",
      "total": "Total",
      "checkout": "Prosseguir para finalizar",
      "meta": {
        "title": "Carrinho | Amoda",
        "description": "Revise os produtos selecionados antes de finalizar a compra."
      }
    }
  },
  "en": {
    "cart": {
      "title": "Cart",
      "empty": "Your cart is empty. Browse our products and add something to your cart to start shopping!",
      "priceEach": "Price each",
      "remove": "Remove",
      "total": "Total",
      "checkout": "Proceed to checkout",
      "meta": {
        "title": "Cart | Amoda",
        "description": "Review your selected items before checkout."
      }
    }
  }
}
</i18n>

<template>
  <section class="container mx-auto px-3 py-6 max-w-3xl">
    <h1 class="text-2xl font-semibold mb-6">
      {{ t('cart.title') }}
    </h1>

    <div
      v-if="!items.length"
      class="text-gray-500"
    >
      {{ t('cart.empty') }}
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <UCard
        v-for="cartItem in items"
        :key="cartItem.id"
        class="p-3 sm:p-4"
      >
        <div class="flex items-center gap-4">
          <img
            :src="cartItem.image"
            alt=""
            class="w-16 h-16 object-cover rounded"
          >

          <div class="flex-1">
            <div class="font-medium mb-1">
              {{ cartItem.title }}
            </div>

            <div class="text-sm text-gray-500">
              {{ t('cart.priceEach') }}: {{ (cartItem.price / 100).toFixed(2) }} AOA
            </div>

            <div class="flex items-center gap-2 mt-2">
              <UButton
                size="sm"
                variant="ghost"
                aria-label="decrement"
                @click="decrement(cartItem.id)"
              >
                -
              </UButton>

              <UInput
                type="number"
                class="w-16 text-center"
                :modelValue="cartItem.qty"
                @update:model-value="val => setQty(cartItem.id, Number(val))"
              />

              <UButton
                size="sm"
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
              {{ ((cartItem.price * cartItem.qty) / 100).toFixed(2) }} AOA
            </div>

            <UButton
              variant="ghost"
              size="xs"
              class="mt-2"
              @click="remove(cartItem.id)"
            >
              {{ t('cart.remove') }}
            </UButton>
          </div>
        </div>
      </UCard>

      <div class="flex items-center justify-between border-t pt-4 font-semibold text-lg">
        <span>{{ t('cart.total') }}</span>

        <span>{{ (totalAOA / 100).toFixed(2) }} AOA</span>
      </div>

      <UButton
        class="w-full"
        size="lg"
        @click="goCheckout"
      >
        {{ t('cart.checkout') }}
      </UButton>
    </div>
  </section>
</template>
