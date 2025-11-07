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
</script>

<i18n lang="json">
{
  "pt": {
    "home": {
      "title": "Amoda — Loja online",
      "desc": "Compre roupas, sapatos e acessórios online.",
      "heroTitle": "Moda fácil e segura para todos os dias",
      "heroSubtitle": "Encomende online, experimente no ponto de entrega e pague apenas se gostar.",
      "heroButton": "Comece agora",
      "women": "Mulheres",
      "men": "Homens",
      "kids": "Crianças",
      "showcase": "Em destaque",
      "featuresTitle": "Por que escolher a Amoda?",
      "features": {
        "delivery": {
          "title": "Entrega gratuita",
          "desc": "Levante o seu pedido no ponto de entrega sem custos adicionais."
        },
        "secure": {
          "title": "Compra segura",
          "desc": "Pague apenas depois de verificar o produto pessoalmente."
        },
        "cheap": {
          "title": "Melhores preços",
          "desc": "Moda acessível com a melhor relação qualidade-preço."
        }
      },
      "chooseGender": "Explore por categoria",
      "how": {
        "title": "Como funciona?",
        "steps": [
          {
            "icon": "i-lucide-search",
            "title": "Escolha os produtos online",
            "desc": "Encontre o que gosta na Amoda e adicione ao carrinho."
          },
          {
            "icon": "i-lucide-truck",
            "title": "Envie para o ponto de entrega",
            "desc": "Encomende gratuitamente para o ponto de entrega mais próximo."
          },
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Experimente e pague",
            "desc": "Veja, experimente e pague apenas se quiser ficar com o produto."
          }
        ]
      }
    }
  },
  "en": {
    "home": {
      "title": "Amoda — Online store",
      "desc": "Shop clothes, shoes and accessories online.",
      "heroTitle": "Simple, safe, everyday fashion",
      "heroSubtitle": "Order online, try at pickup point and pay only if you love it.",
      "heroButton": "Shop now",
      "women": "Women",
      "men": "Men",
      "kids": "Kids",
      "showcase": "Featured",
      "featuresTitle": "Why choose Amoda?",
      "features": {
        "delivery": {
          "title": "Free pickup delivery",
          "desc": "Collect your order at a pickup point with no extra cost."
        },
        "secure": {
          "title": "Safe shopping",
          "desc": "Pay only after checking your product in person."
        },
        "cheap": {
          "title": "Affordable prices",
          "desc": "Quality fashion at fair prices."
        }
      },
      "chooseGender": "Explore by category",
      "how": {
        "title": "How it works?",
        "steps": [
          {
            "icon": "i-lucide-search",
            "title": "Choose products online",
            "desc": "Find what you love on Amoda and add it to your cart."
          },
          {
            "icon": "i-lucide-truck",
            "title": "Send to pickup point",
            "desc": "Order for free to the nearest pickup location."
          },
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Try and pay later",
            "desc": "Inspect, try on, and pay only if you want to keep it."
          }
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
      <!-- Hero -->
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

      <!-- Преимущества -->
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

      <!-- Как работает -->
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

      <!-- Категории -->
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

      <!-- Витрина -->
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
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
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
    </UPageBody>
  </UPage>
</template>
