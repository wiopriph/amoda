<script setup lang="ts">
const MENU_LIST = [
  {
    label: 'Carrinhos',
    icon: 'i-lucide-shopping-cart',
    to: { name: 'admin-carts' },
  },
  {
    label: 'Pedidos',
    icon: 'i-lucide-receipt',
    to: { name: 'admin-orders' },
  },
  {
    label: 'Products',
    icon: 'i-lucide-shirt',
    to: { name: 'admin-products' },
  },
  {
    label: 'Categories',
    icon: 'i-lucide-layers',
    to: { name: 'admin-categories' },
  },
  {
    label: 'Brands',
    icon: 'i-lucide-tag',
    to: { name: 'admin-brands' },
  },
  {
    label: 'Pontos de levantamento',
    icon: 'i-lucide-store',
    to: { name: 'admin-offices' },
  },
  {
    label: 'MoySklad',
    icon: 'i-lucide-link',
    to: { name: 'admin-moysklad-match' },
  },
];

const isMenuOpen = ref(false);

const closeMenu = () => {
  isMenuOpen.value = false;
};

const { signOut } = useAuth();
</script>

<template>
  <UApp>
    <UHeader :toggle="false">
      <template #left>
        <div class="flex items-center gap-2">
          <USlideover
            v-model:open="isMenuOpen"
            side="left"
            class="md:hidden"
          >
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-heroicons-bars-3"
              aria-label="Menu"
            />

            <template #content>
              <div class="flex h-full flex-col bg-white">
                <div class="border-b border-gray-100 px-4 py-4">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 font-semibold tracking-tight text-lg">
                      <UIcon
                        name="i-lucide-shield-check"
                        class="w-5 h-5 text-primary"
                      />
                      Amoda Admin
                    </div>

                    <UButton
                      variant="ghost"
                      color="neutral"
                      size="sm"
                      icon="i-heroicons-x-mark"
                      aria-label="Fechar"
                      @click="closeMenu"
                    />
                  </div>
                </div>

                <nav class="flex-1 overflow-y-auto px-4 py-3">
                  <div class="grid gap-2">
                    <NuxtLink
                      v-for="menuItem in MENU_LIST"
                      :key="menuItem.label"
                      :to="menuItem.to"
                      class="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3 text-sm font-medium transition hover:border-primary/30 hover:bg-primary/5"
                      @click="closeMenu"
                    >
                      <UIcon
                        :name="menuItem.icon"
                        class="size-5 text-primary"
                      />

                      <span class="min-w-0 flex-1">
                        {{ menuItem.label }}
                      </span>

                      <UIcon
                        name="i-heroicons-chevron-right"
                        class="size-4 text-muted"
                      />
                    </NuxtLink>
                  </div>
                </nav>
              </div>
            </template>
          </USlideover>

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
        </div>
      </template>

      <UNavigationMenu
        :items="MENU_LIST"
        class="hidden md:flex"
      />

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
