<script setup lang="ts">
// Cloudflare Turnstile: защита формы «пришли код» от накрутки SMS. Без ключа компонент ничего не рендерит.
const token = defineModel<string>({ default: '' });

const { turnstileSiteKey } = useRuntimeConfig().public;
const container = ref<HTMLElement | null>(null);

let widgetId: string | null = null;

const render = () => {
  const turnstile = (window as any).turnstile;

  if (!turnstile || !container.value || widgetId) {
    return;
  }

  widgetId = turnstile.render(container.value, {
    sitekey: turnstileSiteKey,
    callback: (value: string) => {
      token.value = value;
    },
    'expired-callback': () => {
      token.value = '';
    },
  });
};

const reset = () => {
  token.value = '';
  (window as any).turnstile?.reset(widgetId);
};

defineExpose({ reset });

if (turnstileSiteKey) {
  useHead({
    script: [{
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__amodaTurnstileReady&render=explicit',
      async: true,
      defer: true,
    }],
  });

  onMounted(() => {
    (window as any).__amodaTurnstileReady = render;
    render();
  });
}
</script>

<template>
  <div
    v-if="turnstileSiteKey"
    ref="container"
  />
</template>
