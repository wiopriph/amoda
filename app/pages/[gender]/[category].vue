<script setup lang="ts">
definePageMeta({ name: 'gender-category' });

const { t } = useI18n();
const route = useRoute();
const localeRoute = useLocaleRoute();
const requestURL = useRequestURL();

const limit = 24;
const page = ref(Math.max(1, Number(route.query.page || 1)));

const { data, error } = await useFetch('/api/catalog/list', {
  query: {
    gender: route.params.gender,
    slug: route.params.category,
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

const products = computed(() => data.value!.items || []);
const total = computed(() => data.value!.total || 0);
const pages = computed(() => Math.max(1, Math.ceil(total.value / limit)));
const makePaginationTo = (pageNum: number) => ({ query: { page: pageNum } });

/** Категория всегда есть на этой странице */
const category = computed(() => data.value!.category);
const categoryTitle = computed(() => category.value?.name || '');

const breadcrumbItems = computed(() => (data.value!.breadcrumbs || []).map((c) => ({
  label: c.label,
  to: localeRoute(c.to),
})));

const genderHuman = computed(() => t(route.params.gender as string));

/** SEO */
const pageTitle = computed(() => t('genderCategory.seoTitle', {
  category: categoryTitle.value,
  gender: genderHuman.value,
}));
const pageDescription = computed(() => t('genderCategory.seoDescription', {
  category: categoryTitle.value,
  gender: genderHuman.value,
}));

useHead(() => ({
  title: `${pageTitle.value} | Amoda`,
  meta: [
    { name: 'description', content: pageDescription.value },
    { property: 'og:title', content: `${pageTitle.value} | Amoda` },
    { property: 'og:description', content: pageDescription.value },
    { property: 'twitter:title', content: `${pageTitle.value} | Amoda` },
    { property: 'twitter:description', content: pageDescription.value },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: (data.value!.breadcrumbs || []).map((bc: any, i: number) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: bc.label,
          item: new URL(localeRoute(bc.to)?.fullPath || '/', requestURL.origin).href,
        })),
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: pageTitle.value,
        numberOfItems: products.value.length,
        itemListOrder: 'http://schema.org/ItemListOrderAscending',
        itemListElement: products.value.map((p: any, i: number) => {
          const url = new URL(
            localeRoute({ name: 'product-slug', params: { slug: p.slug } })?.fullPath || '/',
            requestURL.origin,
          ).href;

          return {
            '@type': 'ListItem',
            position: i + 1,
            url,
            item: {
              '@type': 'Product',
              name: p.title,
              image: p.images?.[0]?.url || 'https://moda.ao/placeholder.png',
              brand: p.brand_name || undefined,
              offers: {
                '@type': 'Offer',
                url,
                priceCurrency: 'AOA',
                price: p.price || 0,
                availability: 'https://schema.org/InStock',
              },
            },
          };
        }),
      }),
    },
  ],
}));
</script>


<i18n lang="json">
{
  "pt": {
    "women": "Mulheres",
    "men": "Homens",
    "kids": "Crianças",
    "genderCategory": {
      "empty": "Não há produtos nesta categoria ainda.",
      "seoTitle": "{category} — {gender} | Moda online em Angola",
      "seoDescription": "Compre {category} para {gender} na Amoda: roupas, calçado e acessórios com entrega gratuita em Luanda. Encomende online, experimente no ponto e pague apenas se gostar."
    }
  },
  "en": {
    "women": "Women",
    "men": "Men",
    "kids": "Kids",
    "genderCategory": {
      "empty": "No products found in this category yet.",
      "seoTitle": "{category} — {gender} | Online fashion in Angola",
      "seoDescription": "Shop {category} for {gender} at Amoda: apparel, shoes and accessories with free delivery in Luanda. Order online, try at pickup and pay only if you love it."
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
      :title="categoryTitle"
      :description="t('genderCategory.seoDescription', { category: categoryTitle, gender: genderHuman })"
      :ui="{ title: 'text-xl md:text-2xl font-semibold' }"
    >
      <template #headline>
        <UBreadcrumb :items="breadcrumbItems" />
      </template>
    </UPageHeader>

    <UPageBody>
      <div
        v-if="!products.length"
        class="text-gray-500 text-sm"
      >
        {{ t('genderCategory.empty') }}
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
        class="mt-8 flex justify-center"
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
