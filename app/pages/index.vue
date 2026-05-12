<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'index' });

const title = 'Amoda - Moda feminina em Luanda ao alcance de todos';
const description = 'Escolha moda feminina online em Luanda, selecione sem pagar, experimente com calma e leve apenas as peças que combinam consigo.';

useHead({
  title,
  meta: [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { name: 'description', content: description },
  ],
});

const route = useRoute();

const { data: heroContent } = await useFetch('/api/home/hero');
const { data: catalogResponse, error: catalogError } = await useFetch('/api/catalog/list', {
  query: { limit: 10, sort: 'new' },
  watch: [() => route.fullPath],
});

const products = computed(() => catalogResponse.value?.items || []);


const { trackViewItemList, trackSelectItem } = useAnalyticsEvent();

const mapProductToGa4Item = (product: any, index?: number) => {
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
      const analyticsItems = products.value
        .map((product: any, productIndex: number) => mapProductToGa4Item(product, productIndex + 1))
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

const sendSelectProductEvent = (product: any) => {
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

const shoppingSteps = [
  {
    icon: 'i-lucide-shopping-bag',
    title: 'Escolha o look',
    description: 'Veja os produtos no site e adicione ao pedido as peças que quer experimentar.',
  },
  {
    icon: 'i-lucide-message-circle',
    title: 'Escolha sem pagar',
    description: 'Envie o pedido com seu nome e WhatsApp. Não precisa pagar online.',
  },
  {
    icon: 'i-lucide-shirt',
    title: 'Experimente e decida',
    description: 'Veja as peças ao vivo, experimente e pague apenas pelo que gostar.',
  },
];

const benefits = [
  {
    icon: 'i-lucide-wallet',
    title: 'Sem pagamento online',
    description: 'Você seleciona primeiro e paga só quando decidir levar.',
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Prova antes de comprar',
    description: 'Veja tamanho, tecido e caimento antes de finalizar.',
  },
  {
    icon: 'i-simple-icons-whatsapp',
    title: 'Atendimento no WhatsApp',
    description: 'A nossa equipa ajuda com escolha, tamanho e ponto de experimentação.',
  },
];

const seoDescriptionParagraphs = [
  'A Amoda é uma loja online de roupa feminina em Angola feita para quem quer comprar com mais segurança.',
  'Você escolhe as peças online, seleciona sem pagamento antecipado e experimenta antes de decidir.',
  'Se gostar, leva e paga. Se não gostar, não precisa comprar.',
] as const;

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => 'Olá! Preciso de ajuda para escolher peças na Amoda.');

const startShoppingTo = { name: 'category-slug', params: { slug: 'mulheres' } } as const;
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-6xl sm:px-6 lg:px-8">
      <HomeHero
        :title="heroContent?.title ?? ''"
        :subtitle="heroContent?.subtitle ?? ''"
        :socialProof="heroContent?.socialProof ?? ''"
        :bullets="heroContent?.bullets?.length ? heroContent.bullets : undefined"
        :ctaPrimary="heroContent?.ctaPrimary ?? ''"
        :whatsappLabel="heroContent?.whatsappLabel ?? ''"
        :tiktokTitle="heroContent?.tiktokTitle ?? ''"
        :tiktokSubtitle="heroContent?.tiktokSubtitle ?? ''"
        :isTiktokLive="heroContent?.isTiktokLive ?? false"
        :imageUrl="heroContent?.imageUrl ?? ''"
      />

      <section class="mt-6 sm:mt-10">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
              Novidades para experimentar
            </h2>

            <p class="mt-2 text-sm text-muted sm:text-base">
              Peças selecionadas para você montar o seu próximo look.
            </p>
          </div>

          <UButton
            :to="startShoppingTo"
            variant="soft"
            class="hidden sm:inline-flex"
          >
            Ver todos os produtos
          </UButton>
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
          <UBlogPost
            v-for="(product, productIndex) in products"
            :key="product.id"
            :title="product.title"
            :description="`${new Intl.NumberFormat('pt-AO').format(product.price)} AOA`"
            :image="product.image || 'placeholder.webp'"
            :to="{ name: 'product-slug', params: { slug: product.slug } }"
            :ui="{
              root: 'group overflow-hidden border border-gray-100 rounded-2xl hover:shadow-md transition',
              header: 'aspect-[4/5] overflow-hidden bg-gray-50',
              image: 'h-full w-full object-cover transition duration-300 group-hover:scale-105',
              body: 'sm:p-3',
              title: 'text-sm font-semibold text-highlighted line-clamp-2 min-h-[40px]',
              description: 'mt-2 text-sm font-bold text-primary'
            }"
            variant="outline"
            @click="sendSelectProductEvent(product)"
          >
            <template #badge>
              <UBadge
                v-if="productIndex < 3"
                color="primary"
                variant="solid"
                class="absolute top-2 left-2"
              >
                NOVO
              </UBadge>
            </template>
          </UBlogPost>
        </UBlogPosts>

        <div class="mt-5 sm:hidden">
          <UButton
            :to="startShoppingTo"
            size="lg"
            class="w-full justify-center"
          >
            Ver todos os produtos
          </UButton>
        </div>
      </section>

      <section class="mt-6 sm:mt-10">
        <UCard class="overflow-hidden">
          <div class="flex flex-col gap-6">
            <div>
              <h2 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
                Como comprar na Amoda
              </h2>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
              <div
                v-for="step in shoppingSteps"
                :key="step.title"
                class="relative rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
              >
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UIcon
                      :name="step.icon"
                      class="size-5"
                    />
                  </div>
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
          </div>
        </UCard>
      </section>

      <section class="mt-6 sm:mt-10">
        <UCard class="border-primary/20 bg-primary/5">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
              Por que comprar com a Amoda?
            </h2>
          </div>

          <div class="mt-5 grid gap-3 md:grid-cols-3">
            <div
              v-for="benefit in benefits"
              :key="benefit.title"
              class="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div class="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UIcon
                  :name="benefit.icon"
                  class="size-5"
                />
              </div>

              <h3
                class="mt-4 font-bold text-highlighted"
                v-text="benefit.title"
              />

              <p
                class="mt-2 text-sm leading-6 text-muted"
                v-text="benefit.description"
              />
            </div>
          </div>
        </UCard>
      </section>

      <section class="mt-6 sm:mt-10">
        <div class="text-center">
          <h2 class="text-lg font-bold text-highlighted">
            Loja online de roupa feminina em Luanda
          </h2>

          <div class="mt-4 space-y-1 text-sm leading-7 text-muted">
            <p
              v-for="paragraph in seoDescriptionParagraphs"
              :key="paragraph"
              v-text="paragraph"
            />
          </div>
        </div>
      </section>
    </UPageBody>

    <WhatsappButton
      :to="whatsappHref"
      aria-label="Falar com a Amoda no WhatsApp"
    />
  </UPage>
</template>
