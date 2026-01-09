<script setup lang="ts">
definePageMeta({
  name: 'admin-offices-new',
  layout: 'admin',
  middleware: 'admin',
});

const { t } = useI18n();
const localeRoute = useLocaleRoute();

useHead(() => ({
  title: `${t('adminOfficeNew.metaTitle')} | Amoda Admin`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}));

const onSaved = (id: number) => {
  navigateTo(localeRoute({ name: 'admin-offices-edit-id', params: { id } }));
};
</script>

<i18n lang="json">
{
  "en": {
    "adminOfficeNew": {
      "metaTitle": "New Office",
      "title": "New office",
      "description": "Create pickup office",
      "create": "Create"
    }
  },
  "pt": {
    "adminOfficeNew": {
      "metaTitle": "Novo ponto",
      "title": "Novo ponto",
      "description": "Criar ponto de levantamento",
      "create": "Criar"
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('adminOfficeNew.title')"
      :description="t('adminOfficeNew.description')"
    />

    <UPageBody class="max-w-4xl mx-auto">
      <AdminOfficeForm
        mode="create"
        :submitLabel="t('adminOfficeNew.create')"
        @saved="onSaved"
      />
    </UPageBody>
  </UPage>
</template>
