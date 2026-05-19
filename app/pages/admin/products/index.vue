<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { formatPrice } from '~/utils/formatPrice';


definePageMeta({
  name: 'admin-products',
  layout: 'admin',
  middleware: 'admin',
});

const title = 'Produtos';
const description = 'Navegue, pesquise e visualize variantes';

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

type VariantImage = { url: string };
type VariantSize = { id: number; size: string; stock?: number | null };
type Variant = {
  id: number
  color: string | null
  price: number | null
  active: boolean
  images: VariantImage[]
  sizes: VariantSize[]
};
type Brand = { id: number; name: string } | null;
type Product = {
  id: number
  title: string
  slug: string
  active: boolean
  brand: Brand
  variants: Variant[]
};

type ProductTableRow = Product & {
  variantsCount: number
  brandName: string
};

const route = useRoute();
const PRODUCTS_PER_PAGE = 20;
const currentPage = ref(Math.max(1, Number(route.query.page || 1)));
const searchQuery = ref(String(route.query.q || ''));
const appliedSearchQuery = ref(searchQuery.value);

const getEditProductTo = (productId: number) => ({ name: 'admin-products-edit', params: { id: productId } });

let isSyncingSearchQuery = false;

function debounce<T extends(...args: any[]) => void>(fn: T, delay = 400) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => fn(...args), delay);
  };
}

const updateSearchQuery = debounce(() => {
  currentPage.value = 1;
  appliedSearchQuery.value = searchQuery.value;
  navigateTo({ query: { ...route.query, page: undefined, q: searchQuery.value || undefined } });
}, 400);

watch(searchQuery, () => {
  if (!isSyncingSearchQuery) {
    updateSearchQuery();
  }
});

watch(
  () => route.query.page,
  (pageQuery) => {
    currentPage.value = Math.max(1, Number(pageQuery || 1));
  },
);

watch(
  () => route.query.q,
  (queryValue) => {
    const nextSearchQuery = String(queryValue || '');

    if (nextSearchQuery !== searchQuery.value) {
      isSyncingSearchQuery = true;
      searchQuery.value = nextSearchQuery;
      appliedSearchQuery.value = nextSearchQuery;

      nextTick(() => {
        isSyncingSearchQuery = false;
      });
    }
  },
);

const { data: productsResponse } = await useFetch('/api/admin/products/list', {
  query: { page: currentPage, limit: PRODUCTS_PER_PAGE, q: appliedSearchQuery },
  watch: [currentPage, appliedSearchQuery],
});

const products = computed(() => productsResponse.value?.items || []);
const totalProducts = computed(() => Number(productsResponse.value?.total || 0));

const expandedRows = ref<Record<string, boolean>>({});

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');

const productColumns: TableColumn<ProductTableRow>[] = [
  {
    id: 'expand',
    cell: ({ row }) =>
      h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        icon: 'i-lucide-chevron-down',
        square: true,
        'aria-label': 'Expand',
        ui: {
          leadingIcon: [
            'transition-transform',
            row.getIsExpanded() ? 'duration-200 rotate-180' : '',
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: 'Título',
    meta: { class: { th: 'w-64', td: 'truncate max-w-64' } },
  },
  {
    accessorKey: 'brandName',
    header: 'Marca',
    meta: { class: { th: 'w-40 truncate', td: 'truncate max-w-40' } },
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    meta: { class: { th: 'w-64', td: 'truncate max-w-64' } },
  },
  {
    accessorKey: 'active',
    header: 'Ativo',
    cell: ({ row }) => {
      const isActive = Boolean(row.getValue('active'));

      return h(
        UBadge,
        { variant: 'subtle', color: isActive ? 'success' : 'error' },
        () => (isActive ? 'Ativo' : 'Inativo'),
      );
    },
  },
  {
    accessorKey: 'variantsCount',
    header: 'Variantes',
  },
  {
    id: 'actions',
    header: 'Ações',
    meta: { class: { th: 'w-20 text-right', td: 'text-right' } },
    cell: ({ row }) =>
      h(UButton, {
        size: 'xs',
        variant: 'ghost',
        icon: 'i-lucide-pen-line',
        title: 'Editar',
        to: getEditProductTo(row.original.id),
      }),
  },
];

const productRows = computed<ProductTableRow[]>(() =>
  products.value.map(product => ({
    ...product,
    brandName: product.brand?.name || '—',
    variantsCount: product.variants?.length || 0,
  })),
);

const getPaginationTo = (pageNumber: number) => ({
  query: {
    ...route.query,
    page: pageNumber === 1 ? undefined : pageNumber,
  },
});
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :description="description"
    >
      <template #links>
        <div class="flex items-center gap-2">
          <UInput
            v-model="searchQuery"
            placeholder="Pesquisar por título ou slug..."
            icon="i-lucide-search"
            class="w-64"
          />

          <UButton
            :to="{ name: 'admin-products-new' }"
            color="primary"
            icon="i-lucide-plus"
          >
            New
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <UTable
          v-model:expanded="expandedRows"
          :data="productRows"
          :columns="productColumns"
          :ui="{ tr: 'data-[expanded=true]:bg-elevated/50' }"
        >
          <template #expanded="{ row }">
            <div class="p-3 border-t border-gray-200">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-sm font-semibold">
                    #{{ row.original.id }} — {{ row.original.title }}
                  </h3>

                  <p class="text-xs text-gray-500">
                    {{ row.original.brand?.name || '—' }} · {{ row.original.slug }}
                  </p>
                </div>

                <UBadge
                  v-if="!row.original.active"
                  color="error"
                  variant="subtle"
                >
                  Inativo
                </UBadge>
              </div>

              <div
                v-if="row.original.variants?.length"
                class="space-y-4"
              >
                <div
                  v-for="variant in row.original.variants"
                  :key="variant.id"
                  class="flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div class="shrink-0">
                    <p class="text-[11px] text-gray-500 mb-1">
                      Imagens
                    </p>

                    <div class="flex gap-2 overflow-x-auto max-w-full">
                      <NuxtImg
                        v-for="(variantImage, variantImageIndex) in variant.images || []"
                        :key="variantImageIndex"
                        :src="variantImage.url"
                        class="w-16 h-20 object-cover rounded border border-gray-200"
                      />

                      <div
                        v-if="!variant.images?.length"
                        class="w-16 h-20 flex items-center justify-center rounded border border-gray-200 text-xs text-gray-400"
                      >
                        —
                      </div>
                    </div>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ `#${variant.id}` }} — {{ variant.color || '—' }}</span>

                      <UBadge
                        v-if="!variant.active"
                        variant="subtle"
                        color="error"
                      >
                        Inativo
                      </UBadge>
                    </div>

                    <div
                      class="text-sm text-gray-500 mb-2"
                      v-text="formatPrice(variant.price)"
                    />

                    <p class="text-[11px] text-gray-500 mb-1">
                      Tamanhos
                    </p>

                    <div class="flex flex-wrap gap-1.5">
                      <UBadge
                        v-for="variantSize in variant.sizes || []"
                        :key="variantSize.id"
                        variant="soft"
                      >
                        {{ variantSize.size }} · qty: {{ variantSize.stock ?? 0 }}
                      </UBadge>

                      <span
                        v-if="!variant.sizes?.length"
                        class="text-xs text-gray-400"
                      >—</span>
                    </div>
                  </div>
                </div>
              </div>

              <p
                v-else
                class="text-sm text-gray-500"
              >
                Nenhum produto encontrado
              </p>
            </div>
          </template>
        </UTable>
      </UCard>

      <div class="mt-6 flex justify-center">
        <UPagination
          v-model:page="currentPage"
          :itemsPerPage="PRODUCTS_PER_PAGE"
          :total="totalProducts"
          :to="getPaginationTo"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
