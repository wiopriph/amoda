<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'category-slug' });

const route = useRoute();
const localeRoute = useLocaleRoute();

const limit = 24;
const page = ref(Math.max(1, Number(route.query.page || 1)));

const [
  { data, error },
  { data: navigation },
] = await Promise.all([
  useFetch('/api/catalog/list', {
    query: {
      slug: route.params.slug,
      page,
      q: route.query.q,
      sort: route.query.sort,
    },
    watch: [() => route.fullPath],
  }),
  useFetch('/api/catalog/category-navigation', {
    query: { slug: route.params.slug },
    watch: [() => route.fullPath],
  }),
]);

if (error.value || !data.value) {
  throw createError({ statusCode: 404 });
}

const products = computed(() => data.value!.items || []);
const total = computed(() => data.value!.total || 0);
const pages = computed(() => Math.max(1, Math.ceil(total.value / limit)));
const makePaginationTo = (pageNum: number) => ({ query: { page: pageNum } });


const category = computed(() => data.value!.category);
const categoryTitle = computed(() => category.value?.name || '');

const breadcrumbItems = computed(() => (data.value!.breadcrumbs || []).map((c: any) => ({
  label: c.label,
  to: localeRoute(c.to),
})));

/** АНАЛИТИКА (GA4 ecommerce) */
const { trackViewItemList, trackSelectItem } = useAnalyticsEvent();

const mapProductToGa4Item = (p: any, index?: number) => {
  const variantId = Number(p.default_variant_id);
  const sizeId = Number(p.default_size_id);

  if (!variantId || !sizeId) {
    return null;
  }

  return makeGa4Item({
    productId: p.id,
    name: p.title,
    brand: p.brand_name ?? undefined,
    price: p.price ?? 0,
    quantity: 1,
    variantId,
    sizeId,
    variantLabel: p.default_variant_color ?? undefined,
    sizeLabel: p.default_size_label ?? undefined,
    categoryName: p.primary_category_id ? String(p.primary_category_id) : undefined,
    index,
  });
};

if (import.meta.client) {
  watch(
    () => route.fullPath,
    () => {
      const ga4Items = products.value
        .map((p: any, i: number) => mapProductToGa4Item(p, i + 1))
        .filter(Boolean);

      trackViewItemList({
        listId: category.value?.id ? String(category.value.id) : '',
        listName: categoryTitle.value || '',
        items: ga4Items as any,
      });
    },
    { immediate: true },
  );
}

const sendSelectProductEvent = (product: any) => {
  const item = mapProductToGa4Item(product);

  if (!item) {
    return;
  }

  trackSelectItem({
    listId: category.value?.id ? String(category.value.id) : undefined,
    listName: categoryTitle.value || undefined,
    items: [item],
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
              image: p.image || 'https://amoda.ao/placeholder.webp',
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
      "empty": "Ainda não há itens nesta categoria.",
      "emptyDescription": "Veja outras categorias ou use a pesquisa — você pode reservar e experimentar no ponto (sem pagamento online).",
      "seoTitle": "{category} | Reserve e experimente em Angola",
      "seoDescription": "Veja {category} na Amoda: roupa, calçado e acessórios. Reserve online sem pagamento, escolha o ponto e venha experimentar. Você decide na hora."
    }
  },
  "en": {
    "category": {
      "empty": "No items in this category yet.",
      "emptyDescription": "Browse other categories or use search — you can reserve and try on at the point (no online payment).",
      "seoTitle": "{category} | Reserve & try on in Angola",
      "seoDescription": "Explore {category} at Amoda: apparel, shoes and accessories. Reserve online with no payment, choose a point, and come try on. Decide on the spot."
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
        <div class="space-y-5">
          <UBreadcrumb
            :items="breadcrumbItems"
            class="hidden md:block"
          />

          <CategoriesPills :list="navigation" />
        </div>
      </template>
    </UPageHeader>

    <UPageBody>
      <UEmpty
        v-if="!products.length"
        :title="t('category.empty')"
        :description="t('category.emptyDescription')"
      />

      <UBlogPosts
        v-else
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4"
      >
        <UBlogPost
          v-for="product in products"
          :key="product.id"
          :title="product.title"
          :description="`${new Intl.NumberFormat('pt-AO').format(product.price)} AOA`"
          :image="product.image || 'placeholder.webp'"
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
