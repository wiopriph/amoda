<script setup lang="ts">
import type { FavoriteProduct } from '~/composables/useFavorites';
import { formatPrice } from '~/utils/formatPrice';
import { getProductBadgeColor, getProductBadgeLabel } from '~/utils/productBadges';


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
  <UBlogPost
    :title="product.title"
    :description="formatPrice(product.price ?? 0)"
    :image="product.image || '/placeholder.webp'"
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
    @click="$emit('select')"
  >
    <template #badge>
      <div
        v-if="product.badges?.length"
        class="absolute left-2 top-2 flex flex-wrap gap-1"
      >
        <UBadge
          v-for="badge in product.badges"
          :key="badge"
          :color="getProductBadgeColor(badge)"
          variant="solid"
        >
          {{ getProductBadgeLabel(badge) }}
        </UBadge>
      </div>

      <FavoriteToggle
        :product="product"
        class="absolute right-2 top-2"
      />
    </template>
  </UBlogPost>
</template>
