<script setup lang="ts">
definePageMeta({ name: 'index' });

const { t, tm, rt } = useI18n();
const localeRoute = useLocaleRoute();
const route = useRoute();

useHead({
  title: t('home.title'),
  meta: [{ name: 'description', content: t('home.desc') }],
});

const { data, error } = await useFetch('/api/catalog/list', {
  query: { limit: 15 },
  watch: [() => route.fullPath],
});

const items = computed(() => data.value?.items || []);

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
      "desc": "Loja de roupas online em Angola. Compre roupas femininas, masculinas e infantis com entrega gratuita em Luanda. Moda acessível, rápida e segura — experimente antes de pagar.",
      "heroTitle": "Moda online fácil e segura",
      "heroSubtitle": "Compre roupas online em Angola, receba no ponto de entrega e pague apenas se gostar.",
      "heroButton": "Comprar agora",
      "women": "Mulheres",
      "men": "Homens",
      "kids": "Crianças",
      "showcase": "Em destaque",
      "featuresTitle": "Por que escolher a Amoda?",
      "features": {
        "delivery": {
          "title": "Entrega gratuita",
          "desc": "Recolha o seu pedido em Luanda sem custos adicionais."
        },
        "secure": {
          "title": "Compra segura",
          "desc": "Pague apenas depois de experimentar e confirmar o produto."
        },
        "cheap": {
          "title": "Preços acessíveis",
          "desc": "As melhores ofertas em roupas e moda online em Angola."
        }
      },
      "chooseGender": "Compre por categoria",
      "how": {
        "title": "Como funciona?",
        "steps": [
          {
            "icon": "i-lucide-search",
            "title": "Escolha online",
            "desc": "Veja roupas, sapatos e acessórios e adicione ao carrinho."
          },
          {
            "icon": "i-lucide-truck",
            "title": "Entrega no ponto",
            "desc": "Encomende gratuitamente para o ponto de entrega mais próximo."
          },
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Experimente e pague",
            "desc": "Experimente no local e pague apenas se quiser ficar com o produto."
          }
        ]
      },
      "seo": {
        "h1": "Roupas online em Angola com entrega gratuita — Amoda",
        "text": [
          "A Amoda é a loja de moda online nº1 em Angola. Aqui pode comprar roupas femininas, masculinas e infantis com entrega gratuita em Luanda.",
          "Faça as suas compras online, levante no ponto de entrega e pague apenas se gostar — simples, rápido e seguro.",
          "Descubra as últimas tendências em moda Angola, com qualidade, estilo e os melhores preços. Comprar roupas online nunca foi tão fácil."
        ]
      }
    }
  },
  "en": {
    "home": {
      "title": "Fashion Angola — Buy clothes online with free delivery | Amoda",
      "desc": "Online clothing store in Angola. Shop women’s, men’s and kids’ fashion with free delivery in Luanda. Affordable, safe and easy — try before you pay.",
      "heroTitle": "Easy and safe online fashion",
      "heroSubtitle": "Buy clothes online in Angola, get free delivery and pay only if you love it.",
      "heroButton": "Shop now",
      "women": "Women",
      "men": "Men",
      "kids": "Kids",
      "showcase": "Featured",
      "featuresTitle": "Why choose Amoda?",
      "features": {
        "delivery": {
          "title": "Free delivery",
          "desc": "Collect your order in Luanda with no extra fees."
        },
        "secure": {
          "title": "Secure shopping",
          "desc": "Try on first — pay only if you decide to keep it."
        },
        "cheap": {
          "title": "Best prices",
          "desc": "Affordable fashion and clothing online in Angola."
        }
      },
      "chooseGender": "Shop by category",
      "how": {
        "title": "How it works",
        "steps": [
          {
            "icon": "i-lucide-search",
            "title": "Choose online",
            "desc": "Browse clothes, shoes and accessories and add to your cart."
          },
          {
            "icon": "i-lucide-truck",
            "title": "Free pickup delivery",
            "desc": "Order to the nearest pickup point in Luanda for free."
          },
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Try and pay later",
            "desc": "Try on your order and pay only if you love it."
          }
        ]
      },
      "seo": {
        "h1": "Online clothing in Angola — Free delivery with Amoda",
        "text": [
          "Amoda is Angola’s leading online fashion store where you can buy women’s, men’s and kids’ clothes with free delivery in Luanda.",
          "Shop online, pick up your order locally, and pay only for what you keep — fast, safe and convenient.",
          "Find the latest Angola fashion trends, stylish outfits and great prices. Online clothes shopping made simple."
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
      <UPageCTA
        :title="t('home.heroTitle')"
        :description="t('home.heroSubtitle')"
        :links="[
          {
            label: t('home.heroButton'),
            color: 'primary',
            to: localeRoute({ name: 'gender', params: { gender: 'women' } })
          }
        ]"
        orientation="horizontal"
        class="mb-10 sm:mb-14"
      >
        <NuxtImg
          src="/images/hero.png"
          alt="hero"
          class="w-full rounded-lg"
        />
      </UPageCTA>

      <UPageSection
        :title="t('home.featuresTitle')"
        :features="[
          {
            icon: 'i-heroicons-truck',
            title: t('home.features.delivery.title'),
            description: t('home.features.delivery.desc')
          },
          {
            icon: 'i-heroicons-lock-closed',
            title: t('home.features.secure.title'),
            description: t('home.features.secure.desc')
          },
          {
            icon: 'i-heroicons-banknotes',
            title: t('home.features.cheap.title'),
            description: t('home.features.cheap.desc')
          }
        ]"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      />

      <UPageSection
        :title="t('home.how.title')"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <UStepper
          :modelValue="steps.length"
          :items="steps"
          color="primary"
        />
      </UPageSection>

      <UPageSection
        :title="t('home.chooseGender')"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <NuxtLink
            class="p-4 rounded bg-gray-50 hover:bg-primary/5 text-center font-medium transition"
            :to="localeRoute({ name: 'gender', params: { gender: 'women' } })"
          >
            {{ t('home.women') }}
          </NuxtLink>

          <NuxtLink
            class="p-4 rounded bg-gray-50 hover:bg-primary/5 text-center font-medium transition"
            :to="localeRoute({ name: 'gender', params: { gender: 'men' } })"
          >
            {{ t('home.men') }}
          </NuxtLink>

          <NuxtLink
            class="p-4 rounded bg-gray-50 hover:bg-primary/5 text-center font-medium transition"
            :to="localeRoute({ name: 'gender', params: { gender: 'kids' } })"
          >
            {{ t('home.kids') }}
          </NuxtLink>
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
            :image="product.images?.[0]?.url || 'placeholder.png'"
            :to="localeRoute({ name: 'product-slug', params: { slug: product.slug } })"
            :ui="{
              header: 'aspect-[4/5] object-cover',
              body: 'sm:p-3',
              title: 'line-clamp-2 overflow-hidden'
            }"
            variant="outline"
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
