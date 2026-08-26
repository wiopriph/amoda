<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice';
import type { CatalogProductCard } from '#shared/types/catalog';


type HeroProps = {
  // Выборочные товары для веера справа (галочка «Destaque» в админке)
  products?: CatalogProductCard[]
};

const props = defineProps<HeroProps>();

// Тексты hero живут в коде: правятся вместе с дизайном блока и версионируются в git
const heroContent = {
  title: 'Moda feminina em Luanda. Experimenta antes de pagar.',
  subtitle: 'Recebes o teu pedido, provas com calma e pagas só o que gostar.',
  socialProof: 'Entregas em Luanda e nas províncias',
  // У каждого буллета своё сообщение — «pagas só o que gostar» уже в H1 и подзаголовке
  bullets: [
    'Sem pagamento online',
    'Preço fixo — sem surpresas',
    'Entrega no horário combinado',
  ],
  ctaPrimary: 'Ver os looks',
} as const;

// Веер: боковые карточки повёрнуты, центральная сверху с бейджем
const FAN_SLOTS = [
  'absolute left-1 top-3 z-0 w-[42%] -rotate-6 lg:left-0 lg:top-6',
  'absolute left-1/2 top-0 z-10 w-[46%] -translate-x-1/2',
  'absolute right-1 top-4 z-0 w-[42%] rotate-6 lg:right-0 lg:top-7',
] as const;

const CENTER_SLOT = 1;

const fanProducts = computed(() => (props.products || []).slice(0, 3));

// Расстановка по слотам [левый, центр, правый]: тап по боковой выдвигает её в центр,
// тап по центральной — переход на товар
const fanArrangement = ref<number[]>([0, 1, 2]);

watch(fanProducts, () => {
  fanArrangement.value = [0, 1, 2];
});

const fanSlots = computed(() =>
  fanArrangement.value
    .map((productIndex, slotIndex) => ({
      product: fanProducts.value[productIndex],
      slotIndex,
    }))
    .filter((slot): slot is { product: CatalogProductCard; slotIndex: number } => Boolean(slot.product)),
);

function onFanCardClick(slotIndex: number, event: MouseEvent) {
  if (slotIndex === CENTER_SLOT || fanProducts.value.length < 2) {
    return;
  }

  // capture-фаза: гасим клик до обработчика NuxtLink, иначе уходит навигация
  event.preventDefault();
  event.stopPropagation();

  const next = [...fanArrangement.value];

  [next[CENTER_SLOT], next[slotIndex]] = [next[slotIndex]!, next[CENTER_SLOT]!];
  fanArrangement.value = next;
}
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
        class="relative mx-auto h-[265px] w-full max-w-[420px] sm:h-[300px] lg:h-[315px]"
      >
        <!-- Карточки в стиле ProductCard: фото до краёв, цена чёрным главным текстом -->
        <NuxtLink
          v-for="fanSlot in fanSlots"
          :key="fanSlot.product.id"
          :to="{ name: 'product-slug', params: { slug: fanSlot.product.slug } }"
          :class="FAN_SLOTS[fanSlot.slotIndex]"
          class="block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-900/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          @click.capture="onFanCardClick(fanSlot.slotIndex, $event)"
        >
          <div class="relative aspect-[4/5] overflow-hidden bg-gray-50">
            <img
              :src="fanSlot.product.image || '/placeholder.webp'"
              :alt="fanSlot.product.title"
              fetchpriority="high"
              class="h-full w-full object-cover"
            >

            <UBadge
              v-if="fanSlot.slotIndex === CENTER_SLOT"
              color="primary"
              variant="solid"
              size="sm"
              class="absolute left-2 top-2"
            >
              Escolha Amoda
            </UBadge>
          </div>

          <div class="px-2.5 py-1.5">
            <div class="text-xs font-extrabold text-highlighted sm:text-sm">
              {{ formatPrice(fanSlot.product.price) }}
            </div>

            <div class="truncate text-[10px] text-muted">
              {{ fanSlot.product.title }}
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
