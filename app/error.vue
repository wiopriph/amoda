<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode?: number;
    message?: string
  }
}>();

const statusCode = computed(() => props.error?.statusCode ?? 500);

const is404 = computed(() => statusCode.value === 404);

const title = computed(() => (is404.value ? 'Página não encontrada' : 'Ocorreu um erro'));
const description = computed(() => (is404.value ? 'A página pode ter sido removida ou o endereço está incorreto.' : props.error?.message || 'Algo correu mal. Atualize a página ou tente novamente mais tarde.'));

useHead(() => ({
  title: title.value,
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));
</script>

<template>
  <UError
    :error="{
      statusCode: statusCode,
      statusMessage: title,
      message: description
    }"
    redirect="/"
  />
</template>
