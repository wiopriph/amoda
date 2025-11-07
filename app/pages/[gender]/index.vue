<script setup lang="ts">
definePageMeta({ name: 'gender' });

const { t } = useI18n();
const route = useRoute();
const localeRoute = useLocaleRoute();

const limit = 24;
const page = computed(() => Math.max(1, Number(route.query.page || 1)));

const { data, error } = await useFetch('/api/catalog/list', {
  query: {
    gender: route.params.gender,
    page: page.value,
    limit,
    q: route.query.q,
    brand_id: route.query.brand_id,
    size: route.query.size,
    color: route.query.color,
    sort: route.query.sort,
  },
  watch: [() => route.fullPath],
});

if (error.value || !data.value) {
  throw createError({ statusCode: 404 });
}

const items = computed(() => data.value?.items || []);
const total = computed(() => data.value?.total || 0);
const pages = computed(() => Math.max(1, Math.ceil(total.value / limit)));

const setPage = (next: number) =>
  navigateTo({ query: { ...route.query, page: next } });

const genderHuman = computed(() =>
  String(route.params.gender)
    .replaceAll('-', ' '),
);

const pageTitle = computed(() => `${t('gender.seoTitle', { gender: genderHuman.value })} | Amoda`);
const pageDescription = computed(() =>
  t('gender.seoDescription', { gender: genderHuman.value }),
);

const breadcrumbsUi = computed(() =>
  (data.value?.breadcrumbs || []).map(b => ({
    label: b.label,
    to: localeRoute(b.to),
  })),
);

const requestURL = useRequestURL();
const breadcrumbJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbsUi.value.map((bc, i) => ({
    '@type': 'ListItem',
    position: i + 1,
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
  "pt": {
    "gender": {
      "searchPlaceholder": "Pesquisar produtos...",
      "empty": "Não há produtos nesta seleção ainda.",
      "seoTitle": "{gender}",
      "seoDescription": "Explore a seleção de {gender} na Amoda: roupas, calçado e acessórios com entrega rápida.",
      "filters": "Filtros"
    }
  },
  "en": {
    "gender": {
      "searchPlaceholder": "Search products...",
      "empty": "No products found here yet.",
      "seoTitle": "{gender}",
      "seoDescription": "Explore {gender} selection on Amoda: apparel, shoes and accessories with fast delivery.",
      "filters": "Filters"
    }
  }
}
</i18n>

<template>
  <UPage>
    <template #left>
      <UPageAside>
        <SidebarCategories :gender="route.params.gender as string" />
      </UPageAside>
    </template>

    <UPageHeader
      :title="genderHuman"
      :description="t('gender.seoDescription', { gender: genderHuman })"
    >
      <template #headline>
        <UBreadcrumb :items="breadcrumbsUi" />
      </template>
    </UPageHeader>

    <UPageBody>
      <div
        v-if="!items.length"
        class="text-gray-500 text-sm"
      >
        {{ t('gender.empty') }}
      </div>

      <UBlogPosts
        v-else
        :ui="{ grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6' }"
      >
        <UBlogPost
          v-for="product in items"
          :key="product.id"
          :title="product.title"
          :description="`${new Intl.NumberFormat('pt-AO').format(product.price)} AOA`"
          :image="product.images?.[0]?.url || 'placeholder.png'"
          :to="localeRoute({ name: 'product-slug', params: { slug: product.slug } })"
          :ui="{
            header: 'aspect-[4/5] object-cover',
            body: 'sm:p-3',
            title: 'line-clamp-2 overflow-hidden'
          }"
          variant="outline"
        />
      </UBlogPosts>

      <div
        v-if="pages > 1"
        class="mt-6 flex justify-center"
      >
        <UPagination
          v-model="page"
          :pageCount="pages"
          @update:model-value="setPage"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
