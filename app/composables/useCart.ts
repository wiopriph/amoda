import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';


type CartItem = {
  id: string // "productId:variantId" или "productId:variantId:sizeId"
  slug: string
  title: string
  image?: string | null
  price: number // integer AOA
  qty: number
};

type ProductLike = {
  id: number
  slug: string
  title: string
  images?: { url: string }[] // на случай если где-то ещё остались product.images
};

type VariantLike = {
  id: number
  color?: string | null
  price: number
  images?: { url: string; position?: number | null }[]
  sizes?: { id: number | string; size: string; }[]
};

type SizeLike = {
  id: number
  size: string
};

const STORAGE_KEY = 'amoda:cart';
const isClient = typeof window !== 'undefined';

export function useCart() {
  const state = useState<CartItem[]>('cart:items', () => []);

  // ---- storage I/O ----
  const loadFromStorage = () => {
    if (!isClient) {
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      state.value = raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      state.value = [];
    }
  };

  const persist = () => {
    if (!isClient) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
    } catch {
      /* ignore */
    }
  };

  if (isClient) {
    onMounted(loadFromStorage);
    watch(state, persist, { deep: true });
  }

  const items = computed(() => state.value);
  const count = computed(() => state.value.reduce((acc, item) => acc + item.qty, 0));
  const totalAOA = computed(() => state.value.reduce((sum, item) => sum + item.price * item.qty, 0));
  const isEmpty = computed(() => state.value.length === 0);

  const pickPrimaryImage = (product?: ProductLike, variant?: VariantLike): string | null => {
    const variantImg = variant?.images && variant.images.length ?
      variant.images.slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url :
      null;
    const productImg = product?.images && product.images.length ? product.images[0]?.url : null;

    return variantImg || productImg || null;
  };

  /** Собрать ID формата productId:variantId(:sizeId) */
  const makeCartId = (productId: number | string, variantId: number | string, sizeId?: number | string | null) =>
    sizeId ? `${productId}:${variantId}:${sizeId}` : `${productId}:${variantId}`;


  const { trackAddToCart, trackRemoveFromCart } = useAnalyticsEvent();

  /**
   * Добавить товар в корзину (только из карточки товара).
   * @param product — товар
   * @param variant — вариант (цвет)
   * @param size — размер (если выбран)
   * @param qty — количество (>=1)
   */
  const add = (product: ProductLike, variant: VariantLike, size?: SizeLike | null, qty = 1) => {
    if (!product?.id || !variant?.id) {
      throw new Error('product/variant missing');
    }

    const safeQty = Math.max(1, Math.floor(qty));

    const cartId = makeCartId(product.id, variant.id, size?.id);
    const existing = state.value.find(i => i.id === cartId);

    if (existing) {
      existing.qty += safeQty;

      return;
    }

    const titleWithAttrs = `${product.title}${variant.color ? ` / ${variant.color}` : ''}${size?.size ? ` / ${size.size}` : ''}`;

    state.value.push({
      id: cartId,
      slug: product.slug,
      title: titleWithAttrs,
      image: pickPrimaryImage(product, variant),
      price: variant.price,
      qty: safeQty,
    });

    if (import.meta.client) {
      trackAddToCart({
        itemId: cartId,
        itemName: product.title,
        price: variant.price,
        quantity: safeQty,
        size: size?.size,
        variantId: variant?.id,
      });
    }
  };

  const setQty = (cartItemId: string, qty: number) => {
    const target = state.value.find(i => i.id === cartItemId);

    if (!target) {
      return;
    }

    target.qty = Math.max(1, Math.floor(qty));
  };

  const increment = (cartItemId: string) => {
    const target = state.value.find(i => i.id === cartItemId);

    if (!target) {
      return;
    }

    setQty(cartItemId, target.qty + 1);
  };

  const decrement = (cartItemId: string) => {
    const target = state.value.find(i => i.id === cartItemId);

    if (!target) {
      return;
    }

    if (import.meta.client) {
      trackRemoveFromCart({
        itemId: target.id,
        quantity: 1,
      });
    }

    setQty(cartItemId, Math.max(1, target.qty - 1));
  };

  const remove = (cartItemId: string) => {
    const target = state.value.find(i => i.id === cartItemId);

    if (!target) {
      return;
    }

    if (import.meta.client) {
      trackRemoveFromCart({
        itemId: target.id,
        quantity: target.qty,
      });
    }

    state.value = state.value.filter(i => i.id !== cartItemId);
  };

  const clear = () => {
    state.value = [];
  };

  return {
    items,
    count,
    totalAOA,
    isEmpty,

    add,
    setQty,
    increment,
    decrement,
    remove,
    clear,
  };
}
