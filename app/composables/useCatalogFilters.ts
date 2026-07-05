import { colorLabel } from '#shared/constants/colors';
import { PRICE_PRESET_MAP } from '#shared/constants/priceFilters';


export type CatalogFilters = {
  size?: string
  cor?: string
  preco?: string
  sort?: string
};

type ChipKey = keyof CatalogFilters;

const SORT_LABELS: Record<string, string> = {
  'price_asc': 'Preço ↑',
  'price_desc': 'Preço ↓',
};

// Reads/writes filter state from the URL (?size=&cor=&preco=&sort=).
// onApply lets the page reset any extra local state (e.g. a page ref) on filter change.
export function useCatalogFilters(onApply?: () => void) {
  const route = useRoute();
  const router = useRouter();

  const appliedFilters = computed<CatalogFilters>(() => ({
    size: (route.query.size as string) || undefined,
    cor: (route.query.cor as string) || undefined,
    preco: (route.query.preco as string) || undefined,
    sort: (route.query.sort as string) || undefined,
  }));

  const activeFilterCount = computed(() =>
    [appliedFilters.value.size, appliedFilters.value.cor, appliedFilters.value.preco].filter(Boolean).length,
  );

  const isFilterOpen = ref(false);

  const applyFilters = (filters: CatalogFilters) => {
    onApply?.();

    router.replace({
      query: {
        ...route.query,
        size: filters.size || undefined,
        cor: filters.cor || undefined,
        preco: filters.preco || undefined,
        sort: filters.sort || undefined,
        page: undefined,
      },
    });
  };

  const activeChips = computed(() => {
    const chips: { key: ChipKey; label: string }[] = [];
    const filters = appliedFilters.value;

    if (filters.size) {
      chips.push({ key: 'size', label: `Tam. ${filters.size}` });
    }

    if (filters.cor) {
      chips.push({ key: 'cor', label: colorLabel(filters.cor) });
    }

    if (filters.preco) {
      chips.push({ key: 'preco', label: PRICE_PRESET_MAP[filters.preco]?.label ?? '' });
    }

    if (filters.sort) {
      chips.push({ key: 'sort', label: SORT_LABELS[filters.sort] ?? '' });
    }

    return chips;
  });

  const removeChip = (key: ChipKey) => {
    applyFilters({ ...appliedFilters.value, [key]: undefined });
  };

  const clearAllFilters = () => {
    applyFilters({});
  };

  return {
    appliedFilters,
    activeFilterCount,
    isFilterOpen,
    applyFilters,
    activeChips,
    removeChip,
    clearAllFilters,
  };
}
