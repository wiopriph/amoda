<script setup lang="ts">
const { t, locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();


const localeRoute = useLocaleRoute();

const items = computed(() => [{
  label: t('footer.delivery'),
  to: localeRoute({ name: 'delivery' }),
}, {
  label: t('footer.contacts'),
  to: localeRoute({ name: 'contacts' }),
}]);
</script>

<i18n lang="json">
{
  "pt": {
    "footer": {
      "delivery": "Entrega",
      "contacts": "Contactos",
      "rights": "Todos os direitos reservados."
    }
  },
  "en": {
    "footer": {
      "delivery": "Delivery",
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
        Copyright © {{ new Date().getFullYear() }}
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
        class="flex items-center gap-1"
      >
        <span>{{ lang.flag }}</span>

        <span class="hidden sm:inline">{{ lang.name }}</span>
      </UButton>
    </template>
  </UFooter>
</template>
