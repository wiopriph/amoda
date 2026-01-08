<script setup lang="ts">
const { t } = useI18n();
const localeRoute = useLocaleRoute();

const navItems = computed(() => [
  {
    label: t('admin.brands'),
    icon: 'i-lucide-tag',
    to: localeRoute({ name: 'admin-brands' }),
  },
  {
    label: t('admin.categories'),
    icon: 'i-lucide-layers',
    to: localeRoute({ name: 'admin-categories' }),
  },
  {
    label: t('admin.products'),
    icon: 'i-lucide-shirt',
    to: localeRoute({ name: 'admin-products' }),
  },
  {
    label: t('admin.orders'),
    icon: 'i-lucide-receipt',
    to: localeRoute({ name: 'admin-orders' }),
  },
]);

const { signOut } = useAuth();
</script>

<i18n lang="json">
{
  "en": {
    "admin": {
      "orders": "Orders",
      "brands": "Brands",
      "categories": "Categories",
      "products": "Products",
      "logout": "Logout"
    }
  },
  "pt": {
    "admin": {
      "orders": "Pedidos",
      "brands": "Brands",
      "categories": "Categories",
      "products": "Products",
      "logout": "Sair"
    }
  }
}
</i18n>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          :to="localeRoute({ name: 'admin' })"
          class="flex items-center gap-2 font-semibold tracking-tight text-lg"
        >
          <UIcon
            name="i-lucide-shield-check"
            class="w-5 h-5 text-primary"
          />
          Amoda Admin
        </NuxtLink>
      </template>

      <UNavigationMenu :items="navItems" />

      <template #right>
        <UButton
          variant="ghost"
          class="flex items-center gap-2"
          @click="signOut"
        >
          <UIcon
            name="i-lucide-log-out"
            class="w-4 h-4"
          />
          {{ t('admin.logout') }}
        </UButton>
      </template>
    </UHeader>

    <UMain>
      <UContainer>
        <NuxtPage />
      </UContainer>
    </UMain>
  </UApp>
</template>
