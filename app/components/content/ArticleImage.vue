<script setup lang="ts">
// ::article-image{src="/blog/foo.webp" alt="..." caption="..."} — изображение статьи
// через штатный пайплайн (@nuxt/image → /_ipx с immutable-кэшем)
defineProps<{
  src: string
  alt: string
  caption?: string
}>();
</script>

<template>
  <figure class="not-prose my-8">
    <NuxtImg
      :src="src"
      :alt="alt"
      loading="lazy"
      sizes="100vw sm:768px"
      class="w-full rounded-2xl border border-gray-100 object-cover"
    />

    <figcaption
      v-if="caption"
      class="mt-2 text-center text-sm text-muted"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
