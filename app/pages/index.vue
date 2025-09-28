<script setup lang="ts">
definePageMeta({ name: 'index' });

const { t } = useI18n();

useHead({
  title: t('home.title'),
  meta: [{ name: 'description', content: t('home.desc') }],
});

const localeRoute = useLocaleRoute();

const route = useRoute();

const { data, pending, error } = await useFetch('/api/catalog/list', {
  query: { limit: 12 },
  watch: [() => route.fullPath],
});

const items = computed(() => data.value?.items || []);
</script>

<i18n lang="json">
{
  "pt-AO": {
    "home": {
      "title": "Amoda — Loja online",
      "desc": "Compre roupas, sapatos e acessórios online.",
      "hero": "Moda para todos os dias",
      "women": "Mulheres",
      "men": "Homens",
      "kids": "Crianças",
      "showcase": "Em destaque"
    }
  },
  "en": {
    "home": {
      "title": "Amoda — Online store",
      "desc": "Shop clothes, shoes and accessories online.",
      "hero": "Everyday fashion",
      "women": "Women",
      "men": "Men",
      "kids": "Kids",
      "showcase": "Featured"
    }
  }
}
</i18n>

<template>
  <section class="container mx-auto px-3 py-6">
    <!-- Баннер -->
    <div class="mb-6 h-40 sm:h-56 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-2xl font-semibold">
          Amoda
        </h1>

        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {{ t('home.hero') }}
        </p>
      </div>
    </div>

    <!-- Разделы -->
    <div class="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
      <NuxtLink
        class="p-4 rounded bg-gray-50 dark:bg-gray-800 text-center font-medium"
        :to="localeRoute({ name: 'gender', params: { gender: 'women' } })"
      >
        {{ t('home.women') }}
      </NuxtLink>

      <NuxtLink
        class="p-4 rounded bg-gray-50 dark:bg-gray-800 text-center font-medium"
        :to="localeRoute({ name: 'gender', params: { gender: 'men' } })"
      >
        {{ t('home.men') }}
      </NuxtLink>

      <NuxtLink
        class="p-4 rounded bg-gray-50 dark:bg-gray-800 text-center font-medium"
        :to="localeRoute({ name: 'gender', params: { gender: 'kids' } })"
      >
        {{ t('home.kids') }}
      </NuxtLink>
    </div>

    <!-- Витрина -->
    <h2 class="text-lg font-semibold mb-3">
      {{ t('home.showcase') }}
    </h2>

    <div
      v-if="pending"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
    >
      <USkeleton
        v-for="i in 8"
        :key="i"
        class="aspect-[3/4]"
      />
    </div>

    <div
      v-else-if="error"
      class="text-sm text-red-600"
    >
      Error
    </div>

    <div
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
    >
      <ProductCard
        v-for="product in items"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>
