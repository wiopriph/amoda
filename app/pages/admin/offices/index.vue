<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';


definePageMeta({
  name: 'admin-offices',
  layout: 'admin',
  middleware: 'admin',
});

const { t } = useI18n();
const localeRoute = useLocaleRoute();
const route = useRoute();

useHead(() => ({
  title: `${t('offices.title')} | Amoda Admin`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}));

type OfficeRow = {
  id: number;
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
};

const limit = 20;
const page = ref(Math.max(1, Number(route.query.page || 1)));
const search = ref(String(route.query.q || ''));

function debounce<T extends(...args: any[]) => void>(fn: T, delay = 400) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => fn(...args), delay);
  };
}

const handleSearch = debounce(() => {
  navigateTo(localeRoute({ query: { ...route.query, page: 1, q: search.value || undefined } }));
}, 400);

watch(search, handleSearch);

const { data } = await useFetch('/api/admin/offices/list', {
  query: { page, limit, q: search },
  watch: [page],
});

const items = computed<OfficeRow[]>(() => data.value?.items || []);
const total = computed(() => Number(data.value?.total || 0));

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));

const columns: TableColumn<any>[] = [
  { accessorKey: 'id', header: 'ID', meta: { class: { th: 'w-16' } } },
  { accessorKey: 'name', header: t('offices.table.name'), meta: { class: { th: 'w-56', td: 'truncate max-w-56' } } },
  {
    accessorKey: 'slug',
    header: t('offices.table.slug'),
    meta: { class: { th: 'w-48', td: 'font-mono truncate max-w-48' } },
  },
  { accessorKey: 'phone', header: t('offices.table.phone'), cell: ({ row }) => row.original.phone || '—' },
  {
    accessorKey: 'address',
    header: t('offices.table.address'),
    meta: { class: { td: 'truncate max-w-72' } },
    cell: ({ row }) => row.original.address || '—',
  },
  {
    accessorKey: 'active',
    header: t('offices.table.active'),
    cell: ({ row }) => h(
      UBadge,
      { variant: 'subtle', color: row.original.active ? 'success' : 'error' },
      () => row.original.active ? t('common.active') : t('common.inactive'),
    ),
  },
  {
    accessorKey: 'created_at',
    header: t('offices.table.created'),
    cell: ({ row }) =>
      h(resolveComponent('ClientOnly'), {}, {
        default: () => fmtDate(row.original.created_at),
        fallback: () => '—',
      }),
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
        onClick: () => navigateTo(localeRoute({ name: 'admin-offices-edit-id', params: { id: row.original.id } })),
      }),
  },
];

const paginationTo = (p: number) => ({ query: { ...route.query, page: p } });
</script>

<i18n lang="json">
{
  "en": {
    "offices": {
      "title": "Offices",
      "description": "Manage pickup offices",
      "searchPlaceholder": "Search by name, slug, phone or address...",
      "new": "New",
      "table": {
        "name": "Name",
        "slug": "Slug",
        "phone": "Phone",
        "address": "Address",
        "active": "Active",
        "created": "Created"
      }
    },
    "common": {
      "actions": "Actions",
      "edit": "Edit",
      "active": "Active",
      "inactive": "Inactive"
    }
  },
  "pt": {
    "offices": {
      "title": "Pontos",
      "description": "Gerir pontos de levantamento",
      "searchPlaceholder": "Pesquisar por nome, slug, telefone ou endereço...",
      "new": "Novo",
      "table": {
        "name": "Nome",
        "slug": "Slug",
        "phone": "Telefone",
        "address": "Endereço",
        "active": "Ativo",
        "created": "Criado"
      }
    },
    "common": {
      "actions": "Ações",
      "edit": "Editar",
      "active": "Ativo",
      "inactive": "Inativo"
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('offices.title')"
      :description="t('offices.description')"
    >
      <template #links>
        <div class="flex items-center gap-2">
          <UInput
            v-model="search"
            :placeholder="t('offices.searchPlaceholder')"
            icon="i-lucide-search"
            class="w-80"
          />

          <UButton
            color="primary"
            icon="i-lucide-plus"
            @click="navigateTo(localeRoute({ name: 'admin-offices-new' }))"
          >
            {{ t('offices.new') }}
          </UButton>
        </div>
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
