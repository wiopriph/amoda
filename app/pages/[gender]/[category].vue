<script setup lang="ts">
definePageMeta({ name: 'gender-category' });

const { t } = useI18n();
const route = useRoute();
const localeRoute = useLocaleRoute();

const limit = 24;
const page = computed(() => Math.max(1, Number(route.query.page || 1)));

const { data, error } = await useFetch('/api/catalog/list', {
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
});

if (error.value || !data.value) {
  throw createError({ statusCode: 404 });
}

const items = computed(() => data.value?.items || []);
const total = computed(() => data.value?.total || 0);
const pages = computed(() => Math.max(1, Math.ceil(total.value / limit)));

const titleText = computed(() => String(route.params.category).replaceAll('-', ' '));

const pageTitle = computed(() => `${titleText.value} | Amoda`);
const pageDescription = computed(() =>
  t('genderCategory.metaDescription', { category: titleText.value }),
);

const breadcrumbsUi = computed(() =>
  (data.value?.breadcrumbs || []).map(c => ({
    label: c.label,
    to: localeRoute(c.to),
  })),
);

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

const paginationTo = (page: number)  => ({ query: { page } });
</script>

<i18n lang="json">
{
  "pt": {
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
  <UPage>
    <template #left>
      <UPageAside>
        <SidebarCategories :gender="route.params.gender as string" />
      </UPageAside>
    </template>

    <UPageHeader
      :title="titleText"
      :description="t('genderCategory.metaDescription', { category: titleText })"
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
        {{ t('genderCategory.empty') }}
      </div>

      <UBlogPosts
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4"
      >
        <UBlogPost
          v-for="product in items"
          :key="product.id"
          :title="product.title"
          :description="`${new Intl.NumberFormat('pt-AO').format(product.price)} AOA`"
          :image="product.images?.[0]?.url || 'placeholder.png'"
          :to="localeRoute({ name: 'product-slug', params: { slug: product.slug } })"
          variant="outline"
          :ui="{
            header: 'aspect-[4/5] object-cover',
            body: 'sm:p-3',
            title: 'line-clamp-2 overflow-hidden'
          }"
        />
      </UBlogPosts>

      <div
        v-if="pages > 1"
        class="mt-8 flex justify-center"
      >
        <UPagination
          v-model="page"
          :itemsPerPage="limit"
          :total="total"
          :to="paginationTo"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
