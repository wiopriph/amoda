<script setup lang="ts">
const { t, locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const localeRoute = useLocaleRoute();

const items = computed(() => [
  {
    label: t('footer.delivery'),
    to: localeRoute({ name: 'delivery' }),
  },
  {
    label: t('footer.pickup'),
    to: localeRoute({ name: 'pickup-points' }),
  },
  {
    label: t('footer.returns'),
    to: localeRoute({ name: 'return-policy' }),
  },
  {
    label: t('footer.privacy'),
    to: localeRoute({ name: 'privacy-policy' }),
  },
  {
    label: t('footer.terms'),
    to: localeRoute({ name: 'terms-of-use' }),
  },
  {
    label: t('footer.contacts'),
    to: localeRoute({ name: 'contacts' }),
  },
]);
</script>

<i18n lang="json">
{
  "pt": {
    "footer": {
      "delivery": "Como comprar",
      "pickup": "Pontos de levantamento",
      "returns": "Devoluções",
      "privacy": "Política de Privacidade",
      "terms": "Termos de Utilização",
      "contacts": "Contactos",
      "rights": "Todos os direitos reservados."
    }
  },
  "en": {
    "footer": {
      "delivery": "How it works",
      "pickup": "Pickup points",
      "returns": "Returns",
      "privacy": "Privacy Policy",
      "terms": "Terms of Use",
      "contacts": "Contacts",
      "rights": "All rights reserved."
    }
  }
}
</i18n>

<template>
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        © {{ new Date().getFullYear() }} Amoda. {{ t('footer.rights') }}
      </p>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UButton
        v-for="lang in locales"
        :key="lang.code"
        :to="switchLocalePath(lang.code)"
        size="xs"
        :variant="locale === lang.code ? 'solid' : 'outline'"
      >
        {{ lang.name }}
      </UButton>
    </template>
  </UFooter>
</template>
