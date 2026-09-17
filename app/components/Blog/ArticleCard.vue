<script setup lang="ts">
import { BLOG_COVER_FALLBACK } from '~/constants/blog';


export type BlogArticleCardData = {
  path: string
  title?: string
  description?: string
  cover?: string
};

defineProps<{
  article: BlogArticleCardData
}>();
</script>

<template>
  <NuxtLink
    :to="article.path"
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-md"
  >
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-50">
      <NuxtImg
        :src="article.cover || BLOG_COVER_FALLBACK"
        :alt="article.title || ''"
        loading="lazy"
        sizes="100vw sm:50vw lg:384px"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
    </div>

    <div class="flex flex-col px-4 py-3 sm:px-5 sm:py-4">
      <h3 class="text-base font-extrabold leading-snug tracking-tight text-highlighted transition group-hover:text-primary sm:text-lg">
        {{ article.title }}
      </h3>

      <p class="mt-1.5 line-clamp-2 text-sm leading-6 text-muted">
        {{ article.description }}
      </p>
    </div>
  </NuxtLink>
</template>
