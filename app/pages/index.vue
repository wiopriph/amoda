<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { CONTACT_PHONE } from '~/constants/contacts';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'index' });

const { t, tm, rt } = useI18n();
const localeRoute = useLocaleRoute();
const route = useRoute();

useHead({
  title: t('home.title'),
  meta: [{ name: 'description', content: t('home.desc') }],
});

const { data, error } = await useFetch('/api/catalog/list', {
  query: { limit: 10, sort: 'new' },
  watch: [() => route.fullPath],
});

const items = computed(() => data.value?.items || []);

const WOMEN_SLUG = 'mulheres';

const startShoppingTo = computed(() =>
  localeRoute({ name: 'category-slug', params: { slug: WOMEN_SLUG } }),
);

const whatsappHref = computed(() => {
  const text = encodeURIComponent('Olá! Preciso de ajuda com um pedido na Amoda.');

  return `https://wa.me/${CONTACT_PHONE}?text=${text}`;
});

const headerLinks = computed(() => [
  {
    label: t('home.hero.ctaPrimary'),
    to: startShoppingTo,
    color: 'primary',
    variant: 'solid',
  },
  {
    label: t('home.hero.support'),
    icon: 'i-simple-icons-whatsapp',
    to: whatsappHref,
    target: '_blank',
    color: 'gray',
    variant: 'ghost',
  },
]);

/** АНАЛИТИКА (GA4 ecommerce) */
const { trackViewItemList, trackSelectItem } = useAnalyticsEvent();

const mapProductToGa4Item = (p: any, index?: number) => {
  const variantId = Number(p.default_variant_id);
  const sizeId = Number(p.default_size_id);

  if (!variantId || !sizeId) {
    return null;
  }

  return makeGa4Item({
    productId: p.id,
    name: p.title,
    brand: p.brand_name ?? undefined,
    price: p.price ?? 0,
    quantity: 1,
    variantId,
    sizeId,
    variantLabel: p.default_variant_color ?? undefined,
    sizeLabel: p.default_size_label ?? undefined,
    categoryName: p.primary_category_id ? String(p.primary_category_id) : undefined,
    index,
  });
};

if (import.meta.client) {
  watch(
    () => route.fullPath,
    () => {
      const ga4Items = items.value
        .map((p: any, i: number) => mapProductToGa4Item(p, i + 1))
        .filter(Boolean);

      trackViewItemList({
        listId: 'home_new',
        listName: 'New arrivals',
        items: ga4Items as any,
      });
    },
    { immediate: true },
  );
}

const sendSelectProductEvent = (product: any) => {
  const item = mapProductToGa4Item(product);

  if (!item) {
    return;
  }

  trackSelectItem({
    listId: 'home_new',
    listName: 'New arrivals',
    items: [item],
  });
};

const steps = computed(() =>
  tm('home.how.steps').map((s: any) => ({
    icon: rt(s.icon),
    title: rt(s.title),
    description: rt(s.desc),
  })),
);

const seoParagraphs = computed(() => tm('home.seo.text') as string[]);
</script>

<i18n lang="json">
{
  "pt": {
    "home": {
      "title": "Amoda — reserve e experimente no ponto",
      "desc": "Moda feminina em Angola. Reserve online sem pagamento, escolha o ponto e venha experimentar. Você decide na hora se quer levar.",
      "hero": {
        "title": "Moda feminina em Angola com prova antes de pagar",
        "subtitle": "Sem pagamento online. Escolha os itens, reserve e experimente — você decide na hora.",
        "ctaPrimary": "Começar a escolher",
        "support": "Suporte no WhatsApp"
      },
      "how": {
        "title": "Como funciona",
        "steps": [
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Escolha e reserve",
            "desc": "Escolha as peças e o tamanho. Reserve em segundos — sem conta e sem pagamento."
          },
          {
            "icon": "i-lucide-map-pin",
            "title": "Escolha o ponto",
            "desc": "Selecione o ponto de levantamento. Vamos preparar os itens para você experimentar."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Experimente e decida",
            "desc": "Experimente no ponto e leve só o que gostar. Sem compromisso."
          }
        ]
      },
      "showcase": {
        "title": "Novidades",
        "ctaAll": "Ver catálogo"
      },
      "seo": {
        "title": "Amoda - loja online de roupa feminina em Angola",
        "text": [
          "A Amoda ajuda você a escolher roupa online e experimentar no ponto.",
          "Reserve sem pagamento online: selecione os itens, escolha o ponto e venha experimentar.",
          "Dúvidas? Fale connosco no WhatsApp — respondemos rápido."
        ]
      }
    }
  },
  "en": {
    "home": {
      "title": "Amoda — reserve and try on at the point",
      "desc": "Women’s fashion in Angola. Reserve online with no payment, choose a pickup point, and come try on. You decide on the spot.",
      "hero": {
        "title": "Women’s fashion in Angola - try before you pay",
        "subtitle": "No online payment. Pick items, reserve, and try on — decide on the spot.",
        "ctaPrimary": "Start choosing",
        "support": "WhatsApp support"
      },
      "how": {
        "title": "How it works",
        "steps": [
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Choose & reserve",
            "desc": "Pick items and size. Reserve in seconds — no account, no payment."
          },
          {
            "icon": "i-lucide-map-pin",
            "title": "Choose the point",
            "desc": "Select a pickup point. We’ll prepare the items for fitting."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Try on & decide",
            "desc": "Try on at the point and take only what you like. No obligation."
          }
        ]
      },
      "showcase": {
        "title": "New arrivals",
        "ctaAll": "View catalog"
      },
      "seo": {
        "title": "Amoda - online women’s clothing store in Angola",
        "text": [
          "Amoda helps you choose online and try on at the pickup point.",
          "Reserve with no online payment: select items, choose a point, and come try on.",
          "Questions? Message us on WhatsApp — we respond quickly."
        ]
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody>
      <UPageCTA
        :links="headerLinks"
        variant="soft"
      >
        <template #header>
          <h1 class="text-3xl sm:text-4xl text-3xl sm:text-4xl lg:text-5xl text-pretty tracking-tight font-bold text-highlighted text-center">
            {{ t('home.hero.title') }}
          </h1>

          <p class="mt-6 text-base sm:text-lg text-center text-muted">
            {{ t('home.hero.subtitle') }}
          </p>
        </template>
      </UPageCTA>

      <UPageSection
        :title="t('home.how.title')"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <div class="grid gap-8 md:grid-cols-3">
          <article
            v-for="step in steps"
            :key="step.title"
            class="flex flex-col items-center text-center gap-3"
          >
            <div class="flex items-center justify-center w-16 h-16 rounded-full bg-gray-50">
              <UIcon
                :name="step.icon"
                class="w-7 h-7"
              />
            </div>

            <h3 class="text-base font-semibold">
              {{ step.title }}
            </h3>

            <p class="text-sm text-gray-600">
              {{ step.description }}
            </p>
          </article>
        </div>
      </UPageSection>

      <UPageSection
        :title="t('home.showcase.title')"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <div
          v-if="error"
          class="text-sm text-red-600"
        >
          Error loading products
        </div>

        <UBlogPosts
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <UBlogPost
            v-for="product in items"
            :key="product.id"
            :title="product.title"
            :description="`${new Intl.NumberFormat('pt-AO').format(product.price)} AOA`"
            :image="product.image || 'placeholder.webp'"
            :to="localeRoute({ name: 'product-slug', params: { slug: product.slug } })"
            :ui="{
              header: 'aspect-[4/5] object-cover',
              body: 'sm:p-3',
              title: 'line-clamp-2 overflow-hidden'
            }"
            variant="outline"
            @click="sendSelectProductEvent(product)"
          />
        </UBlogPosts>

        <div class="mt-6 flex justify-center">
          <UButton
            size="lg"
            variant="soft"
            :to="startShoppingTo"
          >
            {{ t('home.showcase.ctaAll') }}
          </UButton>
        </div>
      </UPageSection>
    </UPageBody>

    <UPageSection
      :title="t('home.seo.title')"
      :ui="{
        container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8',
        title: 'text-md font-semibold'
      }"
    >
      <div class="prose prose-sm sm:prose-base max-w-none">
        <p
          v-for="(p, i) in seoParagraphs"
          :key="i"
          class="text-center space-y-3"
          v-text="rt(p)"
        />
      </div>
    </UPageSection>
  </UPage>
</template>
