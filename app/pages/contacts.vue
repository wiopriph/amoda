<script setup lang="ts">
definePageMeta({ name: 'contacts' });

const { t } = useI18n();

useHead(() => ({
  title: t('contacts.meta.title'),
  meta: [
    { name: 'description', content: t('contacts.meta.description') },
    { property: 'og:title', content: t('contacts.meta.title') },
    { property: 'og:description', content: t('contacts.meta.description') },
  ],
}));
</script>

<i18n lang="json">
{
  "pt-AO": {
    "contacts": {
      "title": "Contactos",
      "text": "Em breve aqui serão apresentadas todas as formas de entrar em contacto connosco: telefone, email, redes sociais e outros meios.",
      "meta": {
        "title": "Contactos | Amoda",
        "description": "Informações de contacto: telefone, email e redes sociais. Em breve disponíveis."
      }
    }
  },
  "en": {
    "contacts": {
      "title": "Contacts",
      "text": "Soon this page will provide all the ways to contact us: phone, email, social networks, and other channels.",
      "meta": {
        "title": "Contacts | Amoda",
        "description": "Contact information: phone, email, and social networks. Coming soon."
      }
    }
  }
}
</i18n>

<template>
  <section class="container mx-auto px-3 py-6 max-w-3xl">
    <h1 class="text-xl font-semibold mb-4">
      {{ t('contacts.title') }}
    </h1>

    <p class="text-gray-600 dark:text-gray-300">
      {{ t('contacts.text') }}
    </p>
  </section>
</template>
