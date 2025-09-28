<script setup lang="ts">
const { t } = useI18n();
const localeRoute = useLocaleRoute();

const { count } = useCart();
</script>

<i18n lang="json">
{
  "pt-AO": {
    "header": {
      "cart": "Carrinho",
      "cartCount": "Itens no carrinho: {count}"
    }
  },
  "en": {
    "header": {
      "cart": "Cart",
      "cartCount": "Items in cart: {count}"
    }
  }
}
</i18n>

<template>
  <header
    class="sticky top-0 z-50 border-b backdrop-blur"
  >
    <div class="container mx-auto px-3">
      <div class="h-14 flex items-center justify-between">
        <NuxtLink
          :to="localeRoute({ name: 'index' })"
          class="flex items-center gap-2"
        >
          <span class="font-semibold tracking-tight">Amoda</span>
        </NuxtLink>

        <UButton
          :to="localeRoute({ name: 'cart' })"
          variant="ghost"
          class="relative flex items-center"
          :aria-label="t('header.cart')"
        >
          <span class="hidden sm:inline mr-1">{{ t('header.cart') }}</span>

          <UIcon
            name="i-heroicons-shopping-bag"
            class="w-5 h-5"
          />

          <span
            v-if="count"
            class="absolute -top-1 -right-1 text-[11px] leading-none rounded-full px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black"
            :aria-label="t('header.cartCount', { count })"
          >
            {{ count }}
          </span>
        </UButton>
      </div>
    </div>
  </header>
</template>
