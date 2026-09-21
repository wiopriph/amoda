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

// Ссылки шапки и подвала — обычные NuxtLink: после перехода сбрасываем ошибку,
// иначе Nuxt продолжит показывать error.vue на новом маршруте.
// Хук снимаем при размонтировании, а несуществующие маршруты не трогаем —
// осевший afterEach сбрасывал новую 404 при возврате «назад», оставляя пустую страницу
const router = useRouter();

let removeAfterEach: (() => void) | undefined;

onMounted(() => {
  removeAfterEach = router.afterEach((to) => {
    if (to.matched.length) {
      clearError();
    }
  });
});

onUnmounted(() => {
  removeAfterEach?.();
});

const goTo = (path: string) => clearError({ redirect: path });
</script>

<template>
  <UApp>
    <AppHeader />

    <UMain>
      <UContainer>
        <section class="mx-auto max-w-6xl px-2 py-6 sm:px-4 sm:py-14 lg:py-20">
          <div class="grid items-center gap-7 sm:gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
                {{ statusCode }} · {{ title }}
              </p>

              <h1 class="mt-4 text-[2.5rem] font-black leading-[1.05] tracking-tight text-highlighted sm:mt-5 sm:text-6xl sm:leading-[1.02] lg:text-7xl">
                <template v-if="is404">
                  Este look<br>não está aqui.
                </template>

                <template v-else>
                  Algo<br>correu mal.
                </template>
              </h1>

              <p class="mt-4 max-w-md text-base text-muted sm:mt-6 sm:text-xl">
                <template v-if="is404">
                  Não encontrámos esta página.<br>Mas temos outras peças à tua espera.
                </template>

                <template v-else>
                  {{ description }}
                </template>
              </p>

              <div class="mt-7 flex flex-col gap-4 sm:mt-9 sm:flex-row sm:items-center sm:gap-x-8">
                <UButton
                  size="xl"
                  class="justify-center rounded-full px-8 py-3.5 font-semibold"
                  @click="goTo('/products')"
                >
                  Explorar a coleção
                </UButton>

                <UButton
                  variant="link"
                  color="neutral"
                  size="xl"
                  class="justify-center px-0 font-semibold underline underline-offset-8 sm:justify-start"
                  @click="goTo('/')"
                >
                  Voltar ao início
                </UButton>
              </div>
            </div>

            <!-- На мобилке фото первым — компактный широкий кадр вместо квадрата внизу -->
            <div class="order-first overflow-hidden rounded-3xl bg-pink-50 lg:order-none">
              <img
                src="/404-look.webp"
                alt="Cabide amoda com um vestido desenhado a tracejado e uma etiqueta 404"
                class="aspect-[4/3] w-full object-cover object-top lg:aspect-square"
                width="1000"
                height="1000"
                fetchpriority="high"
              >
            </div>
          </div>
        </section>
      </UContainer>
    </UMain>

    <AppFooter />
  </UApp>
</template>
