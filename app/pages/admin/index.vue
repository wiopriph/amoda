<script setup lang="ts">
definePageMeta({ name: 'admin', layout: 'admin', middleware: 'admin' });

const { t } = useI18n();

useHead(() => ({
  title: `${t('admin.title')} | Amoda`,
  meta: [
    { name: 'description', content: t('admin.description') },
    { property: 'og:title', content: `${t('admin.title')} | Amoda` },
    { property: 'og:description', content: t('admin.description') },
    { property: 'twitter:title', content: `${t('admin.title')} | Amoda` },
    { property: 'twitter:description', content: t('admin.description') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));
</script>

<i18n lang="json">
{
  "en": {
    "admin": {
      "title": "Admin Dashboard",
      "description": "Manage brands, categories and products"
    }
  },
  "pt": {
    "admin": {
      "title": "Painel de Administração",
      "description": "Gerencie marcas, categorias e produtos"
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('admin.title')"
      :ui="{ title: 'text-xl font-semibold md:text-2xl' }"
    />

    <UPageBody>
      <UCard>
        <p class="text-gray-700">
          {{ t('admin.description') }}
        </p>
      </UCard>
    </UPageBody>
  </UPage>
</template>
