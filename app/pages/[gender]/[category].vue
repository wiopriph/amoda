<script setup lang="ts">
definePageMeta({ name: 'gender-category' });

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const limit = 24;
const page = computed(() => Math.max(1, Number(route.query.page || 1)));

const { data, pending, error } = await useFetch(
  '/api/catalog/list',
  {
    query: {
      gender: route.params.gender,
      slug: route.params.category,
      page: page.value,
      limit,
      q: route.query.q,
      brand_id: route.query.brand_id,
      size: route.query.size,
      color: route.query.color,
      sort: route.query.sort,
    },
    watch: [() => route.fullPath],
  },
);

if (error.value || !data.value) {
  throw createError({ statusCode: 404 });
}

const localeRoute = useLocaleRoute();

const breadcrumbsUi = computed(() =>
  (data.value?.breadcrumbs || []).map(c => ({
    label: c.label,
    to: localeRoute(c.to),
  })),
);

const items = computed(() => data.value?.items || []);
const total = computed(() => data.value?.total || 0);
const pages = computed(() => Math.max(1, Math.ceil(total.value / limit)));

const titleText = computed(() => String(route.params.category)
  .replaceAll('-', ' '));

const setPage = (p: number) => {
  router.push({ query: { ...route.query, page: p } });
};

const pageTitle = computed(() => `${titleText.value} | Amoda`);
const pageDescription = computed(() => t('genderCategory.metaDescription', { category: titleText.value }));

useHead(() => ({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: pageDescription.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDescription.value },
    { property: 'twitter:title', content: pageTitle.value },
    { property: 'twitter:description', content: pageDescription.value },
  ],
}));
</script>

<i18n lang="json">
{
  "pt-AO": {
    "genderCategory": {
      "empty": "Não há produtos nesta categoria ainda.",
      "metaDescription": "Descubra os melhores produtos na categoria {category} em Amoda."
    }
  },
  "en": {
    "genderCategory": {
      "empty": "No products found in this category yet.",
      "metaDescription": "Discover the best products in the {category} category on Amoda."
    }
  }
}
</i18n>

<template>
  <section class="container mx-auto px-3 py-6">
    <!-- Хлебные крошки -->
    <UBreadcrumb
      :items="breadcrumbsUi"
      class="mb-3 md:mb-4 hidden md:block"
    />

    <div class="grid grid-cols-12 gap-6">
      <!-- Sidebar -->
      <div class="hidden md:block md:col-span-3">
        <SidebarCategories :gender="route.params.gender as string" />
      </div>

      <!-- Products -->
      <div class="col-span-12 md:col-span-9">
        <h1 class="text-xl font-semibold mb-4 capitalize">
          {{ titleText }}
        </h1>

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

        <template v-else>
          <div
            v-if="!items.length"
            class="text-gray-500"
          >
            {{ t('genderCategory.empty') }}
          </div>

          <div
            v-else
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            <ProductCard
              v-for="p in items"
              :key="p.id"
              :product="p"
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
