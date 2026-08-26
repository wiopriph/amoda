<script setup lang="ts">
import type { CategoryNavigationResponse } from '~~/server/api/catalog/category-navigation.get';


defineProps<{
  navigation: CategoryNavigationResponse
}>();
</script>

<template>
  <!-- Тот же паттерн, что лента «Categorias» на главной: фото 3:4, имя на градиенте.
       Активная — розовое кольцо и не ссылка -->
  <nav
    v-if="navigation.items.length"
    aria-label="Navegação de categorias"
  >
    <div class="-mx-4 flex gap-2.5 overflow-x-auto p-1 px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:gap-3 sm:px-1 [&::-webkit-scrollbar]:hidden">
      <template
        v-for="item in navigation.items"
        :key="item.slug"
      >
        <span
          v-if="item.active"
          aria-current="page"
          class="relative w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-2 ring-primary sm:w-28"
        >
          <span class="block aspect-[3/4] overflow-hidden">
            <img
              :src="item.image || '/placeholder.webp'"
              :alt="item.name"
              loading="lazy"
              class="h-full w-full object-cover object-top"
            >
          </span>

          <span class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <span class="absolute bottom-1.5 left-2 right-2 text-xs font-bold leading-tight text-white sm:text-[13px]">
            {{ item.name }}
          </span>
        </span>

        <NuxtLink
          v-else
          :to="{ name: 'category-slug', params: { slug: item.slug } }"
          class="group relative w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 transition hover:shadow-md sm:w-28"
        >
          <span class="block aspect-[3/4] overflow-hidden">
            <img
              :src="item.image || '/placeholder.webp'"
              :alt="item.name"
              loading="lazy"
              class="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
            >
          </span>

          <span class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <span class="absolute bottom-1.5 left-2 right-2 text-xs font-bold leading-tight text-white sm:text-[13px]">
            {{ item.name }}
          </span>
        </NuxtLink>
      </template>
    </div>
  </nav>
</template>
