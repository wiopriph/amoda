<script setup lang="ts">
type Chip = { key: string; label: string };

defineProps<{
  activeFilterCount: number
  activeChips: Chip[]
}>();

const emit = defineEmits<{
  open: []
  removeChip: [key: string]
  clearAll: []
}>();
</script>

<template>
  <div class="sticky top-14 z-30 -mx-4 mt-5 border-y border-gray-100 bg-white/90 px-4 py-2.5 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
    <div class="flex flex-wrap items-center gap-2">
      <UButton
        variant="soft"
        color="neutral"
        icon="i-lucide-sliders-horizontal"
        class="shrink-0"
        @click="emit('open')"
      >
        Filtrar

        <UBadge
          v-if="activeFilterCount"
          :label="String(activeFilterCount)"
          color="primary"
          size="xs"
          class="ml-1"
        />
      </UButton>

      <UBadge
        v-for="chip in activeChips"
        :key="chip.key"
        color="primary"
        variant="soft"
        class="shrink-0 cursor-pointer gap-1"
        @click="emit('removeChip', chip.key)"
      >
        {{ chip.label }}

        <UIcon
          name="i-lucide-x"
          class="size-3"
        />
      </UBadge>

      <button
        v-if="activeChips.length"
        type="button"
        class="shrink-0 whitespace-nowrap text-xs text-muted hover:text-primary"
        @click="emit('clearAll')"
      >
        Limpar
      </button>
    </div>
  </div>
</template>
