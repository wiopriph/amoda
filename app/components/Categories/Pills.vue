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

const localeRoute = useLocaleRoute();
</script>

<template>
  <nav
    v-if="list?.length"
    aria-label="Category navigation"
  >
    <div class="flex gap-2 pb-1 flex-wrap sm:gap-3 sm:pb-0">
      <NuxtLink
        v-for="item in list"
        :key="item.id"
        :to="localeRoute({ name: 'category-slug', params: { slug: item.slug } })"
        class="group shrink-0"
      >
        <div class="flex min-w-[132px] items-center gap-2 rounded-full border border-gray-100 bg-white/80 px-3 py-2 shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:shadow-md sm:min-w-0">
          <div class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            <img
              :src="item.image || '/placeholder.webp'"
              :alt="item.name"
              class="size-full object-cover transition group-hover:scale-105"
              loading="lazy"
            >
          </div>

          <span class="max-w-[120px] truncate text-sm font-medium text-highlighted">
            {{ item.name }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </nav>
</template>
