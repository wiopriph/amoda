<script setup lang="ts">
import type { BlogCategoryPreview } from '#shared/types/blog';


// ::product-grid{category="vestidos-longos" limit="4"} — сетка товаров в наличии.
// Специально без единичных товаров по id: товары с остатком 1 быстро уходят из наличия
const props = withDefaults(defineProps<{
  category: string
  limit?: string | number
}>(), {
  limit: 4,
});

const limit = computed(() => Math.min(Math.max(1, Number(props.limit) || 4), 12));

// Блок не должен ломать статью: при ошибке/пустой категории просто не рендерится
const { data: preview } = await useFetch<BlogCategoryPreview>('/api/blog/category-preview', {
  key: `blog-product-grid-${props.category}-${limit.value}`,
  query: { slug: props.category, limit },
});

const products = computed(() => preview.value?.items || []);
</script>

<template>
  <div
    v-if="products.length"
    class="not-prose my-8"
  >
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>

    <div class="mt-4 text-center">
      <UButton
        :to="`/category/${preview!.category.slug}`"
        color="primary"
        variant="soft"
        trailingIcon="i-lucide-arrow-right"
        class="rounded-full"
      >
        Ver todos em {{ preview!.category.name }}
      </UButton>
    </div>
  </div>
</template>
