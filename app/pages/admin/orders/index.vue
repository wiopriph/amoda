<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';


definePageMeta({ name: 'admin-orders', layout: 'admin', middleware: 'admin' });

const { t } = useI18n();
const localeRoute = useLocaleRoute();
const route = useRoute();

useHead(() => ({
  title: `${t('orders.title')} | Amoda Admin`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}));

type Office = { id: number; name: string } | null;

type OrderRow = {
  id: number;
  number: string;
  status: 'PLACED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'UNPAID' | 'PAID' | 'REFUND_PARTIAL' | 'REFUND_FULL';
  totals: any;
  guest_contact: any;
  created_at: string;
  pickup_office: Office;
};

const limit = 20;
const page = ref(Math.max(1, Number(route.query.page || 1)));
const search = ref(String(route.query.q || ''));

function debounce<T extends(...args: any[]) => void>(fn: T, delay = 400) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => fn(...args), delay);
  };
}

const handleSearch = debounce(() => {
  navigateTo(localeRoute({ query: { ...route.query, page: 1, q: search.value || undefined } }));
}, 400);

watch(search, handleSearch);

const { data } = await useFetch('/api/admin/orders/list', {
  query: { page, limit, q: search },
  watch: [page],
});

const items = computed<OrderRow[]>(() => data.value?.items || []);
const total = computed(() => Number(data.value?.total || 0));

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');

const fmtAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val)} AOA`;

const getTotal = (totals: any) => {
  const v = totals?.total ?? totals?.grandTotal ?? totals?.amount ?? null;

  return typeof v === 'number' ? fmtAOA(v) : '—';
};

const getPhone = (guest: any) => String(guest?.phone || '').trim() || '—';

// ---- актуальные статусы ----
const statusColor = (s: OrderRow['status']) => {
  switch (s) {
    case 'DELIVERED': return 'success';
    case 'CANCELLED': return 'error';
    case 'CONFIRMED': return 'warning';
    case 'PLACED':
    default: return 'neutral';
  }
};

const payColor = (s: OrderRow['payment_status']) => {
  switch (s) {
    case 'PAID': return 'success';
    case 'REFUND_PARTIAL': return 'warning';
    case 'REFUND_FULL': return 'error';
    case 'UNPAID':
    default: return 'neutral';
  }
};

const statusLabel = (s: OrderRow['status']) => t(`orderStatus.${s}`);
const paymentLabel = (s: OrderRow['payment_status']) => t(`paymentStatus.${s}`);

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(iso));


const columns: TableColumn<any>[] = [
  {
    accessorKey: 'number',
    header: t('orders.table.number'),
    meta: { class: { th: 'w-40', td: 'font-mono' } },
  },
  {
    accessorKey: 'created_at',
    header: t('orders.table.created'),
    cell: ({ row }) =>
      h('span', [
        h(resolveComponent('ClientOnly'), {}, {
          default: () => fmtDate(row.original.created_at),
          fallback: () => '—',
        }),
      ]),
  },
  {
    accessorKey: 'status',
    header: t('orders.table.status'),
    cell: ({ row }) =>
      h(
        UBadge,
        { variant: 'subtle', color: statusColor(row.original.status) },
        () => statusLabel(row.original.status),
      ),
  },
  {
    accessorKey: 'payment_status',
    header: t('orders.table.payment'),
    cell: ({ row }) =>
      h(
        UBadge,
        { variant: 'subtle', color: payColor(row.original.payment_status) },
        () => paymentLabel(row.original.payment_status),
      ),
  },
  { id: 'total', header: t('orders.table.total'), cell: ({ row }) => getTotal(row.original.totals) },
  { id: 'phone', header: t('orders.table.phone'), cell: ({ row }) => getPhone(row.original.guest_contact) },
  { id: 'office', header: t('orders.table.office'), cell: ({ row }) => row.original.pickup_office?.name || '—' },
  {
    id: 'actions',
    header: t('common.actions'),
    meta: { class: { th: 'w-20 text-right', td: 'text-right' } },
    cell: ({ row }) =>
      h(UButton, {
        size: 'xs',
        variant: 'ghost',
        icon: 'i-lucide-arrow-right',
        title: t('common.view'),
        onClick: () => navigateTo(localeRoute({ name: 'admin-orders-number', params: { number: row.original.number } })),
      }),
  },
];

const paginationTo = (p: number) => ({ query: { ...route.query, page: p } });
</script>

<i18n lang="json">
{
  "en": {
    "orders": {
      "title": "Orders",
      "description": "Browse and manage orders",
      "searchPlaceholder": "Search by order number or phone...",
      "table": {
        "number": "Number",
        "created": "Created",
        "status": "Status",
        "payment": "Payment",
        "total": "Total",
        "phone": "Phone",
        "office": "Pickup office"
      }
    },
    "common": {
      "actions": "Actions",
      "view": "View"
    },
    "orderStatus": {
      "PLACED": "Placed",
      "CONFIRMED": "Confirmed",
      "DELIVERED": "Delivered",
      "CANCELLED": "Cancelled"
    },
    "paymentStatus": {
      "UNPAID": "Unpaid",
      "PAID": "Paid",
      "REFUND_PARTIAL": "Partial refund",
      "REFUND_FULL": "Full refund"
    }
  },
  "pt": {
    "orders": {
      "title": "Pedidos",
      "description": "Ver e gerenciar pedidos",
      "searchPlaceholder": "Pesquisar por número ou telefone...",
      "table": {
        "number": "Número",
        "created": "Criado",
        "status": "Status",
        "payment": "Pagamento",
        "total": "Total",
        "phone": "Telefone",
        "office": "Ponto de retirada"
      }
    },
    "common": {
      "actions": "Ações",
      "view": "Ver"
    },
    "orderStatus": {
      "PLACED": "Novo",
      "CONFIRMED": "Confirmado",
      "DELIVERED": "Pronto para levantamento",
      "CANCELLED": "Cancelado"
    },
    "paymentStatus": {
      "UNPAID": "Não pago",
      "PAID": "Pago",
      "REFUND_PARTIAL": "Reembolso parcial",
      "REFUND_FULL": "Reembolso total"
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('orders.title')"
      :description="t('orders.description')"
    >
      <template #links>
        <UInput
          v-model="search"
          :placeholder="t('orders.searchPlaceholder')"
          icon="i-lucide-search"
          class="w-72"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <UTable
          :data="items"
          :columns="columns"
        />
      </UCard>

      <div class="mt-6 flex justify-center">
        <UPagination
          v-model:page="page"
          :itemsPerPage="limit"
          :total="total"
          :to="paginationTo"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
