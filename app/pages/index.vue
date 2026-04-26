<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'index' });

const { t, tm, rt } = useI18n();
const localeRoute = useLocaleRoute();
const route = useRoute();

useHead({
  title: t('home.title'),
  meta: [{ name: 'description', content: t('home.desc') }],
});

const { data: hero } = await useFetch('/api/home/hero');

const { data, error } = await useFetch('/api/catalog/list', {
  query: { limit: 10, sort: 'new' },
  watch: [() => route.fullPath],
});

const items = computed(() => data.value?.items || []);

const WOMEN_SLUG = 'mulheres';

const startShoppingTo = computed(() =>
  localeRoute({ name: 'category-slug', params: { slug: WOMEN_SLUG } }),
);

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
        listName: 'Home new arrivals',
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
    listName: 'Home new arrivals',
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

const trustItems = computed(() =>
  tm('home.trust.items').map((item: any) => ({
    icon: rt(item.icon),
    title: rt(item.title),
    desc: rt(item.desc),
  })),
);

const seoParagraphs = computed(() => tm('home.seo.text') as string[]);
</script>

<i18n lang="json">
{
  "pt": {
    "home": {
      "title": "Amoda — roupa feminina em Luanda com prova antes de pagar",
      "desc": "Escolha roupa feminina online em Luanda, reserve sem pagar, experimente primeiro e pague apenas pelo que gostar.",
      "how": {
        "title": "Como comprar na Amoda",
        "steps": [
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Escolha o look",
            "desc": "Veja os produtos no site e adicione ao pedido as peças que quer experimentar."
          },
          {
            "icon": "i-lucide-message-circle",
            "title": "Reserve sem pagar",
            "desc": "Envie o pedido com seu nome e WhatsApp. Não precisa pagar online."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Experimente e decida",
            "desc": "Veja as peças ao vivo, experimente e pague apenas pelo que gostar."
          }
        ]
      },
      "showcase": {
        "title": "Novidades para experimentar",
        "desc": "Peças selecionadas para você montar o seu próximo look.",
        "ctaAll": "Ver todos os produtos",
        "error": "Erro ao carregar os produtos."
      },
      "trust": {
        "title": "Por que comprar com a Amoda?",
        "items": [
          {
            "icon": "i-lucide-wallet",
            "title": "Sem pagamento online",
            "desc": "Você reserva primeiro e paga só quando decidir levar."
          },
          {
            "icon": "i-lucide-shield-check",
            "title": "Prova antes de comprar",
            "desc": "Veja tamanho, tecido e caimento antes de finalizar."
          },
          {
            "icon": "i-simple-icons-whatsapp",
            "title": "Atendimento no WhatsApp",
            "desc": "A nossa equipa ajuda com reserva, tamanho e ponto de experimentação."
          }
        ]
      },
      "seo": {
        "title": "Loja online de roupa feminina em Luanda",
        "text": [
          "A Amoda é uma loja online de roupa feminina em Angola feita para quem quer comprar com mais segurança.",
          "Você escolhe as peças online, reserva sem pagamento antecipado e experimenta antes de decidir.",
          "Se gostar, leva e paga. Se não gostar, não precisa comprar."
        ]
      }
    }
  },
  "en": {
    "home": {
      "title": "Amoda — women’s fashion in Luanda with try before you pay",
      "desc": "Choose women’s clothing online in Luanda, reserve with no payment, try first, and pay only for what you like.",
      "how": {
        "title": "How to buy on Amoda",
        "steps": [
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Choose your look",
            "desc": "Browse the website and add the items you want to try."
          },
          {
            "icon": "i-lucide-message-circle",
            "title": "Reserve without paying",
            "desc": "Send your request with your name and WhatsApp. No online payment needed."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Try and decide",
            "desc": "See the items in real life, try them on, and pay only for what you like."
          }
        ]
      },
      "showcase": {
        "title": "New arrivals to try",
        "desc": "Selected pieces to build your next look.",
        "ctaAll": "View all products",
        "error": "Failed to load products."
      },
      "trust": {
        "title": "Why buy with Amoda?",
        "items": [
          {
            "icon": "i-lucide-wallet",
            "title": "No online payment",
            "desc": "Reserve first and pay only when you decide to keep it."
          },
          {
            "icon": "i-lucide-shield-check",
            "title": "Try before buying",
            "desc": "Check size, fabric and fit before completing the purchase."
          },
          {
            "icon": "i-simple-icons-whatsapp",
            "title": "WhatsApp support",
            "desc": "Our team helps with reservation, size and try-on point."
          }
        ]
      },
      "seo": {
        "title": "Online women’s clothing store in Luanda",
        "text": [
          "Amoda is an online women’s clothing store in Angola built for safer shopping.",
          "Choose items online, reserve with no advance payment, and try before deciding.",
          "If you like it, keep it and pay. If you do not like it, no need to buy."
        ]
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mt-2">
      <HomeHero
        :title="hero?.title ?? undefined"
        :subtitle="hero?.subtitle ?? undefined"
        :socialProof="hero?.socialProof ?? undefined"
        :bullets="hero?.bullets?.length ? hero.bullets : undefined"
        :ctaPrimary="hero?.ctaPrimary ?? undefined"
        :whatsappLabel="hero?.whatsappLabel ?? undefined"
        :tiktokTitle="hero?.tiktokTitle ?? undefined"
        :tiktokSubtitle="hero?.tiktokSubtitle ?? undefined"
        :isTiktokLive="hero?.isTiktokLive ?? false"
        :imageUrl="hero?.imageUrl ?? undefined"
      />

      <section class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
              {{ t('home.showcase.title') }}
            </h2>

            <p class="mt-2 text-sm text-muted sm:text-base">
              {{ t('home.showcase.desc') }}
            </p>
          </div>

          <UButton
            :to="startShoppingTo"
            variant="soft"
            class="hidden sm:inline-flex"
          >
            {{ t('home.showcase.ctaAll') }}
          </UButton>
        </div>

        <UAlert
          v-if="error"
          class="mt-5"
          color="error"
          variant="soft"
          :title="t('home.showcase.error')"
        />

        <UBlogPosts
          v-else
          class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4"
        >
          <UBlogPost
            v-for="(product, index) in items"
            :key="product.id"
            :title="product.title"
            :description="`${new Intl.NumberFormat('pt-AO').format(product.price)} AOA`"
            :image="product.image || 'placeholder.webp'"
            :to="localeRoute({ name: 'product-slug', params: { slug: product.slug } })"
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
                v-if="index < 3"
                color="primary"
                variant="solid"
                class="absolute top-2 left-2"
              >
                NEW
              </UBadge>
            </template>
          </UBlogPost>
        </UBlogPosts>

        <div class="mt-5 sm:hidden">
          <UButton
            size="lg"
            :to="startShoppingTo"
            class="w-full justify-center"
          >
            {{ t('home.showcase.ctaAll') }}
          </UButton>
        </div>
      </section>

      <section class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <UCard class="overflow-hidden">
          <div class="flex flex-col gap-6">
            <div>
              <h2 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
                {{ t('home.how.title') }}
              </h2>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
              <div
                v-for="step in steps"
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

                <h3 class="mt-4 font-bold text-highlighted">
                  {{ step.title }}
                </h3>

                <p class="mt-2 text-sm leading-6 text-muted">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <section class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <UCard class="border-primary/20 bg-primary/5">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
              {{ t('home.trust.title') }}
            </h2>
          </div>

          <div class="mt-5 grid gap-3 md:grid-cols-3">
            <div
              v-for="item in trustItems"
              :key="item.title"
              class="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div class="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UIcon
                  :name="item.icon"
                  class="size-5"
                />
              </div>

              <h3 class="mt-4 font-bold text-highlighted">
                {{ item.title }}
              </h3>

              <p class="mt-2 text-sm leading-6 text-muted">
                {{ item.desc }}
              </p>
            </div>
          </div>
        </UCard>
      </section>

      <section class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div class="text-center">
          <h2 class="text-lg font-bold text-highlighted">
            {{ t('home.seo.title') }}
          </h2>

          <div class="mt-4 space-y-3 text-sm leading-7 text-muted">
            <p
              v-for="(p, i) in seoParagraphs"
              :key="i"
              v-text="rt(p)"
            />
          </div>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>
