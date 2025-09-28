<script setup lang="ts">
defineProps<{ product: any }>();

const localeRoute = useLocaleRoute();
</script>

<template>
  <div class="h-full flex flex-col">
    <NuxtLink :to="localeRoute({ name: 'product-slug', params: { slug: product.slug } })">
      <img
        :src="product.images?.[0]?.url"
        :alt="product.title"
        class="w-full aspect-[3/4] object-cover mb-2"
      >

      <div class="font-medium line-clamp-2">
        {{ product.title }}
      </div>
    </NuxtLink>

    <div class="mt-auto flex items-center justify-between pt-2">
      <div class="text-sm">
        {{ (product.price / 100).toFixed(2) }} AOA
      </div>
    </div>
  </div>
</template>
