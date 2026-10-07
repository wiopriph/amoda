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

type ServerFavorite = FavoriteProduct & { addedAt: string };

export const FAVORITES_STORAGE_KEY = 'amoda:favorites';

const STORAGE_KEY = FAVORITES_STORAGE_KEY;

// Растёт при каждом локальном изменении: ответ синка, начатого раньше, не должен затирать более новое состояние
let changeVersion = 0;

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

const writeStorage = (items: FavoriteItem[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable — favorites stay in memory for the session
  }
};

const toItem = (product: FavoriteProduct, addedAt: number): FavoriteItem => ({
  productId: product.id,
  slug: product.slug,
  title: product.title,
  brandName: product.brand_name ?? null,
  price: product.price ?? null,
  image: product.image ?? null,
  addedAt,
});

const fromServer = (row: ServerFavorite) => toItem(row, new Date(row.addedAt).getTime() || Date.now());

// Гость: localStorage. Вошедшая клиентка: сервер (таблица favorites), локальное сливается при входе.
export function useFavorites() {
  const itemsState = useState<FavoriteItem[]>('favorites:items', () => []);
  const { user } = useAuth();
  const { trackAddToWishlist } = useAnalyticsEvent();
  const toast = useToast();

  const isServerMode = computed(() => Boolean(user.value));

  const persist = () => {
    if (!isServerMode.value) {
      writeStorage(itemsState.value);
    }
  };

  const notifyRollback = () => {
    toast.add({
      title: 'Não foi possível atualizar os favoritos',
      description: 'Verifica a ligação e tenta novamente.',
      color: 'error',
    });
  };

  const loadFromStorage = () => {
    itemsState.value = readStorage();
  };

  const syncFromServer = async () => {
    const local = readStorage();
    const startedAt = changeVersion;

    try {
      const rows = local.length ?
        await $fetch<ServerFavorite[]>('/api/account/favorites/merge', {
          method: 'POST',
          body: { product_ids: local.map(item => item.productId) },
        }) :
        await $fetch<ServerFavorite[]>('/api/account/favorites');

      // После слияния локальная копия не нужна — иначе после выхода она бы «воскресла»
      writeStorage([]);

      // Пока ждали ответ, клиентка что-то отметила: её изменения уже на сервере, старый снимок не применяем
      if (changeVersion === startedAt) {
        itemsState.value = rows.map(fromServer);
      }
    } catch {
      if (changeVersion === startedAt) {
        itemsState.value = local;
      }
    }
  };

  // Гость: перечитать localStorage; вошедшая: подтянуть с сервера
  const reload = () => (isServerMode.value ? syncFromServer() : Promise.resolve(loadFromStorage()));

  const isFavorite = (productId: number) => itemsState.value.some(item => item.productId === productId);

  const remove = async (productId: number) => {
    const removed = itemsState.value.find(item => item.productId === productId);

    changeVersion += 1;
    itemsState.value = itemsState.value.filter(item => item.productId !== productId);
    persist();

    if (!isServerMode.value) {
      return;
    }

    try {
      await $fetch(`/api/account/favorites/${productId}`, { method: 'DELETE' });
    } catch {
      // Откатываем только эту вещь: параллельные отметки других товаров уже могли успеть
      if (removed && !isFavorite(productId)) {
        itemsState.value = [removed, ...itemsState.value];
      }

      notifyRollback();
    }
  };

  const add = async (product: FavoriteProduct) => {
    if (!product?.id || isFavorite(product.id)) {
      return;
    }

    changeVersion += 1;
    itemsState.value = [toItem(product, Date.now()), ...itemsState.value];
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

    if (!isServerMode.value) {
      return;
    }

    try {
      await $fetch('/api/account/favorites', {
        method: 'POST',
        body: { product_id: product.id },
      });
    } catch {
      itemsState.value = itemsState.value.filter(item => item.productId !== product.id);
      notifyRollback();
    }
  };

  const toggle = (product: FavoriteProduct) => {
    if (isFavorite(product.id)) {
      return remove(product.id);
    }

    return add(product);
  };

  const items = computed(() => itemsState.value);
  const count = computed(() => itemsState.value.length);
  const isEmpty = computed(() => itemsState.value.length === 0);

  return {
    items,
    count,
    isEmpty,
    isServerMode,
    isFavorite,
    add,
    remove,
    toggle,
    reload,
  };
}
