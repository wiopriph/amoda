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
      "count": "{count} produtos disponíveis",
      "empty": "Ainda não há itens nesta categoria.",
      "emptyDescription": "Veja outras categorias ou volte em breve. Você pode reservar online, experimentar primeiro e pagar apenas pelo que gostar.",
      "allCategories": "Ver categorias",
      "newBadge": "NOVO",
      "seoTitle": "{category} | Experimente antes de pagar",
      "seoDescription": "Veja {category} na Amoda. Reserve online sem pagamento, experimente antes e pague apenas pelo que gostar."
    }
  },
  "en": {
    "category": {
      "count": "{count} products available",
      "empty": "No items in this category yet.",
      "emptyDescription": "Browse other categories or come back soon. You can reserve online, try first, and pay only for what you like.",
      "allCategories": "View categories",
      "newBadge": "NEW",
      "seoTitle": "{category} | Try before you pay",
      "seoDescription": "Explore {category} at Amoda. Reserve online with no payment, try first, and pay only for what you like."
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody>
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <UBreadcrumb
          :items="breadcrumbItems"
          class="hidden md:block"
        />

        <div class="mt-0 md:mt-5">
          <UBadge
            color="primary"
            variant="soft"
          >
            {{ t('category.count', { count: total }) }}
          </UBadge>

          <h1 class="mt-4 text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
            {{ categoryTitle }}
          </h1>

          <p class="mt-4 text-base leading-7 text-muted sm:text-lg">
            {{ pageDescription }}
          </p>
        </div>

        <div
          v-if="navigation?.length"
          class="mt-5"
        >
          <CategoriesPills :list="navigation" />
        </div>
      </section>

      <UEmpty
        v-if="!products.length"
        class="mt-6"
        :title="t('category.empty')"
        :description="t('category.emptyDescription')"
      >
        <template #actions>
          <UButton
            :to="localeRoute({ name: 'index' })"
            color="primary"
          >
            {{ t('category.allCategories') }}
          </UButton>
        </template>
      </UEmpty>

      <section
        v-else
        class="mt-6"
      >
        <UBlogPosts class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4">
          <UBlogPost
            v-for="(product, index) in products"
            :key="product.id"
            :title="product.title"
            :description="`${new Intl.NumberFormat('pt-AO').format(product.price)} AOA`"
            :image="product.image || 'placeholder.webp'"
            :to="localeRoute({ name: 'product-slug', params: { slug: product.slug } })"
            :ui="{
              root: 'group overflow-hidden border border-gray-100 rounded-2xl hover:shadow-md transition',
              header: 'aspect-[4/5] overflow-hidden bg-gray-50',
              image: 'h-full w-full object-cover transition duration-300 group-hover:scale-105',
              body: 'sm:p-3',
              title: 'text-sm font-semibold text-highlighted line-clamp-2 min-h-[40px]',
              description: 'mt-2 text-sm font-bold text-primary'
            }"
            variant="outline"
            @click="sendSelectProductEvent(product)"
          >
            <template #badge>
              <UBadge
                v-if="index < 3"
                color="primary"
                variant="solid"
                class="absolute left-2 top-2"
              >
                {{ t('category.newBadge') }}
              </UBadge>
            </template>
          </UBlogPost>
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
      </section>
    </UPageBody>
  </UPage>
</template>
