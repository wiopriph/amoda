<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';
import { sanitizeHtml } from '~/utils/sanitizeHtml';
import { CURRENCY } from '~/constants/currency';
import type { CatalogProductCard } from '#shared/types/catalog';
import { pricePresetToQuery } from '#shared/constants/priceFilters';


definePageMeta({ name: 'category-slug' });

const route = useRoute();
const page = ref(Math.max(1, Number(route.query.page || 1)));
const productsSection = ref<HTMLElement | null>(null);
const PRODUCTS_PER_PAGE = 20;

const {
  appliedFilters,
  activeFilterCount,
  isFilterOpen,
  applyFilters,
  activeChips,
  removeChip,
  clearAllFilters,
} = useCatalogFilters(() => {
  page.value = 1; 
});

// Stable reference — an inline object literal in the template would be
// recreated on every render and falsely trigger the sheet's count refetch
const filterBaseQuery = computed(() => ({ slug: route.params.slug }));

const [
  {
    data: catalogResponse,
    error: catalogError,
    pending: isCatalogPending,
  },
  { data: categoryNavigation },
  { data: facets },
] = await Promise.all([
  useFetch('/api/catalog/list', {
    query: {
      slug: route.params.slug,
      page,
      q: computed(() => route.query.q),
      sort: computed(() => route.query.sort),
      size: computed(() => route.query.size),
      color: computed(() => route.query.cor),
      min_price: computed(() => pricePresetToQuery(route.query.preco as string).min_price),
      max_price: computed(() => pricePresetToQuery(route.query.preco as string).max_price),
      limit: PRODUCTS_PER_PAGE,
    },
    watch: [() => route.fullPath],
  }),
  useFetch('/api/catalog/category-navigation', {
    query: { slug: route.params.slug },
    watch: [() => route.fullPath],
  }),
  useFetch('/api/catalog/facets', {
    query: { slug: route.params.slug },
    watch: [() => route.params.slug],
  }),
]);

const router = useRouter();

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

const breadcrumbItems = computed(() => (catalogResponse.value!.breadcrumbs || []).map((breadcrumb) => ({
  label: breadcrumb.label,
  to: breadcrumb.to,
})));

const { trackViewItemList, trackSelectItem } = useAnalyticsEvent();

const mapProductToGa4Item = (product: CatalogProductCard, index?: number) => {
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
        .map((product, productIndex) => mapProductToGa4Item(product, productIndex + 1))
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

const trackProductSelect = (product: CatalogProductCard) => {
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

const requestUrl = useRequestURL();

const title = computed(() => category.value?.seo_title || `${categoryTitle.value} em Luanda | Amoda`);
const description = computed(() => category.value?.seo_description || `Encontra ${categoryTitle.value} na Amoda em Luanda. Escolhe online sem pagar, experimenta primeiro e leva apenas o que gostares.`);
const ogImage = computed(() => category.value?.image || 'https://amoda.ao/logo.webp');
// category images are cropped to 400×400 on upload; the logo fallback is 2048×2048
const ogImageSize = computed(() => category.value?.image ? '400' : '2048');
const canonicalUrl = computed(() => {
  // Paginated pages are self-canonical so Google indexes products beyond page 1;
  // filter/sort params are intentionally dropped
  const pageNumber = Math.max(1, Number(route.query.page || 1));
  const path = router.resolve({
    name: 'category-slug',
    params: { slug: route.params.slug },
    query: pageNumber > 1 ? { page: pageNumber } : {},
  }).fullPath;

  return new URL(path, requestUrl.origin).href;
});

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: (catalogResponse.value!.breadcrumbs || []).map((breadcrumb, breadcrumbIndex) => ({
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
  itemListElement: categoryProducts.value.map((product, productIndex) => {
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
    { property: 'og:image:width', content: ogImageSize.value },
    { property: 'og:image:height', content: ogImageSize.value },
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
    <UPageBody class="mx-auto mt-4 max-w-6xl space-y-5 sm:mt-8 sm:space-y-12 sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-4 shadow-sm sm:p-8"
      >
        <!-- Крошки видны и на мобиле: направление «вверх» по дереву, чипы ниже — «вглубь» -->
        <nav
          v-if="breadcrumbItems.length > 1"
          aria-label="Breadcrumb"
          class="-mx-1 flex items-center gap-1 overflow-x-auto whitespace-nowrap px-1 text-xs text-dimmed [-ms-overflow-style:none] [scrollbar-width:none] sm:text-sm [&::-webkit-scrollbar]:hidden"
        >
          <template
            v-for="(breadcrumbItem, breadcrumbIndex) in breadcrumbItems"
            :key="breadcrumbItem.label"
          >
            <span
              v-if="breadcrumbIndex === breadcrumbItems.length - 1"
              aria-current="page"
              class="font-semibold text-highlighted"
              v-text="breadcrumbItem.label"
            />

            <NuxtLink
              v-else
              :to="breadcrumbItem.to"
              class="transition hover:text-primary"
            >
              {{ breadcrumbItem.label }}
            </NuxtLink>

            <UIcon
              v-if="breadcrumbIndex < breadcrumbItems.length - 1"
              name="i-lucide-chevron-right"
              class="size-3.5 shrink-0 text-gray-300"
            />
          </template>
        </nav>

        <div class="mt-3 sm:mt-4">
          <h1
            class="text-2xl font-black tracking-tight text-highlighted sm:text-5xl"
            v-text="categoryH1"
          />

          <p
            class="mt-2 line-clamp-2 text-sm leading-6 text-muted sm:mt-4 sm:line-clamp-none sm:text-lg sm:leading-7"
            v-text="description"
          />
        </div>

        <div
          v-if="categoryNavigation?.items?.length"
          class="mt-4 sm:mt-5"
        >
          <CategoryPills :navigation="categoryNavigation" />
        </div>
      </section>

      <CatalogFilterBar
        :activeFilterCount="activeFilterCount"
        :activeChips="activeChips"
        :total="isCatalogPending ? null : totalProducts"
        @open="isFilterOpen = true"
        @remove-chip="removeChip"
        @clear-all="clearAllFilters"
      />

      <CatalogFilterSheet
        v-model:open="isFilterOpen"
        :facets="facets"
        :applied="appliedFilters"
        :baseQuery="filterBaseQuery"
        @apply="applyFilters"
      />

      <UEmpty
        v-if="!isCatalogPending && !categoryProducts.length"
        class="mt-6"
        title="Ainda não há itens nesta categoria."
        description="Nenhum produto com estes filtros. Tente outro tamanho ou veja outras categorias."
      >
        <template #actions>
          <UButton
            v-if="activeFilterCount"
            color="primary"
            variant="soft"
            @click="clearAllFilters"
          >
            Limpar filtros
          </UButton>

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
        class="mt-6 scroll-mt-40"
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
          <ProductCard
            v-for="categoryProduct in categoryProducts"
            :key="categoryProduct.id"
            :product="categoryProduct"
            @select="trackProductSelect(categoryProduct)"
          />
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
        v-html="sanitizeHtml(category.seo_content)"
      />
    </UPageBody>

    <WhatsappButton
      :to="whatsappHref"
      aria-label="Falar com a Amoda no WhatsApp"
    />
  </UPage>
</template>
