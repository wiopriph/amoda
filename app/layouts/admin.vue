<script setup lang="ts">
const MENU_LIST = [
  {
    label: 'Pontos de levantamento',
    icon: 'i-lucide-store',
    to: { name: 'admin-offices' },
  },
  {
    label: 'Brands',
    icon: 'i-lucide-tag',
    to: { name: 'admin-brands' },
  },
  {
    label: 'Categories',
    icon: 'i-lucide-layers',
    to: { name: 'admin-categories' },
  },
  {
    label: 'Products',
    icon: 'i-lucide-shirt',
    to: { name: 'admin-products' },
  },
  {
    label: 'Pedidos',
    icon: 'i-lucide-receipt',
    to: { name: 'admin-orders' },
  },
];

const { signOut } = useAuth();
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          :to="{ name: 'admin' }"
          class="flex items-center gap-2 font-semibold tracking-tight text-lg"
        >
          <UIcon
            name="i-lucide-shield-check"
            class="w-5 h-5 text-primary"
          />
          Amoda Admin
        </NuxtLink>
      </template>

      <UNavigationMenu :items="MENU_LIST" />

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
          Sair
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
