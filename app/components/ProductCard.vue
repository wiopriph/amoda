<script setup lang="ts">
import type { FavoriteProduct } from '~/composables/useFavorites';
import { formatPrice } from '~/utils/formatPrice';
import { getProductBadgeDotClass, getProductBadgeLabel } from '~/utils/productBadges';


// Минимум, который умеют отдавать все источники карточек:
// каталог/поиск (CatalogProductCard), избранное (FavoriteProduct), рекомендации
type ProductCardData = FavoriteProduct & {
  badges?: string[] | null
};

defineProps<{
  product: ProductCardData
}>();

defineEmits<{
  select: []
}>();
</script>

<template>
  <NuxtLink
    :to="{ name: 'product-slug', params: { slug: product.slug } }"
    class="group block overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-md"
    @click="$emit('select')"
  >
    <div class="relative aspect-[4/5] overflow-hidden bg-gray-50">
      <NuxtImg
        :src="product.image || '/placeholder.webp'"
        :alt="product.title"
        loading="lazy"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <div
        v-if="product.badges?.length"
        class="absolute left-2 top-2 flex flex-wrap gap-1"
      >
        <span
          v-for="badge in product.badges"
          :key="badge"
          class="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 backdrop-blur"
        >
          <span
            :class="getProductBadgeDotClass(badge)"
            class="size-1.5 rounded-full"
          />

          <span class="text-[9px] font-bold tracking-wide text-white">
            {{ getProductBadgeLabel(badge) }}
          </span>
        </span>
      </div>

      <FavoriteToggle
        :product="product"
        class="absolute right-2 top-2"
      />
    </div>

    <div class="px-2.5 py-2 sm:px-3 sm:py-2.5">
      <div class="text-sm font-extrabold text-highlighted">
        {{ formatPrice(product.price ?? 0) }}
      </div>

      <div class="mt-0.5 truncate text-[11px] text-muted sm:text-xs">
        {{ product.title }}
      </div>
    </div>
  </NuxtLink>
</template>
