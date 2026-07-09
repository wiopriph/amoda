<script setup lang="ts">
type Chip = { key: string; label: string };

defineProps<{
  activeFilterCount: number
  activeChips: Chip[]
  total?: number | null
}>();

const emit = defineEmits<{
  open: []
  removeChip: [key: string]
  clearAll: []
}>();

// The stuck bar hides while scrolling down (to free screen space) and slides
// back in when the user scrolls up. In its natural position it is always visible.
const barRef = useTemplateRef('bar');
const isBarHidden = ref(false);

// Matches -translate-y-[150%] in the template
const HIDE_TRANSLATE_RATIO = 1.5;
const SCROLL_DELTA_THRESHOLD = 6;

let lastScrollY = 0;

function handleScroll() {
  const bar = barRef.value;

  if (!bar) {
    return;
  }

  const currentY = window.scrollY;
  const delta = currentY - lastScrollY;

  // Accumulate tiny movements to avoid flicker on momentum jitter
  if (Math.abs(delta) < SCROLL_DELTA_THRESHOLD) {
    return;
  }

  lastScrollY = currentY;

  const rect = bar.getBoundingClientRect();
  const stickyTop = Number.parseFloat(getComputedStyle(bar).top) || 0;
  // The hide-translate shifts the rect up; add it back to test the layout position
  const layoutTop = rect.top + (isBarHidden.value ? rect.height * HIDE_TRANSLATE_RATIO : 0);
  const isStuck = layoutTop <= stickyTop + 1;

  isBarHidden.value = isStuck && delta > 0;
}

onMounted(() => {
  lastScrollY = window.scrollY;
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div
    ref="bar"
    :class="isBarHidden ? '-translate-y-[150%] opacity-0' : ''"
    class="sticky top-(--app-header-offset) z-30 -mx-2 mt-5 border-b border-gray-100 bg-white/85 px-4 py-2.5 backdrop-blur transition-[transform,opacity] duration-200 ease-out supports-[backdrop-filter]:bg-white/75 sm:mx-0 sm:rounded-2xl sm:border"
  >
    <div class="flex items-center gap-2">
      <UButton
        variant="solid"
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

      <div class="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden">
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
          class="shrink-0 whitespace-nowrap text-xs font-medium text-toned hover:text-primary"
          @click="emit('clearAll')"
        >
          Limpar
        </button>
      </div>

      <span
        v-if="total != null"
        class="shrink-0 whitespace-nowrap text-xs font-medium text-toned"
      >
        {{ total }} {{ total === 1 ? 'produto' : 'produtos' }}
      </span>
    </div>
  </div>
</template>
