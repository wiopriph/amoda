<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';


definePageMeta({ name: 'admin-products', layout: 'admin', middleware: 'admin' });

const { t } = useI18n();
const localeRoute = useLocaleRoute();

/** types */
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

/** query/pagination */
const route = useRoute();
const limit = 3;
const page = ref(Math.max(1, Number(route.query.page || 1)));
const search = ref(String(route.query.q || ''));

/** simple debounce util */
function debounce<T extends(...args: any[]) => void>(fn: T, delay = 400) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => fn(...args), delay);
  };
}

/** debounce search */
const handleSearch = debounce(() => {
  navigateTo(localeRoute({ query: { ...route.query, page: 1, q: search.value || undefined } }));
}, 400);

watch(search, handleSearch);

/** fetch */
const { data, error } = await useFetch('/api/admin/products/list', {
  query: { page, limit, q: search },
  watch: [page],
});

const items = computed<Product[]>(() => data.value?.items || []);
const total = computed(() => Number(data.value?.total || 0));

const expanded = ref<Record<string, boolean>>({});

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');

/** table columns */
const columns: TableColumn<Product & { variantsCount: number; brandName: string }>[] = [
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
    header: t('products.table.id'),
  },
  {
    accessorKey: 'title',
    header: t('products.table.title'),
    meta: { class: { th: 'w-64', td: 'truncate max-w-64' } },
  },
  {
    accessorKey: 'brandName',
    header: t('products.table.brand'),
    meta: { class: { th: 'w-40 truncate', td: 'truncate max-w-40' } },
  },
  {
    accessorKey: 'slug',
    header: t('products.table.slug'),
    meta: { class: { th: 'w-64', td: 'truncate max-w-64' } },
  },
  {
    accessorKey: 'active',
    header: t('products.table.active'),
    cell: ({ row }) => {
      const val = row.getValue('active');

      return h(
        UBadge,
        { variant: 'subtle', color: val ? 'success' : 'error' },
        () => (val ? t('common.active') : t('common.inactive')),
      );
    },
  },
  {
    accessorKey: 'variantsCount',
    header: t('products.table.variants'),
  },
  {
    id: 'actions',
    header: t('common.actions'),
    meta: { class: { th: 'w-20 text-right', td: 'text-right' } },
    cell: ({ row }) =>
      h(UButton, {
        size: 'xs',
        variant: 'ghost',
        icon: 'i-lucide-pen-line',
        title: t('common.edit'),
        onClick: () => navigateTo(localeRoute({ name: 'admin-products-edit', params: { id: row.original.id } })),
      }),
  },
];

const tableData = computed(() =>
  (items.value ?? []).map(p => ({
    ...p,
    brandName: p.brand?.name || '—',
    variantsCount: p.variants?.length || 0,
  })),
);

const fmtPrice = (value?: number | null) => value ? `${new Intl.NumberFormat('pt-AO').format(value)} AOA` : '—';
</script>

<i18n lang="json">
{
  "en": {
    "products": {
      "title": "Products",
      "description": "Browse, search and preview product variants",
      "searchPlaceholder": "Search by title or slug...",
      "preview": "Preview",
      "noData": "No products found",
      "variantsTitle": "Variants",
      "sizes": "Sizes",
      "images": "Images",
      "table": {
        "id": "ID",
        "title": "Title",
        "brand": "Brand",
        "slug": "Slug",
        "active": "Active",
        "variants": "Variants"
      }
    },
    "common": {
      "active": "Active",
      "inactive": "Inactive",
      "actions": "Actions",
      "edit": "Edit"
    }
  },
  "pt-AO": {
    "products": {
      "title": "Produtos",
      "description": "Navegue, pesquise e visualize variantes",
      "searchPlaceholder": "Pesquisar por título ou slug...",
      "preview": "Pré-visualizar",
      "noData": "Nenhum produto encontrado",
      "variantsTitle": "Variantes",
      "sizes": "Tamanhos",
      "images": "Imagens",
      "table": {
        "id": "ID",
        "title": "Título",
        "brand": "Marca",
        "slug": "Slug",
        "active": "Ativo",
        "variants": "Variantes"
      }
    },
    "common": {
      "active": "Ativo",
      "inactive": "Inativo",
      "actions": "Ações",
      "edit": "Editar"
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('products.title')"
      :description="t('products.description')"
    >
      <template #links>
        <div class="flex items-center gap-2">
          <UInput
            v-model="search"
            :placeholder="t('products.searchPlaceholder')"
            icon="i-lucide-search"
            class="w-64"
          />

          <UButton
            color="primary"
            icon="i-lucide-plus"
            @click="navigateTo(localeRoute({ name: 'admin-products-new' }))"
          >
            New
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <UTable
          v-model:expanded="expanded"
          :data="tableData"
          :columns="columns"
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
                  {{ t('common.inactive') }}
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
                  <!-- images -->
                  <div class="shrink-0">
                    <p class="text-[11px] text-gray-500 mb-1">
                      {{ t('products.images') }}
                    </p>

                    <div class="flex gap-2 overflow-x-auto max-w-full">
                      <NuxtImg
                        v-for="(img, i) in variant.images || []"
                        :key="i"
                        :src="img.url"
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

                  <!-- info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ `#${variant.id}` }} — {{ variant.color || '—' }}</span>

                      <UBadge
                        v-if="!variant.active"
                        variant="subtle"
                        color="error"
                      >
                        {{ t('common.inactive') }}
                      </UBadge>
                    </div>

                    <div class="text-sm text-gray-500 mb-2">
                      {{ fmtPrice(variant.price) }}
                    </div>

                    <p class="text-[11px] text-gray-500 mb-1">
                      {{ t('products.sizes') }}
                    </p>

                    <div class="flex flex-wrap gap-1.5">
                      <UBadge
                        v-for="s in variant.sizes || []"
                        :key="s.id"
                        variant="soft"
                      >
                        {{ s.size }} · qty: {{ s.stock ?? 0 }}
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
                {{ t('products.noData') }}
              </p>
            </div>
          </template>
        </UTable>
      </UCard>

      <div class="mt-6 flex justify-center">
        <UPagination
          v-model:page="page"
          :itemsPerPage="limit"
          :total="total"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

