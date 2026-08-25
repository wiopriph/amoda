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
    class="flex size-8 items-center justify-center rounded-full bg-black/40 backdrop-blur transition before:absolute before:-inset-2 before:content-[''] hover:bg-black/55 active:scale-95"
    @click="onToggle"
  >
    <UIcon
      :name="isActive ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'"
      :class="isActive ? 'text-primary' : 'text-white'"
      class="size-4"
    />
  </button>
</template>
