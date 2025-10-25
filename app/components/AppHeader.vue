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
  <UHeader
    :toggle="false"
    class="border-b backdrop-blur supports-[backdrop-filter]:bg-white/70"
  >
    <!-- Логотип -->
    <template #left>
      <NuxtLink
        :to="localeRoute({ name: 'index' })"
        class="flex items-center gap-2 font-semibold tracking-tight text-lg"
      >
        <UIcon
          name="i-heroicons-sparkles"
          class="w-5 h-5 text-primary"
        />
        Amoda
      </NuxtLink>
    </template>

    <!-- Корзина -->
    <template #right>
      <UButton
        :to="localeRoute({ name: 'cart' })"
        variant="link"
        icon="i-heroicons-shopping-bag"
        :aria-label="t('header.cart')"
        class="relative"
      >
        <span class="hidden sm:inline mr-1">{{ t('header.cart') }}</span>

        <span
          v-if="count"
          class="absolute -top-1 -right-1 text-[11px] leading-none rounded-full px-1.5 py-0.5 bg-black text-white"
          :aria-label="t('header.cartCount', { count })"
        >
          {{ count }}
        </span>
      </UButton>
    </template>
  </UHeader>
</template>
