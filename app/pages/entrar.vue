<script setup lang="ts">
definePageMeta({ name: 'entrar' });

const title = 'Entrar | Amoda';
const description = 'Entra na tua conta Amoda com o teu número de telemóvel. Enviamos um código por SMS.';

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

const { user, resolveHomeRoute } = useAuth();
const route = useRoute();

const redirectTarget = computed(() => (route.query.redirected_from as string) || null);

if (user.value) {
  await navigateTo(redirectTarget.value || resolveHomeRoute());
}

const onSignedIn = (signedInUser: any) => navigateTo(redirectTarget.value || resolveHomeRoute(signedInUser));

const benefits = [
  { icon: 'i-lucide-list', title: 'Acompanha os teus pedidos' },
  { icon: 'i-heroicons-heart', title: 'Guarda favoritos' },
  { icon: 'i-lucide-zap', title: 'Pedidos mais rápidos' },
];
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-lg sm:px-6 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
          Entra na Amoda
        </h1>

        <p class="mt-2 text-sm leading-6 text-muted sm:text-base">
          Só precisas do teu número. Enviamos um código por SMS, sem palavras-passe.
        </p>

        <div class="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-toned">
          <div
            v-for="item in benefits"
            :key="item.title"
            class="flex items-center gap-2"
          >
            <UIcon
              :name="item.icon"
              class="size-4 text-primary"
            />

            <span v-text="item.title" />
          </div>
        </div>
      </section>

      <UCard class="mt-5">
        <AuthPhoneLogin @success="onSignedIn" />
      </UCard>

      <p class="mt-4 text-center text-xs leading-5 text-muted">
        Ao entrar, aceitas os
        <NuxtLink
          :to="{ name: 'terms-of-use' }"
          class="underline underline-offset-2"
        >
          termos de uso
        </NuxtLink>
        e a
        <NuxtLink
          :to="{ name: 'privacy-policy' }"
          class="underline underline-offset-2"
        >
          política de privacidade
        </NuxtLink>.
      </p>
    </UPageBody>
  </UPage>
</template>
