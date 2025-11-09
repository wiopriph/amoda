<script setup lang="ts">
definePageMeta({ name: 'gender' });

const { t } = useI18n();
const route = useRoute();
const localeRoute = useLocaleRoute();
const requestURL = useRequestURL();

const limit = 24;
const page = ref(Math.max(1, Number(route.query.page || 1)));

const { data, error } = await useFetch('/api/catalog/list', {
  query: {
    gender: route.params.gender,
    page,
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

const products = computed(() => data.value?.items || []);
const total = computed(() => data.value?.total || 0);
const pages = computed(() => Math.max(1, Math.ceil(total.value / limit)));
const makePaginationTo = (pageNum: number) => ({ query: { page: pageNum } });

const humanGender = computed(() => t(route.params.gender as string));

const pageTitle = computed(() => `${t('gender.seoTitle', { gender: humanGender.value })} | Amoda`);
const pageDescription = computed(() => t('gender.seoDescription', { gender: humanGender.value }));

const breadcrumbsUi = computed(() =>
  (data.value?.breadcrumbs || []).map(b => ({
    label: b.label,
    to: localeRoute(b.to),
  })),
);

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

const itemListJsonLd = computed(() => {
  const baseUrl = requestURL.origin;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageTitle.value,
    itemListOrder: 'http://schema.org/ItemListOrderAscending',
    numberOfItems: products.value.length,
    itemListElement: products.value.map((p: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: new URL(localeRoute({ name: 'product-slug', params: { slug: p.slug } })?.fullPath || '/', baseUrl).href,
      item: {
        '@type': 'Product',
        name: p.title,
        image: p.images?.[0]?.url || 'https://moda.ao/placeholder.png',
        brand: p.brand_name || undefined,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'AOA',
          price: p.price || 0,
          availability: 'https://schema.org/InStock',
          url: new URL(localeRoute({ name: 'product-slug', params: { slug: p.slug } })?.fullPath || '/', baseUrl).href,
        },
      },
    })),
  };
});

useHead(() => ({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: pageDescription.value },
    { property: 'og:title', content: pageTitle.value },
    { property: 'og:description', content: pageDescription.value },
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbJsonLd.value) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(itemListJsonLd.value) },
  ],
}));
</script>

<i18n lang="json">
{
  "pt": {
    "women": "Mulheres",
    "men": "Homens",
    "kids": "Crianças",
    "gender": {
      "searchPlaceholder": "Pesquisar roupas, sapatos e acessórios…",
      "empty": "Não há produtos nesta seleção ainda.",
      "seoTitle": "Moda {gender} em Angola — comprar online com entrega gratuita",
      "seoDescription": "Explore {gender} na Amoda: roupas, calçado e acessórios com entrega gratuita em Luanda. Encomende online, experimente no ponto e pague apenas se gostar.",
      "filters": "Filtros"
    }
  },
  "en": {
    "women": "Women",
    "men": "Men",
    "kids": "Kids",
    "gender": {
      "searchPlaceholder": "Search clothes, shoes and accessories…",
      "empty": "No products found here yet.",
      "seoTitle": "{gender} fashion in Angola — buy online with free delivery",
      "seoDescription": "Shop {gender} at Amoda: apparel, shoes and accessories with free delivery in Luanda. Order online, try at pickup and pay only if you love it.",
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
      :title="humanGender"
      :description="t('gender.seoDescription', { gender: humanGender })"
      :ui="{ title: 'text-xl md:text-2xl font-semibold' }"
    >
      <template #headline>
        <UBreadcrumb :items="breadcrumbsUi" />
      </template>
    </UPageHeader>

    <UPageBody>
      <div
        v-if="!products.length"
        class="text-gray-500 text-sm"
      >
        {{ t('gender.empty') }}
      </div>

      <UBlogPosts
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4"
      >
        <UBlogPost
          v-for="product in products"
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
          v-model:page="page"
          :itemsPerPage="limit"
          :total="total"
          :to="makePaginationTo"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
