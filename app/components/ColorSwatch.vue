<script setup lang="ts">
import { BASE_COLOR_MAP } from '#shared/constants/colors';

const props = withDefaults(defineProps<{
  color?: string | null
  size?: number
  selected?: boolean
}>(), {
  size: 24,
  selected: false,
});

const entry = computed(() => (props.color ? BASE_COLOR_MAP[props.color] : null) ?? null);

const style = computed(() => {
  const dimension = `${props.size}px`;
  const base: Record<string, string> = { width: dimension, height: dimension };

  if (!entry.value) {
    base.background = '#e5e7eb';

    return base;
  }

  if (entry.value.swatch === 'multi') {
    base.background = 'conic-gradient(#d4283b, #f2c744, #2f9e5f, #2f6bd8, #7a4ab7, #d4283b)';
  } else if (entry.value.swatch === 'pattern') {
    base.background = 'repeating-linear-gradient(45deg, #c9a24b 0 4px, #7b4a2e 4px 8px)';
  } else {
    base.background = entry.value.hex ?? '#e5e7eb';
  }

  return base;
});

const showBorder = computed(() => !entry.value || entry.value.needsBorder || entry.value.swatch);
</script>

<template>
  <span
    :style="style"
    :class="[
      'inline-block shrink-0 rounded-full',
      showBorder ? 'border border-gray-300' : '',
      selected ? 'ring-2 ring-primary ring-offset-2' : '',
    ]"
  />
</template>
