<script setup lang="ts">
definePageMeta({
  name: 'admin-offices-edit-id',
  layout: 'admin',
  middleware: 'admin',
});

const route = useRoute();
const officeId = computed(() => Number(route.params.id));
const title = computed(() => `Editar ponto #${officeId.value}`);
const description = 'Atualizar ponto de levantamento';

type OfficeResponse = {
  id: number
  slug: string
  name: string
  description?: string | null
  address?: string | null
  location_lat?: number | null
  location_lng?: number | null
  phone?: string | null
  opening_hours?: string | null
  active: boolean
};

useHead(() => ({
  title: title.value,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description },
    { property: 'twitter:title', content: title.value },
    { property: 'twitter:description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const {
  data: officeResponse,
  pending: isOfficePending,
  error: officeError,
  refresh: refreshOffice,
} = await useFetch<OfficeResponse>('/api/admin/offices/get', {
  query: { id: officeId },
  watch: [officeId],
});

const officeInitialValues = computed(() => {
  const office = officeResponse.value;

  if (!office) {
    return null;
  }

  return {
    id: office.id,
    slug: office.slug,
    name: office.name,
    description: office.description ?? null,
    address: office.address ?? null,
    locationLat: office.location_lat ?? null,
    locationLng: office.location_lng ?? null,
    phone: office.phone ?? null,
    openingHours: office.opening_hours ?? null,
    active: !!office.active,
  };
});

const refreshSavedOffice = async () => {
  await refreshOffice();
};
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :description="description"
    />

    <UPageBody class="max-w-4xl mx-auto">
      <UCard
        v-if="isOfficePending"
        class="p-6 text-center text-gray-500"
      >
        A carregar…
      </UCard>

      <UAlert
        v-else-if="officeError || !officeInitialValues"
        :description="String(officeError?.message || 'Ponto não encontrado')"
        color="error"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        title="Erro"
      />

      <AdminOfficeForm
        v-else
        :initial="officeInitialValues"
        mode="edit"
        submitLabel="Guardar"
        @saved="refreshSavedOffice"
      />
    </UPageBody>
  </UPage>
</template>
