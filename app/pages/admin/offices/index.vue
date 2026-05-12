<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';


definePageMeta({
  name: 'admin-offices',
  layout: 'admin',
  middleware: 'admin',
});

const title = 'Pontos';
const description = 'Gerir pontos de levantamento';

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

type OfficeRow = {
  id: number;
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
};

const officesPerPage = 20;
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

const { data: officesResponse } = await useFetch('/api/admin/offices/list', {
  query: { page: currentPage, limit: officesPerPage, q: appliedSearchQuery },
  watch: [currentPage, appliedSearchQuery],
});

const offices = computed<OfficeRow[]>(() => officesResponse.value?.items || []);
const totalOffices = computed(() => Number(officesResponse.value?.total || 0));

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');
const ClientOnly = resolveComponent('ClientOnly');

const formatDate = (date: string) => new Intl.DateTimeFormat('pt-PT', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(date));

const officeColumns: TableColumn<OfficeRow>[] = [
  { accessorKey: 'id', header: 'ID', meta: { class: { th: 'w-16' } } },
  { accessorKey: 'name', header: 'Nome', meta: { class: { th: 'w-56', td: 'truncate max-w-56' } } },
  {
    accessorKey: 'slug',
    header: 'Slug',
    meta: { class: { th: 'w-48', td: 'font-mono truncate max-w-48' } },
  },
  { accessorKey: 'phone', header: 'Telefone', cell: ({ row }) => row.original.phone || '—' },
  {
    accessorKey: 'address',
    header: 'Endereço',
    meta: { class: { td: 'truncate max-w-72' } },
    cell: ({ row }) => row.original.address || '—',
  },
  {
    accessorKey: 'active',
    header: 'Ativo',
    cell: ({ row }) => {
      const isActive = row.original.active;

      return h(
        UBadge,
        { variant: 'subtle', color: isActive ? 'success' : 'error' },
        () => (isActive ? 'Ativo' : 'Inativo'),
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Criado',
    cell: ({ row }) =>
      h(ClientOnly, {}, {
        default: () => formatDate(row.original.created_at),
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
        icon: 'i-lucide-pen-line',
        title: 'Editar',
        to: { name: 'admin-offices-edit-id', params: { id: row.original.id } },
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
        <div class="flex items-center gap-2">
          <UInput
            v-model="searchQuery"
            placeholder="Pesquisar por nome, slug, telefone ou endereço..."
            icon="i-lucide-search"
            class="w-80"
          />

          <UButton
            :to="{ name: 'admin-offices-new' }"
            color="primary"
            icon="i-lucide-plus"
          >
            Novo
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <UTable
          :data="offices"
          :columns="officeColumns"
        />
      </UCard>

      <div class="mt-6 flex justify-center">
        <UPagination
          v-model:page="currentPage"
          :itemsPerPage="officesPerPage"
          :total="totalOffices"
          :to="getPaginationTo"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
