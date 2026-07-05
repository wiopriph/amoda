<script setup lang="ts">
import { colorLabel } from '#shared/constants/colors';
import { PRICE_PRESETS, pricePresetToQuery } from '#shared/constants/priceFilters';


type Facets = {
  colors: string[]
  sizes: string[]
  priceMin: number
  priceMax: number
};

type Filters = {
  size?: string
  cor?: string
  preco?: string
  sort?: string
};

const props = withDefaults(defineProps<{
  open: boolean
  facets?: Facets | null
  applied: Filters
  // Extra query merged into the count preview (e.g. { slug } or { q })
  baseQuery?: Record<string, any>
}>(), {
  facets: null,
  baseQuery: () => ({}),
});

const emit = defineEmits<{
  'update:open': [open: boolean]
  apply: [filters: Filters]
}>();

const sortOptions = [
  { label: 'Novidades', value: 'new' },
  { label: 'Preço: menor primeiro', value: 'price_asc' },
  { label: 'Preço: maior primeiro', value: 'price_desc' },
];

// Local staging — only committed on "Aplicar"
const staged = reactive<Filters>({ ...props.applied });

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      Object.assign(staged, {
        size: undefined,
        cor: undefined,
        preco: undefined,
        sort: undefined,
      }, props.applied);
    }
  },
);

const toggle = (key: keyof Filters, value: string) => {
  staged[key] = staged[key] === value ? undefined : value;
};

const activeCount = computed(() =>
  [staged.size, staged.cor, staged.preco].filter(Boolean).length,
);

const clearAll = () => {
  staged.size = undefined;
  staged.cor = undefined;
  staged.preco = undefined;
  staged.sort = undefined;
};

// Live result count for the staged selection
const countQuery = computed(() => ({
  ...props.baseQuery,
  size: staged.size,
  color: staged.cor,
  sort: staged.sort,
  ...pricePresetToQuery(staged.preco),
  limit: 1,
}));

const { data: countData, pending: isCounting } = useFetch('/api/catalog/list', {
  query: countQuery,
  watch: [countQuery],
  immediate: true,
});

const previewCount = computed(() => countData.value?.total ?? 0);

const apply = () => {
  emit('apply', { ...staged });
  emit('update:open', false);
};

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
});
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    title=" "
    :ui="{ container: 'mx-auto max-w-2xl' }"
  >
    <span class="hidden" />

    <template #body>
      <div class="flex max-h-[80vh] flex-col">
        <div class="flex items-center justify-between px-1 pb-3">
          <h2 class="text-lg font-bold text-highlighted">
            Filtrar
          </h2>

          <button
            v-if="activeCount || staged.sort"
            type="button"
            class="text-sm text-muted hover:text-primary"
            @click="clearAll"
          >
            Limpar tudo
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
          <div v-if="facets?.sizes?.length">
            <p class="mb-2 text-sm font-semibold text-toned">
              Tamanho
            </p>

            <div class="mb-5 flex flex-wrap gap-2">
              <button
                v-for="size in facets.sizes"
                :key="size"
                :class="staged.size === size
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-toned hover:border-primary/50'"
                type="button"
                class="min-w-11 rounded-xl border px-4 py-2.5 text-sm font-semibold transition"
                @click="toggle('size', size)"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <div v-if="facets?.colors?.length">
            <p class="mb-2 text-sm font-semibold text-toned">
              Cor
            </p>

            <div class="mb-5 flex flex-wrap gap-3">
              <button
                v-for="color in facets.colors"
                :key="color"
                type="button"
                class="flex flex-col items-center gap-1"
                :aria-label="colorLabel(color)"
                @click="toggle('cor', color)"
              >
                <ColorSwatch
                  :color="color"
                  :size="34"
                  :selected="staged.cor === color"
                />

                <span
                  :class="staged.cor === color ? 'text-primary font-semibold' : 'text-muted'"
                  class="text-[11px]"
                >
                  {{ colorLabel(color) }}
                </span>
              </button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-sm font-semibold text-toned">
              Preço
            </p>

            <div class="mb-6 flex flex-wrap gap-2">
              <button
                v-for="preset in PRICE_PRESETS"
                :key="preset.value"
                :class="staged.preco === preset.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-toned hover:border-primary/50'"
                type="button"
                class="rounded-xl border px-4 py-2.5 text-sm font-medium transition"
                @click="toggle('preco', preset.value)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <div>
            <p class="mb-2 text-sm font-semibold text-toned">
              Ordenar
            </p>

            <div class="mb-6 grid gap-2">
              <button
                v-for="option in sortOptions"
                :key="option.value"
                :class="(staged.sort || 'new') === option.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 text-toned hover:border-primary/50'"
                type="button"
                class="flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition"
                @click="staged.sort = option.value === 'new' ? undefined : option.value"
              >
                {{ option.label }}

                <UIcon
                  v-if="(staged.sort || 'new') === option.value"
                  name="i-lucide-check"
                  class="size-4"
                />
              </button>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-100 px-1 pt-3">
          <UButton
            :loading="isCounting"
            size="xl"
            color="primary"
            block
            @click="apply"
          >
            Ver {{ previewCount }} {{ previewCount === 1 ? 'resultado' : 'resultados' }}
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
