<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; message?: string } }>();

const { t } = useI18n();

const statusCode = computed(() => props.error?.statusCode ?? 500);

const is404 = computed(() => statusCode.value === 404);
const title = computed(() => (is404.value ? t('error.404.title') : t('error.generic.title')));
const description = computed(() => (is404.value ? t('error.404.text') : props.error?.message || t('error.generic.description')));

useHead(() => ({
  title: title.value,
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const localeRoute = useLocaleRoute();
const homePage = computed(() => localeRoute({ name: 'index' }));
</script>

<i18n lang="json">
{
  "en": {
    "error": {
      "404": {
        "title": "Page not found",
        "text": "The page may have been removed or the URL is incorrect."
      },
      "generic": {
        "title": "An error occurred",
        "description": "Something went wrong. Please refresh or try again later."
      },
      "actions": {
        "home": "Go to homepage",
        "back": "Go back"
      }
    }
  },
  "pt-AO": {
    "error": {
      "404": {
        "title": "Página não encontrada",
        "text": "A página pode ter sido removida ou o endereço está incorreto."
      },
      "generic": {
        "title": "Ocorreu um erro",
        "description": "Algo correu mal. Atualize a página ou tente novamente mais tarde."
      },
      "actions": {
        "home": "Ir para a página inicial",
        "back": "Voltar"
      }
    }
  }
}
</i18n>

<template>
  <UError
    :redirect="homePage.fullPath"
    :error="{
      statusCode: statusCode,
      statusMessage: title,
      message: description
    }"
  />
</template>
