<script setup lang="ts">
const props = defineProps<{
  list: Array<{ id: number; name: string; slug: string }>
}>();

const localeRoute = useLocaleRoute();
</script>

<template>
  <div class="w-full mb-4">
    <div class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="child in props.list"
        :key="child.id"
        :to="localeRoute({ name: 'category-slug', params: { slug: child.slug } })"
        class="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-sm hover:bg-gray-200 whitespace-nowrap"
      >
        {{ child.name }}
      </NuxtLink>
    </div>
  </div>
</template>
