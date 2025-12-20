<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { CONTACT_PHONE } from '~/constants/contacts';


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


const { trackSelectItem } = useAnalyticsEvent();

const sendSelectProductEvent = (product: any) => {
  trackSelectItem({
    itemId: product.id,
    itemName: product.title,
    price: product.price,
    categoryId: product.primary_category_id,
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
      "title": "Amoda - moda em Angola com prova antes de pagar",
      "desc": "Loja online de roupa feminina em Angola. Encomende online, receba no ponto de entrega, experimente e pague apenas pelo que decidir ficar.",
      "hero": {
        "title": "Moda feminina em Angola com prova antes de pagar",
        "subtitle": "Escolha online, receba no ponto de entrega, experimente e pague só se gostar.",
        "ctaPrimary": "Começar a comprar",
        "support": "Suporte no WhatsApp"
      },
      "how": {
        "title": "Como funciona",
        "steps": [
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Escolha online",
            "desc": "Escolha roupas femininas no site da Amoda. Veja fotos reais, preços e tamanhos disponíveis. Não é necessário criar conta."
          },
          {
            "icon": "i-lucide-map-pin",
            "title": "Receba no ponto de entrega",
            "desc": "Após o pedido, o produto é enviado para um ponto de entrega. Você será avisada quando o pedido estiver pronto para retirada."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Experimente antes de pagar",
            "desc": "No ponto de entrega, experimente a roupa. Se gostar e servir - paga. Se não servir ou não gostar - não paga nada."
          }
        ]
      },
      "showcase": {
        "title": "Novidades",
        "ctaAll": "Ver todos os produtos"
      },
      "seo": {
        "title": "Amoda - loja online de roupa feminina em Angola",
        "text": [
          "A Amoda é uma loja online de roupa feminina em Angola.",
          "Encomende online, receba no ponto de entrega, experimente e pague apenas pelo que decidir ficar.",
          "Se tiver dúvidas, fale conosco no WhatsApp - ajudamos rapidamente."
        ]
      }
    }
  },
  "en": {
    "home": {
      "title": "Amoda - women’s fashion in Angola, try before you pay",
      "desc": "Online store for women’s clothing in Angola. Order online, receive at a pickup point, try on and pay only for what you keep.",
      "hero": {
        "title": "Women’s fashion in Angola - try before you pay",
        "subtitle": "Order online, receive at a pickup point, try on and pay only if it fits.",
        "ctaPrimary": "Start shopping",
        "support": "WhatsApp support"
      },
      "how": {
        "title": "How it works",
        "steps": [
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Choose online",
            "desc": "Browse women’s clothing on Amoda. View real photos, prices and available sizes. No account required."
          },
          {
            "icon": "i-lucide-map-pin",
            "title": "Pickup point delivery",
            "desc": "After placing an order, the item is delivered to a pickup point. You’ll be notified when it’s ready."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Try before you pay",
            "desc": "At the pickup point, try the item on. Like it and it fits - pay. Don’t like it - return it and pay nothing."
          }
        ]
      },
      "showcase": {
        "title": "New arrivals",
        "ctaAll": "View all products"
      },
      "seo": {
        "title": "Amoda - online women’s clothing store in Angola",
        "text": [
          "Amoda is an online store for women’s clothing in Angola.",
          "Order online, receive at a pickup point, try on, and pay only for what you keep.",
          "Questions? Message us on WhatsApp - we respond quickly."
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
            :image="product.images?.[0]?.url || 'placeholder.webp'"
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
      <div class="prose prose-sm sm:prose-base max-w-none text-gray-700">
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
