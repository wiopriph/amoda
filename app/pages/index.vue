<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';


definePageMeta({ name: 'index' });

const { t, tm, rt } = useI18n();
const localeRoute = useLocaleRoute();
const route = useRoute();

useHead({
  title: t('home.title'),
  meta: [{ name: 'description', content: t('home.desc') }],
});

const { data, error } = await useFetch('/api/catalog/list', {
  query: { limit: 5 },
  watch: [() => route.fullPath],
}); // рандомные, с разных категорий

const items = computed(() => data.value?.items || []);

const { data: categories } = await useFetch('/api/categories/list');

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
      "title": "Moda Angola — Comprar roupas online com entrega gratuita | Amoda",
      "desc": "Loja de roupas online em Angola. Compre roupas com entrega gratuita em Luanda. Moda acessível, rápida e segura — experimente antes de pagar.",
      "categoriesTitle": "Categorias",
      "showcase": "Em destaque",
      "how": {
        "title": "Como funciona?",
        "steps": [
          {
            "icon": "i-lucide-truck",
            "title": "Entrega no dia seguinte",
            "desc": "Em Luanda e em outras grandes cidades de Angola, você receberá o seu pedido já no dia seguinte! Informações mais detalhadas sobre as condições de entrega para a sua cidade podem ser encontradas aqui."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Prova antes da compra",
            "desc": "A loja online AMBO Moda oferece a possibilidade de experimentar roupas, calçados e outros produtos antes de pagar pela entrega. Pague apenas pelo que lhe serviu e agradou!"
          },
          {
            "icon": "i-lucide-wallet",
            "title": "Formas de pagamento convenientes",
            "desc": "Você pode pagar as suas compras não apenas em dinheiro, mas também com cartão bancário. Todos os entregadores da AMBO Moda têm consigo um terminal para pagamento com cartão."
          }
        ]
      },
      "seo": {
        "h1": "Roupas online em Angola com entrega gratuita — Amoda",
        "text": [
          "A Amoda é a loja de moda online nº1 em Angola.",
          "Faça as suas compras online, levante no ponto de entrega e pague apenas se gostar — simples, rápido e seguro.",
          "Descubra as últimas tendências em moda Angola, com qualidade, estilo e os melhores preços."
        ]
      }
    }
  },
  "en": {
    "home": {
      "title": "Fashion Angola — Buy clothes online with free delivery | Amoda",
      "desc": "Online clothing store in Angola. Free delivery in Luanda. Affordable, safe and easy — try before you pay.",
      "categoriesTitle": "Categories",
      "showcase": "Featured",
      "how": {
        "title": "How it works",
        "steps": [
          {
            "icon": "i-lucide-truck",
            "title": "Next-day delivery",
            "desc": "In Luanda and other major cities in Angola, you can receive your order as soon as the next day! More detailed information about delivery conditions for your area can be found here."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Try before you buy",
            "desc": "The AMBO Moda online store allows you to try on clothing, shoes and other items before paying for the delivery. Pay only for the items that fit you and that you genuinely like!"
          },
          {
            "icon": "i-lucide-wallet",
            "title": "Convenient payment options",
            "desc": "You can pay for your purchases not only in cash but also by bank card. All AMBO Moda couriers carry a POS terminal for secure card payments."
          }
        ]
      },
      "seo": {
        "h1": "Online clothing in Angola — Free delivery with Amoda",
        "text": [
          "Amoda is Angola’s leading online fashion store.",
          "Shop online, pick up your order locally and pay only for what you keep — fast, safe and convenient.",
          "Find the latest Angola fashion trends, stylish outfits and great prices."
        ]
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader :title="t('home.title')" />

    <UPageBody>
      <CategoriesPills
        v-if="categories?.length"
        :list="categories"
      />

      <UPageSection
        :title="t('home.how.title')"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col py-8 sm:py-10 lg:py-12'
        }"
      >
        <div class="grid gap-10 md:grid-cols-3">
          <article
            v-for="step in steps"
            :key="step.title"
            class="flex flex-col items-center text-center gap-4"
          >
            <div class="flex items-center justify-center w-20 h-20 rounded-full bg-gray-50">
              <UIcon
                :name="step.icon"
                class="w-8 h-8"
              />
            </div>

            <div class="space-y-2">
              <h3 class="text-base font-semibold">
                {{ step.title }}
              </h3>

              <p class="text-sm text-gray-600">
                {{ step.description }}
              </p>
            </div>
          </article>
        </div>
      </UPageSection>

      <UPageSection
        :title="t('home.showcase')"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <div
          v-if="error"
          class="text-sm text-red-600"
        >
          Error
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
      </UPageSection>

      <UPageSection
        :title="t('home.seo.h1')"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col py-8 sm:py-10 lg:py-12 gap-4 sm:gap-5',
          title: 'text-md font-semibold'
        }"
      >
        <div class="prose prose-sm sm:prose-base max-w-none">
          <p
            v-for="(p, i) in seoParagraphs"
            :key="i"
            v-text="rt(p)"
          />
        </div>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>
