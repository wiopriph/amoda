<script setup lang="ts">
definePageMeta({ name: 'gender' });

const { t } = useI18n();

const route = useRoute();
const limit = 24;
const page = computed(() => Math.max(1, Number(route.query.page || 1)));

const { data, pending, error } = await useFetch('/api/catalog/list', {
  query: {
    gender: route.params.gender,
    q: route.query.q || '',
    page: page.value,
    limit,
  },
  watch: [() => route.fullPath],
});

if (error.value || !data.value) {
  throw createError({ statusCode: 404 });
}


const localeRoute = useLocaleRoute();

const breadcrumbsUi = computed(() =>
  (data.value?.breadcrumbs || []).map(b => ({
    label: b.label,
    to: localeRoute(b.to),
  })),
);

const items = computed(() => data.value?.items || []);
const total = computed(() => data.value?.total || 0);
const pages = computed(() => Math.max(1, Math.ceil(total.value / limit)));


const router = useRouter();

const setPage = (next: number) => router.push({ query: { ...route.query, page: next } });

const genderHuman = computed(() => String(route.params.gender).replaceAll('-', ' '));
const pageTitle = computed(() => `${t('gender.seoTitle', { gender: genderHuman.value })} | Amoda`);
const pageDescription = computed(() => t('gender.seoDescription', { gender: genderHuman.value }));


const requestURL = useRequestURL();

const breadcrumbJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbsUi.value.map((bc, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: bc.label,
    item: new URL(bc.to?.fullPath, requestURL.origin).href,
  })),
}));

useHead(() => ({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: pageDescription.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDescription.value },
    { name: 'twitter:title', content: pageTitle.value },
    { name: 'twitter:description', content: pageDescription.value },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbJsonLd.value),
    },
  ],
}));
</script>

<i18n lang="json">
{
  "pt-AO": {
    "gender": {
      "searchPlaceholder": "Pesquisar produtos...",
      "empty": "Não há produtos nesta seleção ainda.",
      "seoTitle": "{gender}",
      "seoDescription": "Explore a seleção de {gender} na Amoda: roupas, calçado e acessórios com entrega rápida."
    }
  },
  "en": {
    "gender": {
      "searchPlaceholder": "Search products...",
      "empty": "No products found here yet.",
      "seoTitle": "{gender}",
      "seoDescription": "Explore {gender} selection on Amoda: apparel, shoes and accessories with fast delivery."
    }
  }
}
</i18n>

<template>
  <section class="container mx-auto px-3 py-6">
    <!-- Хлебные крошки (скрыты на мобилке) -->
    <UBreadcrumb
      :items="breadcrumbsUi"
      class="mb-3 md:mb-4 hidden md:block"
    />

    <!-- Заголовок -->
    <h1 class="text-2xl font-semibold mb-4 capitalize">
      {{ genderHuman }}
    </h1>

    <div class="grid grid-cols-12 gap-6">
      <!-- Сайдбар категорий -->
      <aside class="hidden md:block md:col-span-3">
        <SidebarCategories :gender="route.params.gender as string" />
      </aside>

      <!-- Контент -->
      <div class="col-span-12 md:col-span-9">
        <!-- Скелетон -->
        <div
          v-if="pending"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          <USkeleton
            v-for="i in 8"
            :key="i"
            class="aspect-[3/4]"
          />
        </div>

        <template v-else>
          <div
            v-if="!items.length"
            class="text-gray-500"
          >
            {{ t('gender.empty') }}
          </div>

          <div
            v-else
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            <ProductCard
              v-for="product in items"
              :id="product.id"
              :key="product.id"
              :product="product"
            />
          </div>

          <!-- Пагинация -->
          <div
            v-if="pages > 1"
            class="mt-6 flex items-center justify-center gap-2"
          >
            <UButton
              :disabled="page <= 1"
              @click="setPage(page - 1)"
            >
              ‹
            </UButton>

            <span class="text-sm">{{ page }} / {{ pages }}</span>

            <UButton
              :disabled="page >= pages"
              @click="setPage(page + 1)"
            >
              ›
            </UButton>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
