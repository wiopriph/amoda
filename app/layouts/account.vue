<script setup lang="ts">
const NAV_ITEMS = [
  {
    label: 'Pedidos',
    icon: 'i-lucide-list',
    to: { name: 'conta' },
    exact: true,
  },
  {
    label: 'Favoritos',
    icon: 'i-heroicons-heart',
    to: { name: 'favorites' },
    exact: false,
  },
  {
    label: 'Os meus dados',
    icon: 'i-lucide-settings',
    to: { name: 'conta-dados' },
    exact: false,
  },
];

const ACTIVE_MOBILE = 'bg-white text-highlighted shadow-sm';
const ACTIVE_DESKTOP = 'border-primary/40 bg-primary/5 text-primary';
</script>

<template>
  <UApp>
    <AppHeader />

    <UMain>
      <UContainer>
        <div class="mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div class="mt-4 grid gap-5 sm:mt-8 lg:grid-cols-[220px_1fr] lg:items-start">
            <nav
              aria-label="A minha conta"
              class="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 p-1.5 lg:hidden"
            >
              <NuxtLink
                v-for="navItem in NAV_ITEMS"
                :key="navItem.label"
                :to="navItem.to"
                :aria-label="navItem.label"
                :title="navItem.label"
                :exactActiveClass="navItem.exact ? ACTIVE_MOBILE : ''"
                :activeClass="navItem.exact ? '' : ACTIVE_MOBILE"
                class="flex h-11 items-center justify-center rounded-xl text-muted transition hover:text-highlighted"
              >
                <UIcon
                  :name="navItem.icon"
                  class="size-5"
                />
              </NuxtLink>
            </nav>

            <nav
              aria-label="A minha conta"
              class="hidden flex-col gap-2 lg:flex"
            >
              <NuxtLink
                v-for="navItem in NAV_ITEMS"
                :key="navItem.label"
                :to="navItem.to"
                :exactActiveClass="navItem.exact ? ACTIVE_DESKTOP : ''"
                :activeClass="navItem.exact ? '' : ACTIVE_DESKTOP"
                class="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-semibold text-toned transition hover:border-primary/30 hover:text-primary"
              >
                <UIcon
                  :name="navItem.icon"
                  class="size-4"
                />

                {{ navItem.label }}
              </NuxtLink>
            </nav>

            <div class="min-w-0">
              <NuxtPage />
            </div>
          </div>
        </div>
      </UContainer>
    </UMain>

    <AppFooter />
  </UApp>
</template>
