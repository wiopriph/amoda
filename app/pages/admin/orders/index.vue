<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { formatPrice } from '~/utils/formatPrice';


definePageMeta({
  name: 'admin-orders',
  layout: 'admin',
  middleware: 'admin',
});

const title = 'Pedidos';
const description = 'Ver e gerenciar pedidos';

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

type Office = { id: number; name: string } | null;
type OrderStatus = 'PLACED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUND_PARTIAL' | 'REFUND_FULL';

type OrderRow = {
  id: number;
  number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  totals: any;
  guest_contact: any;
  created_at: string;
  pickup_office: Office;
};

const ordersPerPage = 20;
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

const { data: ordersResponse } = await useFetch('/api/admin/orders/list', {
  query: { page: currentPage, limit: ordersPerPage, q: appliedSearchQuery },
  watch: [currentPage, appliedSearchQuery],
});

const orders = computed<OrderRow[]>(() => ordersResponse.value?.items || []);
const totalOrders = computed(() => Number(ordersResponse.value?.total || 0));

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const ClientOnly = resolveComponent('ClientOnly');

const getOrderTotal = (totals: any) => {
  const orderTotal = totals?.total ?? totals?.grandTotal ?? totals?.amount ?? null;

  return typeof orderTotal === 'number' ? formatPrice(orderTotal) : '—';
};

const getGuestPhone = (guestContact: any) => String(guestContact?.phone || '').trim() || '—';
const getOrderTo = (orderNumber: string) => ({ name: 'admin-orders-number', params: { number: orderNumber } });

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    case 'CONFIRMED':
      return 'warning';
    case 'PLACED':
    default:
      return 'neutral';
  }
};

const getPaymentColor = (paymentStatus: PaymentStatus) => {
  switch (paymentStatus) {
    case 'PAID':
      return 'success';
    case 'REFUND_PARTIAL':
      return 'warning';
    case 'REFUND_FULL':
      return 'error';
    case 'UNPAID':
    default:
      return 'neutral';
  }
};

const statusLabels: Record<OrderStatus, string> = {
  PLACED: 'Novo',
  CONFIRMED: 'Confirmado',
  DELIVERED: 'Pronto para levantamento',
  CANCELLED: 'Cancelado',
};

const paymentLabels: Record<PaymentStatus, string> = {
  UNPAID: 'Não pago',
  PAID: 'Pago',
  REFUND_PARTIAL: 'Reembolso parcial',
  REFUND_FULL: 'Reembolso total',
};

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const formatDate = (date: string) => dateFormatter.format(new Date(date));

const orderColumns: TableColumn<OrderRow>[] = [
  {
    accessorKey: 'number',
    header: 'Número',
    meta: { class: { th: 'w-40', td: 'font-mono' } },
  },
  {
    accessorKey: 'created_at',
    header: 'Criado',
    cell: ({ row }) =>
      h('span', [
        h(ClientOnly, {}, {
          default: () => formatDate(row.original.created_at),
          fallback: () => '—',
        }),
      ]),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) =>
      h(
        UBadge,
        { variant: 'subtle', color: getStatusColor(row.original.status) },
        () => statusLabels[row.original.status],
      ),
  },
  {
    accessorKey: 'payment_status',
    header: 'Pagamento',
    cell: ({ row }) =>
      h(
        UBadge,
        { variant: 'subtle', color: getPaymentColor(row.original.payment_status) },
        () => paymentLabels[row.original.payment_status],
      ),
  },
  { id: 'total', header: 'Total', cell: ({ row }) => getOrderTotal(row.original.totals) },
  { id: 'phone', header: 'Telefone', cell: ({ row }) => getGuestPhone(row.original.guest_contact) },
  { id: 'office', header: 'Ponto de retirada', cell: ({ row }) => row.original.pickup_office?.name || '—' },
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
        to: getOrderTo(row.original.number),
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
          placeholder="Pesquisar por número ou telefone..."
          icon="i-lucide-search"
          class="w-72"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <UTable
          :data="orders"
          :columns="orderColumns"
        />
      </UCard>

      <div class="mt-6 flex justify-center">
        <UPagination
          v-model:page="currentPage"
          :itemsPerPage="ordersPerPage"
          :total="totalOrders"
          :to="getPaginationTo"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
