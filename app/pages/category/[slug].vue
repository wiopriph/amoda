<script setup lang="ts">
import { getProductBadgeColor, getProductBadgeLabel } from '~/utils/productBadges';
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { formatPrice } from '~/utils/formatPrice';
import { makeGa4Item } from '~/utils/ga4';
import { CURRENCY } from '~/constants/currency';


definePageMeta({ name: 'category-slug' });

const route = useRoute();
const page = ref(Math.max(1, Number(route.query.page || 1)));
const productsSection = ref<HTMLElement | null>(null);
const PRODUCTS_PER_PAGE = 20;

const [
  {
    data: catalogResponse,
    error: catalogError,
    pending: isCatalogPending,
  },
  { data: categoryNavigation },
] = await Promise.all([
  useFetch('/api/catalog/list', {
    query: {
      slug: route.params.slug,
      page,
      q: route.query.q,
      sort: route.query.sort,
      limit: PRODUCTS_PER_PAGE,
    },
    watch: [() => route.fullPath],
  }),
  useFetch('/api/catalog/category-navigation', {
    query: { slug: route.params.slug },
    watch: [() => route.fullPath],
  }),
]);

if (catalogError.value || !catalogResponse.value) {
  throw createError({ statusCode: 404 });
}

const totalProducts = computed(() => catalogResponse.value!.total || 0);
const pageCount = computed(() => Math.max(1, Math.ceil(totalProducts.value / PRODUCTS_PER_PAGE)));
const productSkeletons = Array.from({ length: PRODUCTS_PER_PAGE }, (_, index) => index);

const getPaginationTo = (pageNumber: number) => ({
  query: {
    ...route.query,
    page: pageNumber === 1 ? undefined : pageNumber,
  },
});

if (import.meta.client) {
  watch(
    () => route.query.page,
    async () => {
      await nextTick();
      productsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  );
}

const category = computed(() => catalogResponse.value!.category);
const categoryTitle = computed(() => category.value?.name || '');
const categoryH1 = computed(() => category.value?.h1_override || categoryTitle.value);
const categoryProducts = computed(() => catalogResponse.value!.items || []);

const breadcrumbItems = computed(() => (catalogResponse.value!.breadcrumbs || []).map((breadcrumb: any) => ({
  label: breadcrumb.label,
  to: breadcrumb.to,
})));

const { trackViewItemList, trackSelectItem } = useAnalyticsEvent();

const mapProductToGa4Item = (product: any, index?: number) => {
  const variantId = Number(product.default_variant_id);
  const sizeId = Number(product.default_size_id);

  if (!variantId || !sizeId) {
    return null;
  }

  return makeGa4Item({
    productId: product.id,
    name: product.title,
    brand: product.brand_name ?? undefined,
    price: product.price ?? 0,
    quantity: 1,
    variantId,
    sizeId,
    variantLabel: product.default_variant_color ?? undefined,
    sizeLabel: product.default_size_label ?? undefined,
    categoryName: product.primary_category_id ? String(product.primary_category_id) : undefined,
    index,
  });
};

if (import.meta.client) {
  watch(
    () => route.fullPath,
    () => {
      const ga4Items = categoryProducts.value
        .map((product: any, productIndex: number) => mapProductToGa4Item(product, productIndex + 1))
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

const trackProductSelect = (product: any) => {
  const ga4Item = mapProductToGa4Item(product);

  if (!ga4Item) {
    return;
  }

  trackSelectItem({
    listId: category.value?.id ? String(category.value.id) : undefined,
    listName: categoryTitle.value || undefined,
    items: [ga4Item],
  });
};

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => `Olá! Preciso de ajuda com a categoria ${categoryTitle.value} na Amoda.`);

const router = useRouter();
const requestUrl = useRequestURL();

const title = computed(() => category.value?.seo_title || `${categoryTitle.value} em Luanda | Escolha e experimente antes de pagar`);
const description = computed(() => category.value?.seo_description || `Encontre ${categoryTitle.value} na Amoda em Luanda. Escolha online sem pagar, experimente primeiro e leve apenas o que gostar.`);
const ogImage = computed(() => category.value?.image || 'https://amoda.ao/logo.webp');
const canonicalUrl = computed(() => {
  const path = router.resolve({ name: 'category-slug', params: { slug: route.params.slug } }).fullPath;

  return new URL(path, requestUrl.origin).href;
});

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: (catalogResponse.value!.breadcrumbs || []).map((breadcrumb: any, breadcrumbIndex: number) => ({
    '@type': 'ListItem',
    position: breadcrumbIndex + 1,
    name: breadcrumb.label,
    item: new URL(router.resolve(breadcrumb.to).fullPath || '/', requestUrl.origin).href,
  })),
}));

const itemListSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: title.value,
  numberOfItems: categoryProducts.value.length,
  itemListOrder: 'http://schema.org/ItemListOrderAscending',
  itemListElement: categoryProducts.value.map((product: any, productIndex: number) => {
    const productUrl = new URL(
      router.resolve({ name: 'product-slug', params: { slug: product.slug } }).fullPath || '/',
      requestUrl.origin,
    ).href;

    return {
      '@type': 'ListItem',
      position: productIndex + 1,
      url: productUrl,
      item: {
        '@type': 'Product',
        name: product.title,
        image: product.image || 'https://amoda.ao/placeholder.webp',
        brand: product.brand_name || undefined,
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: CURRENCY,
          price: product.price || 0,
          availability: 'https://schema.org/InStock',
        },
      },
    };
  }),
}));

useHead(() => ({
  title: title.value,
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
    { property: 'og:image', content: ogImage.value },
    { property: 'og:image:alt', content: categoryTitle.value },
    { name: 'twitter:title', content: title.value },
    { name: 'twitter:description', content: description.value },
    { name: 'twitter:image', content: ogImage.value },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema.value) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(itemListSchema.value) },
  ],
}));
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-6xl sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8"
      >
        <UBreadcrumb
          :items="breadcrumbItems"
          class="hidden md:block"
        />

        <div class="mt-0 md:mt-5">
          <UBadge
            color="primary"
            variant="soft"
          >
            {{ `${totalProducts} produtos disponíveis` }}
          </UBadge>

          <h1
            class="mt-4 text-3xl font-black tracking-tight text-highlighted sm:text-5xl"
            v-text="categoryH1"
          />

          <p
            class="mt-4 text-base leading-7 text-muted sm:text-lg"
            v-text="description"
          />
        </div>

        <div
          v-if="categoryNavigation?.length"
          class="mt-5"
        >
          <CategoryPills :list="categoryNavigation" />
        </div>
      </section>

      <UEmpty
        v-if="!isCatalogPending && !categoryProducts.length"
        class="mt-6"
        title="Ainda não há itens nesta categoria."
        description="Veja outras categorias ou volte em breve. Você pode escolher online, experimentar primeiro e pagar apenas pelo que gostar."
      >
        <template #actions>
          <UButton
            :to="{ name: 'index' }"
            color="primary"
          >
            Ver categorias
          </UButton>
        </template>
      </UEmpty>

      <section
        v-else
        ref="productsSection"
        class="mt-6 scroll-mt-24"
      >
        <div
          v-if="isCatalogPending"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4"
        >
          <UCard
            v-for="skeletonIndex in productSkeletons"
            :key="skeletonIndex"
            :ui="{ body: 'sm:p-3' }"
            class="overflow-hidden border border-gray-100"
          >
            <USkeleton class="aspect-[4/5] w-full rounded-t-lg" />

            <div class="space-y-3 pt-3">
              <USkeleton class="h-4 w-full" />

              <USkeleton class="h-4 w-4/5" />

              <USkeleton class="h-5 w-24" />
            </div>
          </UCard>
        </div>

        <UBlogPosts
          v-else
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4"
        >
          <UBlogPost
            v-for="categoryProduct in categoryProducts"
            :key="categoryProduct.id"
            :title="categoryProduct.title"
            :description="formatPrice(categoryProduct.price)"
            :image="categoryProduct.image || '/placeholder.webp'"
            :to="{ name: 'product-slug', params: { slug: categoryProduct.slug } }"
            :ui="{
              root: 'group overflow-hidden border border-gray-100 rounded-2xl hover:shadow-md transition',
              header: 'aspect-[4/5] overflow-hidden bg-gray-50',
              image: 'h-full w-full object-cover transition duration-300 group-hover:scale-105',
              body: 'sm:p-3',
              title: 'text-sm font-semibold text-highlighted line-clamp-2 min-h-[40px]',
              description: 'mt-2 text-sm font-bold text-primary'
            }"
            variant="outline"
            @click="trackProductSelect(categoryProduct)"
          >
            <template #badge>
              <div
                v-if="categoryProduct.badges?.length"
                class="absolute left-2 top-2 flex flex-wrap gap-1"
              >
                <UBadge
                  v-for="badge in categoryProduct.badges"
                  :key="badge"
                  :color="getProductBadgeColor(badge)"
                  variant="solid"
                >
                  {{ getProductBadgeLabel(badge) }}
                </UBadge>
              </div>
            </template>
          </UBlogPost>
        </UBlogPosts>

        <div
          v-if="pageCount > 1"
          class="mt-8 flex justify-center"
          :class="{ 'pointer-events-none opacity-60': isCatalogPending }"
        >
          <UPagination
            v-model:page="page"
            :itemsPerPage="PRODUCTS_PER_PAGE"
            :total="totalProducts"
            :to="getPaginationTo"
          />
        </div>
      </section>

      <section
        v-if="category?.seo_content"
        class="mt-10 rounded-2xl border border-gray-100 bg-gray-50 px-6 py-8 text-sm leading-7 text-muted prose prose-sm max-w-none"
        v-html="category.seo_content"
      />
    </UPageBody>

    <WhatsappButton
      :to="whatsappHref"
      aria-label="Falar com a Amoda no WhatsApp"
    />
  </UPage>
</template>
