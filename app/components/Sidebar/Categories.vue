<script setup lang="ts">
const route = useRoute();

const { data: categories } = await useFetch('/api/catalog/categories', {
  watch: [() => route.fullPath],
});
</script>

<template>
  <aside class="w-64 pr-4">
    <nav class="space-y-2">
      <SidebarCategory
        v-for="cat in categories"
        :key="cat.id"
        :category="cat"
      />
    </nav>
  </aside>
</template>
