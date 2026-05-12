<script setup lang="ts">
type CategoryPill = {
  id: number
  name: string
  slug: string
  image?: string | null
};

defineProps<{
  list: CategoryPill[]
}>();

const getCategoryTo = (slug: string) => ({ name: 'category-slug', params: { slug } });
</script>

<template>
  <nav
    v-if="list?.length"
    aria-label="Category navigation"
  >
    <div class="flex flex-wrap gap-2 pb-1 sm:gap-3 sm:pb-0">
      <NuxtLink
        v-for="category in list"
        :key="category.id"
        :to="getCategoryTo(category.slug)"
        class="group shrink-0"
      >
        <div class="flex min-w-[132px] items-center gap-2 rounded-full border border-gray-100 bg-white/80 px-3 py-2 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:shadow-md sm:min-w-0">
          <div class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            <img
              :src="category.image || '/placeholder.webp'"
              :alt="category.name"
              class="size-full object-cover transition group-hover:scale-105"
              loading="lazy"
            >
          </div>

          <span
            class="max-w-[120px] truncate text-sm font-medium text-highlighted"
            v-text="category.name"
          />
        </div>
      </NuxtLink>
    </div>
  </nav>
</template>
