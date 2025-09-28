<script setup lang="ts">
const { t, locale, locales } = useI18n();
const localeRoute = useLocaleRoute();
const switchLocalePath = useSwitchLocalePath();

const colorMode = useColorMode();

const toggleTheme = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark';
};
</script>

<i18n lang="json">
{
  "pt-AO": {
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
  <footer class="border-t text-sm">
    <div class="container mx-auto px-3 py-6">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <nav class="flex gap-4">
          <NuxtLink
            :to="localeRoute({ name: 'delivery' })"
            class="hover:underline"
          >
            {{ t('footer.delivery') }}
          </NuxtLink>

          <NuxtLink
            :to="localeRoute({ name: 'contacts' })"
            class="hover:underline"
          >
            {{ t('footer.contacts') }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <template
            v-for="lang in locales"
            :key="lang.code"
          >
            <UButton
              :to="switchLocalePath(lang.code)"
              :variant="locale === lang.code ? 'solid' : 'outline'"
              size="xs"
              class="flex items-center gap-1"
            >
              <span>{{ lang.flag }}</span>

              <span class="hidden sm:inline">{{ lang.name }}</span>
            </UButton>
          </template>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <p class="text-xs">
          &copy; {{ new Date().getFullYear() }} Amoda. {{ t('footer.rights') }}
        </p>

        <UButton
          variant="ghost"
          size="xs"
          class="flex items-center gap-1 cursor-pointer"
          @click="toggleTheme"
        >
          <UIcon
            :name="colorMode.preference === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            class="w-4 h-4"
          />

          <span class="hidden sm:inline">
            {{ colorMode.preference === 'dark' ? 'Light' : 'Dark' }}
          </span>
        </UButton>
      </div>
    </div>
  </footer>
</template>
