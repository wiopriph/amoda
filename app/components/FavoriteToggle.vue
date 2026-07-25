<script setup lang="ts">
import type { FavoriteProduct } from '~/composables/useFavorites';


const props = defineProps<{
  product: FavoriteProduct
}>();

const { isFavorite, toggle } = useFavorites();

const isActive = computed(() => isFavorite(props.product.id));

// Cards render inside a NuxtLink — keep the tap from navigating
const onToggle = (clickEvent: Event) => {
  clickEvent.preventDefault();
  clickEvent.stopPropagation();
  toggle(props.product);
};
</script>

<template>
  <button
    :aria-label="isActive ? 'Remover dos favoritos' : 'Guardar nos favoritos'"
    :aria-pressed="isActive"
    type="button"
    class="flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105 active:scale-95"
    @click="onToggle"
  >
    <UIcon
      :name="isActive ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
      :class="isActive ? 'text-primary' : 'text-gray-600'"
      class="size-5"
    />
  </button>
</template>
