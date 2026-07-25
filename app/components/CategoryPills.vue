<script setup lang="ts">
type CategoryPill = {
  id: number
  name: string
  slug: string
  image?: string | null
};

defineProps<{
  list: CategoryPill[]
  currentSlug?: string
}>();

const getCategoryTo = (slug: string) => ({ name: 'category-slug', params: { slug } });
</script>

<template>
  <nav
    v-if="list?.length"
    aria-label="Category navigation"
  >
    <div class="-mx-4 flex gap-2 overflow-x-auto p-1 px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-3 sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
      <NuxtLink
        v-for="category in list"
        :key="category.id"
        :to="getCategoryTo(category.slug)"
        :aria-current="category.slug === currentSlug ? 'page' : undefined"
        class="group shrink-0"
      >
        <div
          :class="category.slug === currentSlug
            ? 'border-primary bg-primary/10'
            : 'border-gray-100 bg-white/80 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md'"
          class="flex items-center gap-2 rounded-full border px-3 py-2 shadow-sm transition"
        >
          <div class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            <img
              :src="category.image || '/placeholder.webp'"
              :alt="category.name"
              class="size-full object-cover transition group-hover:scale-105"
              loading="lazy"
            >
          </div>

          <span
            :class="category.slug === currentSlug ? 'text-primary' : 'text-highlighted'"
            class="max-w-[140px] truncate text-sm font-medium"
            v-text="category.name"
          />
        </div>
      </NuxtLink>
    </div>
  </nav>
</template>
