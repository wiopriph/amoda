<script setup lang="ts">
definePageMeta({
  name: 'admin-offices-edit-id',
  layout: 'admin',
  middleware: 'admin',
});

const { t } = useI18n();
const route = useRoute();

useHead(() => ({
  title: `${t('adminOfficeEdit.metaTitle', { id: String(route.params.id) })} | Amoda Admin`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}));

const id = computed(() => Number(route.params.id));

const { data, pending, error, refresh } = await useFetch('/api/admin/offices/get', {
  query: { id },
  watch: [id],
});

const initial = computed(() => {
  const o: any = data.value;

  if (!o) {
    return null;
  }

  return {
    id: o.id,
    slug: o.slug,
    name: o.name,
    description: o.description ?? null,
    address: o.address ?? null,
    locationLat: o.location_lat ?? null,
    locationLng: o.location_lng ?? null,
    phone: o.phone ?? null,
    openingHours: o.opening_hours ?? null,
    active: !!o.active,
  };
});

const onSaved = async () => {
  await refresh();
};
</script>

<i18n lang="json">
{
  "en": {
    "adminOfficeEdit": {
      "metaTitle": "Edit Office #{id}",
      "title": "Edit office #{id}",
      "description": "Update pickup office",
      "loading": "Loading…",
      "errorTitle": "Error",
      "notFound": "Office not found",
      "save": "Save"
    }
  },
  "pt": {
    "adminOfficeEdit": {
      "metaTitle": "Editar ponto #{id}",
      "title": "Editar ponto #{id}",
      "description": "Atualizar ponto de levantamento",
      "loading": "A carregar…",
      "errorTitle": "Erro",
      "notFound": "Ponto não encontrado",
      "save": "Guardar"
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('adminOfficeEdit.title', { id: String(route.params.id) })"
      :description="t('adminOfficeEdit.description')"
    />

    <UPageBody class="max-w-4xl mx-auto">
      <UCard
        v-if="pending"
        class="p-6 text-center text-gray-500"
      >
        {{ t('adminOfficeEdit.loading') }}
      </UCard>

      <UAlert
        v-else-if="error || !initial"
        color="error"
        variant="soft"
        icon="i-heroicons-exclamation-triangle"
        :title="t('adminOfficeEdit.errorTitle')"
        :description="String(error?.message || t('adminOfficeEdit.notFound'))"
      />

      <AdminOfficeForm
        v-else
        mode="edit"
        :initial="initial"
        :submitLabel="t('adminOfficeEdit.save')"
        @saved="onSaved"
      />
    </UPageBody>
  </UPage>
</template>
