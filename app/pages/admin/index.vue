<script setup lang="ts">
definePageMeta({ name: 'admin', layout: 'admin', middleware: 'admin' });

const title = 'Painel de Administração';
const description = 'Gerencie marcas, categorias e produtos';

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));
</script>

<template>
  <UPage>
    <UPageHeader
      :ui="{ title: 'text-xl font-semibold md:text-2xl' }"
      :title="title"
      :description="description"
    />

    <UPageBody>
      <UCard>
        <p class="text-gray-700">
          Gerencie marcas, categorias e produtos
        </p>
      </UCard>
    </UPageBody>
  </UPage>
</template>
