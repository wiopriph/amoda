<script setup lang="ts">
definePageMeta({
  name: 'admin-offices-new',
  layout: 'admin',
  middleware: 'admin',
});

const title = 'Novo ponto';
const description = 'Criar ponto de levantamento';

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

const openCreatedOffice = (officeId: number) => {
  navigateTo({ name: 'admin-offices-edit-id', params: { id: officeId } });
};
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :description="description"
    />

    <UPageBody class="max-w-4xl mx-auto">
      <AdminOfficeForm
        mode="create"
        submitLabel="Criar"
        @saved="openCreatedOffice"
      />
    </UPageBody>
  </UPage>
</template>
