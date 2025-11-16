<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import type { AnalyticsProduct } from '~/composables/useAnalyticsEvent';


definePageMeta({ name: 'category-slug' });

const route = useRoute();
const localeRoute = useLocaleRoute();

const limit = 24;
const page = ref(Math.max(1, Number(route.query.page || 1)));

const { data, error } = await useFetch('/api/catalog/list', {
  query: {
    slug: route.params.slug,
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


const category = computed(() => data.value!.category);
const categoryTitle = computed(() => category.value?.name || '');

const breadcrumbItems = computed(() => (data.value!.breadcrumbs || []).map((c) => ({
  label: c.label,
  to: localeRoute(c.to),
})));


/** АНАЛИТИКА */
const { trackViewItemList, trackSelectItem } = useAnalyticsEvent();


if (import.meta.client) {
  watch(
    () => route.fullPath,
    () => {
      if (!import.meta.client) {
        return;
      }

      const items = products.value.map((p: any): AnalyticsProduct => ({
        id: p.id,
        name: p.title,
        price: p.price,
        brand: p.brand_name,
        categoryId: p.primary_category_id,
      }));

      trackViewItemList({
        categoryId: category.value?.id,
        categoryName: categoryTitle.value,
        items,
        itemsCount: items.length,
      });
    },
    { immediate: true },
  );
}

const sendSelectProductEvent = (product: any) => {
  trackSelectItem({
    itemId: product.id,
    itemName: product.title,
    price: product.price,
    categoryId: product.primary_category_id,
  });
};

/** SEO */
const { t } = useI18n();
const requestURL = useRequestURL();

const pageTitle = computed(() => t('category.seoTitle', { category: categoryTitle.value }));
const pageDescription = computed(() => t('category.seoDescription', { category: categoryTitle.value }));

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
        itemListElement: (data.value!.breadcrumbs || []).map(
          (bc: any, i: number) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: bc.label,
            item: new URL(
              localeRoute(bc.to)?.fullPath || '/',
              requestURL.origin,
            ).href,
          }),
        ),
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
            localeRoute({ name: 'product-slug', params: { slug: p.slug } })
              ?.fullPath || '/',
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
    "category": {
      "empty": "Não há produtos nesta categoria ainda.",
      "seoTitle": "{category} | Moda online em Angola",
      "seoDescription": "Compre {category} na Amoda: roupas, calçado e acessórios com entrega gratuita em Luanda. Encomende online, experimente no ponto e pague apenas se gostar."
    }
  },
  "en": {
    "category": {
      "empty": "No products found in this category yet.",
      "seoTitle": "{category} | Online fashion in Angola",
      "seoDescription": "Shop {category} at Amoda: apparel, shoes and accessories with free delivery in Luanda. Order online, try at pickup and pay only if you love it."
    }
  }
}
</i18n>

<template>
  <UPage>
    <template #left>
      <UPageAside>
        <SidebarCategories />
      </UPageAside>
    </template>

    <UPageHeader
      :title="categoryTitle"
      :description="pageDescription"
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
        {{ t('category.empty') }}
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
          @click="sendSelectProductEvent(product)"
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
