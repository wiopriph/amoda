<script setup lang="ts">
/* eslint-disable camelcase */


definePageMeta({ name: 'favorites' });

const title = 'Favoritos | Amoda';
const description = 'Os artigos que guardou para ver mais tarde na Amoda.';

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const { items, isEmpty } = useFavorites();

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
  <UPage>
    <UPageBody class="mx-auto mt-4 max-w-6xl space-y-5 sm:mt-8 sm:px-6 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-4 shadow-sm sm:p-8">
        <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
          Favoritos
        </h1>

        <p class="mt-2 text-sm leading-6 text-muted sm:text-base">
          Guarde o que gostar e volte quando quiser — sem compromisso.
        </p>
      </section>

      <UEmpty
        v-if="isEmpty"
        icon="i-heroicons-heart"
        title="Ainda não guardou nada."
        description="Toque no coração de um artigo para o guardar aqui."
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
    </UPageBody>
  </UPage>
</template>
