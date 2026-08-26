<script setup lang="ts">
import type { CategoryNavigationResponse } from '~~/server/api/catalog/category-navigation.get';


const props = defineProps<{
  navigation: CategoryNavigationResponse
}>();

// «Todos» + чипы одного уровня; активный чип — не ссылка
const chips = computed(() => {
  const list: { label: string; slug: string; active: boolean }[] = [];

  if (props.navigation.todos) {
    list.push({ label: 'Todos', slug: props.navigation.todos.slug, active: props.navigation.todos.active });
  }

  for (const item of props.navigation.items) {
    list.push({ label: item.name, slug: item.slug, active: item.active });
  }

  return list;
});
</script>

<template>
  <nav
    v-if="chips.length"
    aria-label="Navegação de categorias"
  >
    <div class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
      <template
        v-for="chip in chips"
        :key="chip.slug"
      >
        <span
          v-if="chip.active"
          aria-current="page"
          class="shrink-0 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-white"
          v-text="chip.label"
        />

        <NuxtLink
          v-else
          :to="{ name: 'category-slug', params: { slug: chip.slug } }"
          class="shrink-0 rounded-full border border-gray-100 bg-white px-3.5 py-2 text-sm font-medium text-highlighted transition hover:border-primary/30 hover:bg-primary/5"
        >
          {{ chip.label }}
        </NuxtLink>
      </template>
    </div>
  </nav>
</template>
