<script setup lang="ts">
import { CONTACT_PHONE } from '~/constants/contacts';


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

const route = useRoute();
const hasWhatsappButton = computed(() => !route.name?.startsWith('product-slug'));
const whatsappHref = computed(() => {
  const text = encodeURIComponent('Olá! Preciso de ajuda com um pedido na Amoda.');

  return `https://wa.me/${CONTACT_PHONE}?text=${text}`;
});
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

    <a
      v-if="hasWhatsappButton"
      :href="whatsappHref"
      target="_blank"
      aria-label="WhatsApp support"
      class="
        fixed bottom-4 right-4 z-50
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-[#25D366] text-white
        shadow-lg
        hover:scale-105 hover:shadow-xl
        transition
      "
    >
      <UIcon
        name="i-simple-icons-whatsapp"
        class="w-7 h-7"
      />
    </a>
  </UApp>
</template>
