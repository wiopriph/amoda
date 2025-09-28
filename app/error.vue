<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; message?: string } }>();
const { t } = useI18n();
const router = useRouter();

const is404 = computed(() => (props.error?.statusCode ?? 500) === 404);
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

const goHome = () => router.push('/');
const goBack = () => router.back();
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
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <main class="flex-1 container mx-auto">
      <section class="container mx-auto px-3 py-16 max-w-2xl text-center">
        <h1 class="text-3xl font-bold mb-3">
          {{ title }}
        </h1>

        <p
          v-if="is404"
          class="text-gray-500 mb-6"
        >
          {{ t('error.404.text') }}
        </p>

        <p
          v-else
          class="text-gray-500 mb-6"
        >
          {{ description }}
        </p>

        <div class="flex items-center justify-center gap-3">
          <UButton
            variant="outline"
            @click="goBack"
          >
            {{ t('error.actions.back') }}
          </UButton>

          <UButton @click="goHome">
            {{ t('error.actions.home') }}
          </UButton>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>
