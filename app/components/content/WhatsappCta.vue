<script setup lang="ts">
// ::whatsapp-cta{text="Falar no WhatsApp"} — кнопка wa.me внутри статьи блога
// с UTM: utm_source=blog&utm_medium=article&utm_campaign=<slug статьи>
const props = withDefaults(defineProps<{
  text?: string
  message?: string
}>(), {
  text: 'Falar no WhatsApp',
  message: 'Olá! Li o artigo no blog da Amoda e preciso de ajuda para escolher.',
});

const route = useRoute();
const articleSlug = computed(() => String(route.params.slug || 'blog'));

const { makeWhatsappHref } = useWhatsappLink();
const baseHref = makeWhatsappHref(() => props.message);

const href = computed(() => {
  const utm = new URLSearchParams([
    ['utm_source', 'blog'],
    ['utm_medium', 'article'],
    ['utm_campaign', articleSlug.value],
  ]);

  return `${baseHref.value}&${utm.toString()}`;
});
</script>

<template>
  <div class="not-prose my-8 flex justify-center">
    <UButton
      :to="href"
      target="_blank"
      size="xl"
      icon="i-simple-icons-whatsapp"
      class="rounded-full bg-[#25D366] px-6 text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe5d] hover:shadow-xl"
    >
      {{ text }}
    </UButton>
  </div>
</template>
