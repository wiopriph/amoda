<script setup lang="ts">
const { t, locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const localeRoute = useLocaleRoute();

const links = computed(() => [
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

const availableLocales = computed(() => locales.value.filter(i => i.code !== locale.value));
</script>

<i18n lang="json">
{
  "pt": {
    "footer": {
      "delivery": "Como comprar",
      "pickup": "Pontos de levantamento",
      "returns": "Devoluções",
      "privacy": "Privacidade",
      "terms": "Termos",
      "contacts": "Contactos",
      "rights": "Todos os direitos reservados."
    }
  },
  "en": {
    "footer": {
      "delivery": "How it works",
      "pickup": "Pickup points",
      "returns": "Returns",
      "privacy": "Privacy",
      "terms": "Terms",
      "contacts": "Contacts",
      "rights": "All rights reserved."
    }
  }
}
</i18n>

<template>
  <footer class="border-t border-gray-100 bg-white">
    <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav class="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm sm:gap-x-6">
        <NuxtLink
          v-for="item in links"
          :key="item.label"
          :to="item.to"
          class="text-muted transition hover:text-primary"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="mt-6 flex flex-col items-center gap-3 border-t pt-4 sm:flex-row sm:justify-between">
        <p class="text-xs text-muted text-center sm:text-left">
          © {{ new Date().getFullYear() }} Amoda. {{ t('footer.rights') }}
        </p>

        <div class="flex gap-2">
          <a
            v-for="lang in availableLocales"
            :key="lang.code"
            :href="switchLocalePath(lang.code)"
          >
            <UButton
              as="span"
              variant="outline"
              size="xs"
            >
              {{ lang.name }}
            </UButton>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
