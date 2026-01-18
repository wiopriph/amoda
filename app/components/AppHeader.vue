<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';


const { t } = useI18n();
const localeRoute = useLocaleRoute();
const { count } = useCart();
const router = useRouter();

const isCategoriesOpen = ref(false);

const goBack = () => {
  router.back();
};

type NavCategory = {
  slug: string
  name: string
  image: string | null
};

const { data: categories } = await useFetch<NavCategory[]>('/api/categories/list');

const hasCategories = computed(() => (categories.value?.length ?? 0) > 0);
const topCategories = computed<NavCategory[]>(() =>
  (categories.value?.filter(cat => !cat.parent_id) ?? []),
);

const menuItems = computed<NavigationMenuItem[]>(() => topCategories.value.map(cat => ({
  label: cat.name,
  to: localeRoute({ name: 'category-slug', params: { slug: cat.slug } }),
})),
);
</script>

<i18n lang="json">
{
  "pt": {
    "header": {
      "cart": "Carrinho",
      "cartCount": "Itens no carrinho: {count}",
      "categories": "Categorias"
    }
  },
  "en": {
    "header": {
      "cart": "Cart",
      "cartCount": "Items in cart: {count}",
      "categories": "Categories"
    }
  }
}
</i18n>

<template>
  <UHeader
    :toggle="false"
    class="border-b backdrop-blur supports-[backdrop-filter]:bg-white/70"
  >
    <template #left>
      <div class="flex items-center gap-1">
        <UButton
          v-if="false"
          class="md:hidden -ml-1"
          variant="ghost"
          color="neutral"
          icon="i-heroicons-chevron-left"
          aria-label="Back"
          @click="goBack"
        />

        <USlideover
          v-if="hasCategories"
          v-model:open="isCategoriesOpen"
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
            <div class="h-full flex flex-col bg-white">
              <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span class="font-semibold text-lg">
                  {{ t('header.categories') }}
                </span>

                <UButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  icon="i-heroicons-x-mark"
                  @click="isCategoriesOpen = false"
                />
              </div>

              <div class="flex-1 overflow-y-auto">
                <div class="divide-y divide-gray-100">
                  <NuxtLink
                    v-for="category in categories || []"
                    :key="category.slug"
                    :to="localeRoute({ name: 'category-slug', params: { slug: category.slug } })"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100"
                    @click="isCategoriesOpen = false"
                  >
                    <div
                      class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0"
                    >
                      <img
                        v-if="category.image"
                        :src="category.image"
                        :alt="category.name"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      >

                      <UIcon
                        v-else
                        name="i-heroicons-photo"
                        class="w-5 h-5 text-gray-400"
                      />
                    </div>

                    <span class="text-[15px] leading-snug text-gray-900">
                      {{ category.name }}
                    </span>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </template>
        </USlideover>

        <NuxtLink
          :to="localeRoute({ name: 'index' })"
          class="flex items-center gap-2
         font-montserrat font-semibold
         tracking-tight text-[22px]
         text-gray-900"
        >
          AMODA
        </NuxtLink>
      </div>
    </template>

    <UNavigationMenu :items="menuItems" />

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
