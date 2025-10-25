<script setup lang="ts">
definePageMeta({ name: 'delivery' });

const { t } = useI18n();

useHead(() => ({
  title: t('delivery.meta.title'),
  meta: [
    { name: 'description', content: t('delivery.meta.description') },
    { property: 'og:title', content: t('delivery.meta.title') },
    { property: 'og:description', content: t('delivery.meta.description') },
  ],
}));
</script>

<i18n lang="json">
{
  "pt-AO": {
    "delivery": {
      "title": "Entrega",
      "text": "Em breve aqui estarão descritas as condições de entrega, bem como listados todos os nossos pontos de recolha de encomendas, que estarão disponíveis em todas as principais cidades de Angola.",
      "meta": {
        "title": "Entrega | Amoda",
        "description": "Informações sobre entrega e pontos de recolha em todas as principais cidades de Angola. Em breve."
      }
    }
  },
  "en": {
    "delivery": {
      "title": "Delivery",
      "text": "Soon this page will describe the delivery conditions and list all our pick-up points, which will be available in all major cities of Angola.",
      "meta": {
        "title": "Delivery | Amoda",
        "description": "Information about delivery and pick-up points in all major cities of Angola. Coming soon."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader :title="t('delivery.title')" />

    <UPageBody>
      {{ t('delivery.text') }}
    </UPageBody>
  </UPage>
</template>
