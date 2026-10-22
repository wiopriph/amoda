<script setup lang="ts">
/* eslint-disable camelcase */


definePageMeta({
  name: 'favorites',
  middleware: [
    () => {
      const { user } = useAuth();

      if (user.value) {
        setPageLayout('account');
      }
    },
  ],
});

const title = 'Favoritos | Amoda';
const description = 'Os artigos que guardaste para ver mais tarde na Amoda.';

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const { items, isEmpty } = useFavorites();
const { user } = useAuth();

// В layout кабинета отступы и ширину задаёт сам layout
const isAccountLayout = computed(() => useRoute().meta.layout === 'account');

const favoriteCards = computed(() => items.value.map(item => ({
  id: item.productId,
  slug: item.slug,
  title: item.title,
  brand_name: item.brandName,
  price: item.price,
  image: item.image,
})));
</script>

<template>
  <div :class="isAccountLayout ? 'space-y-5' : 'mx-auto mt-4 max-w-6xl space-y-5 pb-24 sm:mt-8 sm:px-6 lg:px-8'">
    <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-4 shadow-sm sm:p-8">
      <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
        Favoritos
      </h1>

      <p class="mt-2 text-sm leading-6 text-muted sm:text-base">
        Guarda o que gostares e volta quando quiseres — sem compromisso.
      </p>

      <!-- Гостевое избранное живёт в localStorage и теряется при смене аппарата -->
      <p
        v-if="!user && !isEmpty"
        class="mt-3 text-sm leading-6 text-muted"
      >
        Guardados só neste aparelho.

        <NuxtLink
          :to="{ name: 'entrar', query: { redirected_from: '/favorites' } }"
          class="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Entra com o teu número
        </NuxtLink>

        para não os perderes se trocares de telefone.
      </p>
    </section>

    <UEmpty
      v-if="isEmpty"
      icon="i-heroicons-heart"
      title="Ainda não guardaste nada."
      description="Toca no coração de um artigo para o guardar aqui."
    >
      <template #actions>
        <UButton
          :to="{ name: 'index' }"
          color="primary"
        >
          Ver novidades
        </UButton>
      </template>
    </UEmpty>

    <UBlogPosts
      v-else
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4"
    >
      <ProductCard
        v-for="favoriteCard in favoriteCards"
        :key="favoriteCard.id"
        :product="favoriteCard"
      />
    </UBlogPosts>
  </div>
</template>
