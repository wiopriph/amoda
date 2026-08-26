<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';
import type { CatalogProductCard } from '#shared/types/catalog';


definePageMeta({ name: 'index' });

const title = 'Amoda - Moda feminina em Luanda ao alcance de todos';
const description = 'Escolha moda feminina online em Luanda, selecione sem pagar, experimente com calma e leve apenas as peças que combinam consigo.';

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:url', content: 'https://amoda.ao/' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ],
  link: [
    { rel: 'canonical', href: 'https://amoda.ao/' },
  ],
});

const route = useRoute();

const [
  { data: catalogResponse, error: catalogError },
  { data: featuredResponse },
  { data: categoriesResponse },
] = await Promise.all([
  useFetch('/api/catalog/list', {
    // 13 = 10 в сетку + запас на исключение товаров веера hero
    query: { limit: 13, sort: 'new' },
    watch: [() => route.fullPath],
  }),
  useFetch('/api/catalog/list', {
    query: { featured: 1, limit: 3 },
  }),
  useFetch('/api/categories/list'),
]);

const products = computed(() => catalogResponse.value?.items || []);

// Веер в hero: отмеченные «Destaque» в админке, пока их нет — свежие новинки
const heroProducts = computed(() => {
  const featured = featuredResponse.value?.items || [];

  return featured.length ? featured : products.value.slice(0, 3);
});

// Сетка новинок без товаров веера — иначе они дублируются на одном экране
const gridProducts = computed(() => {
  const heroIds = new Set(heroProducts.value.map(heroProduct => heroProduct.id));

  return products.value.filter(product => !heroIds.has(product.id)).slice(0, 10);
});

// Витрина категорий: все, кроме корневой (у корня нет parent_id)
const showcaseCategories = computed(() =>
  (categoriesResponse.value || []).filter((category: any) => category.parent_id),
);


const { trackViewItemList, trackSelectItem } = useAnalyticsEvent();

const mapProductToGa4Item = (product: CatalogProductCard, index?: number) => {
  const variantId = Number(product.default_variant_id);
  const sizeId = Number(product.default_size_id);

  if (!variantId || !sizeId) {
    return null;
  }

  return makeGa4Item({
    productId: product.id,
    name: product.title,
    brand: product.brand_name ?? undefined,
    price: product.price ?? 0,
    quantity: 1,
    variantId,
    sizeId,
    variantLabel: product.default_variant_color ?? undefined,
    sizeLabel: product.default_size_label ?? undefined,
    categoryName: product.primary_category_id ? String(product.primary_category_id) : undefined,
    index,
  });
};

if (import.meta.client) {
  watch(
    () => route.fullPath,
    () => {
      const analyticsItems = gridProducts.value
        .map((product, productIndex) => mapProductToGa4Item(product, productIndex + 1))
        .filter(Boolean);

      trackViewItemList({
        listId: 'home_new',
        listName: 'Home new arrivals',
        items: analyticsItems as any,
      });
    },
    { immediate: true },
  );
}

const sendSelectProductEvent = (product: CatalogProductCard) => {
  const analyticsItem = mapProductToGa4Item(product);

  if (!analyticsItem) {
    return;
  }

  trackSelectItem({
    listId: 'home_new',
    listName: 'Home new arrivals',
    items: [analyticsItem],
  });
};

// Один блок «Como funciona» вместо «Como comprar» + «Por que comprar»:
// выгоды вшиты в шаги, каждое сообщение звучит на странице один раз
const shoppingSteps = [
  {
    icon: 'i-lucide-shopping-bag',
    title: '1 · Escolhe no site',
    description: 'Adiciona as peças que queres experimentar e envia o pedido. Sem pagamento online.',
  },
  {
    icon: 'i-lucide-shirt',
    title: '2 · Experimenta com calma',
    description: 'Entregamos em casa ou no ponto. Vês o tamanho, o tecido e o caimento ao vivo.',
  },
  {
    icon: 'i-lucide-wallet',
    title: '3 · Pagas só o que gostar',
    description: 'Em dinheiro ou TPA na entrega. O resto devolves na hora, e tens troca fácil em 7 dias.',
  },
];

// Компактный SEO-абзац на «tu», без повторов сообщений страницы
const seoDescription = 'A Amoda é uma loja online de roupa feminina em Angola. Escolhes as peças no site, recebes sem pagamento antecipado e experimentas antes de decidir. Se gostares, levas e pagas na hora — em dinheiro ou TPA. Se não gostares, devolves sem custo. Entregamos em Luanda e enviamos para as províncias.';

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => 'Olá! Preciso de ajuda para escolher peças na Amoda.');

const startShoppingTo = { name: 'products' } as const;
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-6xl sm:px-6 lg:px-8">
      <HomeHero :products="heroProducts" />

      <section class="mt-6 sm:mt-10">
        <div class="flex items-baseline justify-between gap-3">
          <h2 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
            Novidades
          </h2>

          <NuxtLink
            :to="startShoppingTo"
            class="shrink-0 text-sm font-semibold text-primary transition hover:text-primary/80"
          >
            Ver todos →
          </NuxtLink>
        </div>

        <UAlert
          v-if="catalogError"
          class="mt-5"
          color="error"
          variant="soft"
          title="Erro ao carregar os produtos."
        />

        <UBlogPosts
          v-else
          class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4"
        >
          <ProductCard
            v-for="product in gridProducts"
            :key="product.id"
            :product="product"
            @select="sendSelectProductEvent(product)"
          />
        </UBlogPosts>
      </section>

      <section
        v-if="showcaseCategories.length"
        class="mt-6 sm:mt-10"
      >
        <h2 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
          Categorias
        </h2>

        <!-- Плитка: все категории видны сразу, без горизонтального скролла -->
        <nav
          aria-label="Categorias da loja"
          class="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-4 lg:grid-cols-5"
        >
          <NuxtLink
            v-for="showcaseCategory in showcaseCategories"
            :key="showcaseCategory.slug"
            :to="{ name: 'category-slug', params: { slug: showcaseCategory.slug } }"
            class="group relative overflow-hidden rounded-2xl bg-gray-100 transition hover:shadow-md"
          >
            <div class="aspect-[3/4] overflow-hidden">
              <img
                v-if="showcaseCategory.image"
                :src="showcaseCategory.image"
                :alt="showcaseCategory.name"
                loading="lazy"
                class="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
              >
            </div>

            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

            <div class="absolute bottom-2 left-2.5 right-2.5 text-xs font-bold leading-tight text-white sm:text-sm">
              {{ showcaseCategory.name }}
            </div>
          </NuxtLink>
        </nav>
      </section>

      <section class="mt-6 sm:mt-10">
        <h2 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
          Como funciona
        </h2>

        <div class="mt-5 grid gap-3 md:grid-cols-3 sm:gap-4">
          <div
            v-for="step in shoppingSteps"
            :key="step.title"
            class="rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
          >
            <div class="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UIcon
                :name="step.icon"
                class="size-5"
              />
            </div>

            <h3
              class="mt-4 font-bold text-highlighted"
              v-text="step.title"
            />

            <p
              class="mt-2 text-sm leading-6 text-muted"
              v-text="step.description"
            />
          </div>
        </div>
      </section>

      <TrustProofs />

      <section class="mt-8 border-t border-gray-100 pt-6 sm:mt-12">
        <h2 class="text-sm font-bold text-muted">
          Loja online de roupa feminina em Luanda
        </h2>

        <p
          class="mt-2 text-xs leading-6 text-dimmed sm:text-sm"
          v-text="seoDescription"
        />
      </section>
    </UPageBody>

    <WhatsappButton
      :to="whatsappHref"
      aria-label="Falar com a Amoda no WhatsApp"
    />
  </UPage>
</template>
