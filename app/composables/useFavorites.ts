/* eslint-disable camelcase */
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';


export type FavoriteProduct = {
  id: number;
  slug: string;
  title: string;
  brand_name?: string | null;
  price?: number | null;
  image?: string | null;
};

type FavoriteItem = {
  productId: number;
  slug: string;
  title: string;
  brandName: string | null;
  price: number | null;
  image: string | null;
  addedAt: number;
};

const STORAGE_KEY = 'amoda:favorites';

const readStorage = (): FavoriteItem[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(item => item && Number.isFinite(Number(item.productId)) && typeof item.slug === 'string' && item.slug);
  } catch {
    return [];
  }
};

export function useFavorites() {
  const itemsState = useState<FavoriteItem[]>('favorites:items', () => []);
  const initialized = useState<boolean>('favorites:initialized', () => false);

  const { trackAddToWishlist } = useAnalyticsEvent();

  // Load after hydration so the client's first render matches the SSR markup
  if (import.meta.client && !initialized.value) {
    initialized.value = true;

    onNuxtReady(() => {
      itemsState.value = readStorage();

      window.addEventListener('storage', (storageEvent) => {
        if (storageEvent.key === STORAGE_KEY) {
          itemsState.value = readStorage();
        }
      });
    });
  }

  const persist = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsState.value));
    } catch {
      // storage full or unavailable — favorites stay in memory for the session
    }
  };

  const isFavorite = (productId: number) => itemsState.value.some(item => item.productId === productId);

  const remove = (productId: number) => {
    itemsState.value = itemsState.value.filter(item => item.productId !== productId);
    persist();
  };

  const add = (product: FavoriteProduct) => {
    if (!product?.id || isFavorite(product.id)) {
      return;
    }

    itemsState.value = [
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        brandName: product.brand_name ?? null,
        price: product.price ?? null,
        image: product.image ?? null,
        addedAt: Date.now(),
      },
      ...itemsState.value,
    ];

    persist();

    if (import.meta.client) {
      trackAddToWishlist({
        value: product.price ?? undefined,
        items: [{
          item_id: String(product.id),
          item_name: product.title,
          item_brand: product.brand_name ?? undefined,
          price: product.price ?? undefined,
          quantity: 1,
          product_id: product.id,
        }],
      });
    }
  };

  const toggle = (product: FavoriteProduct) => {
    if (isFavorite(product.id)) {
      remove(product.id);
    } else {
      add(product);
    }
  };

  const items = computed(() => itemsState.value);
  const count = computed(() => itemsState.value.length);
  const isEmpty = computed(() => itemsState.value.length === 0);

  return {
    items,
    count,
    isEmpty,
    isFavorite,
    add,
    remove,
    toggle,
  };
}
