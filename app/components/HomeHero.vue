<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice';
import type { CatalogProductCard } from '#shared/types/catalog';


type HeroProps = {
  title?: string
  subtitle?: string
  socialProof?: string
  bullets?: string[]
  ctaPrimary?: string
  // Выборочные товары для веера справа (галочка «Destaque» в админке)
  products?: CatalogProductCard[]
};

const props = defineProps<HeroProps>();

const heroDefaults = {
  title: 'Moda feminina em Luanda. Experimenta antes de pagar.',
  subtitle: 'Recebes o teu pedido, provas com calma e pagas só o que gostar.',
  socialProof: 'Entregas em Luanda e nas províncias',
  bullets: [
    'Sem pagamento online',
    'Pagas só o que gostar',
    'Troca fácil em 7 dias',
  ],
  ctaPrimary: 'Ver os looks',
} as const;

const heroContent = computed(() => ({
  title: props.title || heroDefaults.title,
  subtitle: props.subtitle || heroDefaults.subtitle,
  socialProof: props.socialProof || heroDefaults.socialProof,
  bullets: (props.bullets?.length ? props.bullets : heroDefaults.bullets).slice(0, 3),
  ctaPrimary: props.ctaPrimary || heroDefaults.ctaPrimary,
}));

// Веер: боковые карточки повёрнуты, центральная сверху с бейджем
const FAN_SLOTS = [
  'absolute left-1 top-4 w-[42%] -rotate-6 lg:left-0 lg:top-10',
  'absolute left-1/2 top-0 z-10 w-[46%] -translate-x-1/2',
  'absolute right-1 top-6 w-[42%] rotate-6 lg:right-0 lg:top-12',
] as const;

const fanProducts = computed(() => (props.products || []).slice(0, 3));
</script>

<template>
  <section
    class="relative overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 sm:p-8 lg:p-10"
  >
    <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
      <div>
        <div class="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-muted backdrop-blur">
          <UIcon
            name="i-lucide-check"
            class="size-3.5 text-primary"
          />

          <span>{{ heroContent.socialProof }}</span>
        </div>

        <h1 class="mt-4 text-[1.9rem] font-black leading-tight tracking-tight text-highlighted text-balance sm:text-4xl lg:text-5xl">
          {{ heroContent.title }}
        </h1>

        <p class="mt-3 max-w-2xl text-sm text-muted sm:text-base lg:text-lg">
          {{ heroContent.subtitle }}
        </p>

        <UButton
          :to="{ name: 'products' }"
          size="xl"
          color="primary"
          class="mt-6 w-full justify-center sm:w-fit sm:px-8"
        >
          {{ heroContent.ctaPrimary }}
        </UButton>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <div
            v-for="heroBullet in heroContent.bullets"
            :key="heroBullet"
            class="flex items-center gap-1.5 text-xs font-medium text-toned sm:text-sm"
          >
            <UIcon
              name="i-lucide-check-circle-2"
              class="size-4 shrink-0 text-primary"
            />

            <span>{{ heroBullet }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="fanProducts.length"
        class="relative mx-auto h-[310px] w-full max-w-[420px] sm:h-[360px] lg:h-[420px]"
      >
        <NuxtLink
          v-for="(fanProduct, fanIndex) in fanProducts"
          :key="fanProduct.id"
          :to="{ name: 'product-slug', params: { slug: fanProduct.slug } }"
          :class="FAN_SLOTS[fanIndex]"
          class="block rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-gray-900/10 transition hover:-translate-y-1 hover:shadow-2xl"
        >
          <div class="aspect-[4/5] overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
            <img
              :src="fanProduct.image || '/placeholder.webp'"
              :alt="fanProduct.title"
              fetchpriority="high"
              class="h-full w-full object-cover"
            >
          </div>

          <div class="flex items-center justify-between gap-1 px-1.5 py-2">
            <span class="text-xs font-extrabold text-primary sm:text-sm">
              {{ formatPrice(fanProduct.price) }}
            </span>

            <UBadge
              v-if="fanIndex === 1"
              color="primary"
              variant="solid"
              size="sm"
              class="hidden shrink-0 sm:inline-flex"
            >
              Escolha Amoda
            </UBadge>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
