<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';


definePageMeta({
  name: 'admin-carts',
  layout: 'admin',
  middleware: 'admin',
});

const title = 'Carrinhos';
const description = 'Ver carrinhos salvos';

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

type CartStatus = 'DRAFT' | 'CHECKOUT' | 'ORDERED' | 'ABANDONED' | 'EXPIRED';

type CartRow = {
  id: string;
  public_code: string;
  status: CartStatus;
  updated_at: string;
  expires_at: string | null;
  checkout_started_at: string | null;
  contact_snapshot: any;
};

const cartsPerPage = 20;
const route = useRoute();

const currentPage = ref(Math.max(1, Number(route.query.page || 1)));
const searchQuery = ref(String(route.query.q || ''));
const appliedSearchQuery = ref(searchQuery.value);

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

const { data: cartsResponse } = await useFetch('/api/admin/carts/list', {
  query: { page: currentPage, limit: cartsPerPage, q: appliedSearchQuery },
  watch: [currentPage, appliedSearchQuery],
});

const carts = computed<CartRow[]>(() => cartsResponse.value?.items || []);
const totalCarts = computed(() => Number(cartsResponse.value?.total || 0));

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const ClientOnly = resolveComponent('ClientOnly');

const getContactPhone = (contactSnapshot: any) => String(contactSnapshot?.phone || '').trim() || '—';
const getCartTo = (publicCode: string) => ({ name: 'admin-carts-code', params: { code: publicCode } });

const statusLabels: Record<CartStatus, string> = {
  DRAFT: 'Rascunho',
  CHECKOUT: 'Checkout',
  ORDERED: 'Convertido',
  ABANDONED: 'Abandonado',
  EXPIRED: 'Expirado',
};

const getStatusLabel = (status: CartStatus) => statusLabels[status] || status;

const getStatusColor = (status: CartStatus) => {
  switch (status) {
    case 'CHECKOUT':
      return 'warning';
    case 'ORDERED':
      return 'success';
    case 'ABANDONED':
    case 'EXPIRED':
      return 'error';
    case 'DRAFT':
    default:
      return 'neutral';
  }
};

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const formatDate = (date?: string | null) => date ? dateFormatter.format(new Date(date)) : '—';

const cartColumns: TableColumn<CartRow>[] = [
  {
    accessorKey: 'public_code',
    header: 'Código',
    meta: { class: { th: 'w-36', td: 'font-mono' } },
    cell: ({ row }) =>
      h(UButton, {
        size: 'xs',
        variant: 'link',
        class: 'font-mono p-0',
        to: getCartTo(row.original.public_code),
      }, () => row.original.public_code),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        UBadge,
        { variant: 'subtle', color: getStatusColor(row.original.status) },
        () => getStatusLabel(row.original.status),
      ),
  },
  { id: 'phone', header: 'Telefone', cell: ({ row }) => getContactPhone(row.original.contact_snapshot) },
  {
    accessorKey: 'checkout_started_at',
    header: 'Checkout iniciado',
    cell: ({ row }) =>
      h(ClientOnly, {}, {
        default: () => formatDate(row.original.checkout_started_at),
        fallback: () => '—',
      }),
  },
  {
    accessorKey: 'updated_at',
    header: 'Atualizado',
    cell: ({ row }) =>
      h(ClientOnly, {}, {
        default: () => formatDate(row.original.updated_at),
        fallback: () => '—',
      }),
  },
  {
    accessorKey: 'expires_at',
    header: 'Expira',
    cell: ({ row }) =>
      h(ClientOnly, {}, {
        default: () => formatDate(row.original.expires_at),
        fallback: () => '—',
      }),
  },
  {
    id: 'actions',
    header: 'Ações',
    meta: { class: { th: 'w-20 text-right', td: 'text-right' } },
    cell: ({ row }) =>
      h(UButton, {
        size: 'xs',
        variant: 'ghost',
        icon: 'i-lucide-arrow-right',
        title: 'Ver',
        to: getCartTo(row.original.public_code),
      }),
  },
];

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
        <UInput
          v-model="searchQuery"
          placeholder="Pesquisar por código do carrinho..."
          icon="i-lucide-search"
          class="w-72"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <UTable
          :data="carts"
          :columns="cartColumns"
        />
      </UCard>

      <div class="mt-6 flex justify-center">
        <UPagination
          v-model:page="currentPage"
          :itemsPerPage="cartsPerPage"
          :total="totalCarts"
          :to="getPaginationTo"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
