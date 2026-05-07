<script setup lang="ts">
const meta = computed(() => [
  { key: 'og:type', property: 'og:type', content: 'website' },
  { key: 'og:site_name', property: 'og:site_name', content: 'Amoda' },
]);

const i18nHead = useLocaleHead();

useHead(() => ({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs.lang,
  },
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || []), ...meta.value],
}));
</script>

<template>
  <UApp>
    <AppHeader />

    <UMain>
      <UContainer>
        <NuxtPage />
      </UContainer>
    </UMain>

    <AppFooter />
  </UApp>
</template>
