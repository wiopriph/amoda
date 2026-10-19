<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';
import type { CatalogProductCard } from '#shared/types/catalog';
import { pricePresetToQuery } from '#shared/constants/priceFilters';


definePageMeta({ name: 'products' });

const route = useRoute();
const router = useRouter();
const requestUrl = useRequestURL();

const PRODUCTS_PER_PAGE = 20;

const page = computed(() => Math.max(1, Number(route.query.page || 1)));

const {
  appliedFilters,
  activeFilterCount,
  isFilterOpen,
  applyFilters,
  activeChips,
  removeChip,
  clearAllFilters,
} = useCatalogFilters();

const { data: catalogResponse, pending: isCatalogPending } = useFetch('/api/catalog/list', {
  query: {
    page,
    sort: computed(() => route.query.sort),
    size: computed(() => route.query.size),
    color: computed(() => route.query.cor),
    'min_price': computed(() => pricePresetToQuery(route.query.preco as string).min_price),
    'max_price': computed(() => pricePresetToQuery(route.query.preco as string).max_price),
    limit: PRODUCTS_PER_PAGE,
  },
  watch: [() => route.fullPath],
});

const { data: facets } = useFetch('/api/catalog/facets');
const { data: categoriesResponse } = await useFetch('/api/categories/list');

const categoriesNavigation = computed(() => ({
  items: (categoriesResponse.value || [])
    .filter((category: any) => category.parent_id)
    .map((category: any) => ({
      slug: category.slug,
      name: category.name,
      image: category.image,
      active: false,
    })),
}));

const products = computed(() => catalogResponse.value?.items || []);
const totalProducts = computed(() => catalogResponse.value?.total || 0);
const productSkeletons = Array.from({ length: 10 }, (_, index) => index);

const getPaginationTo = (pageNumber: number) => ({
  query: {
    ...route.query,
    page: pageNumber === 1 ? undefined : pageNumber,
  },
});

const { trackSelectItem } = useAnalyticsEvent();

const trackProductSelect = (product: CatalogProductCard) => {
  const variantId = Number(product.default_variant_id);
  const sizeId = Number(product.default_size_id);

  if (!variantId || !sizeId) {
    return;
  }

  trackSelectItem({
    listId: 'all_products',
    listName: 'All products',
    items: [
      makeGa4Item({
        productId: product.id,
        name: product.title,
        brand: product.brand_name ?? undefined,
        price: product.price ?? 0,
        quantity: 1,
        variantId,
        sizeId,
        variantLabel: product.default_variant_color ?? undefined,
        sizeLabel: product.default_size_label ?? undefined,
      }),
    ],
  });
};

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => 'Olá! Preciso de ajuda para escolher peças na Amoda.');

const title = 'Todos os Produtos | Roupa Feminina em Luanda — Amoda';
const description = 'Vê todas as peças da Amoda em Luanda: vestidos, blusas, conjuntos e mais. Escolhe online, experimenta primeiro e paga só o que gostar.';

// Пагинация self-canonical (как в категориях), фильтры отброшены
const canonicalUrl = computed(() => {
  const pageNumber = page.value;
  const path = router.resolve({
    name: 'products',
    query: pageNumber > 1 ? { page: pageNumber } : {},
  }).fullPath;

  return new URL(path, requestUrl.origin).href;
});

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
  ],
}));
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto mt-4 max-w-6xl sm:mt-8 sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8"
      >
        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          Todos os produtos
        </h1>

        <p class="mt-3 text-sm leading-6 text-muted sm:text-base">
          Todas as peças disponíveis para experimentar. Escolhe sem pagar agora e leva só o que gostares.
        </p>

        <CategoryPills
          v-if="categoriesNavigation.items.length"
          :navigation="categoriesNavigation"
          class="mt-4 sm:mt-5"
        />
      </section>

      <CatalogFilterBar
        :activeFilterCount="activeFilterCount"
        :activeChips="activeChips"
        class="mt-5"
        @open="isFilterOpen = true"
        @remove-chip="removeChip"
        @clear-all="clearAllFilters"
      />

      <CatalogFilterSheet
        v-model:open="isFilterOpen"
        :facets="facets"
        :applied="appliedFilters"
        @apply="applyFilters"
      />

      <section
        v-if="isCatalogPending"
        class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4"
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

            <USkeleton class="h-5 w-24" />
          </div>
        </UCard>
      </section>

      <UEmpty
        v-else-if="!products.length"
        class="mt-6"
        icon="i-lucide-shirt"
        title="Nenhum produto encontrado."
        description="Tente limpar os filtros ou fale connosco — podemos ajudar a encontrar."
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
            variant="soft"
          >
            Voltar ao início
          </UButton>
        </template>
      </UEmpty>

      <section
        v-else
        class="mt-6"
      >
        <p class="text-sm text-muted">
          {{ totalProducts }} {{ totalProducts === 1 ? 'produto' : 'produtos' }}
        </p>

        <UBlogPosts
          class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4"
        >
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            @select="trackProductSelect(product)"
          />
        </UBlogPosts>

        <div
          v-if="totalProducts > PRODUCTS_PER_PAGE"
          class="mt-8 flex justify-center"
        >
          <UPagination
            :page="page"
            :itemsPerPage="PRODUCTS_PER_PAGE"
            :total="totalProducts"
            :to="getPaginationTo"
          />
        </div>
      </section>
    </UPageBody>

    <WhatsappButton
      :to="whatsappHref"
      aria-label="Falar com a Amoda no WhatsApp"
    />
  </UPage>
</template>
