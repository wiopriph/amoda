/* eslint-disable camelcase */
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


type CartItem = {
  key: string;
  productId: number;
  variantId: number;
  sizeId: number;
  productName: string;
  brand?: string | null;
  categoryName?: string | null;
  sizeLabel?: string | null;
  variantLabel?: string | null;
  slug: string;
  image?: string | null;
  price: number;
  qty: number;
};

type ProductLike = {
  id: number;
  slug: string;
  title: string;
  brand_name?: string | null;
  primary_category_id?: number | null;
  images?: { url: string }[];
};

type VariantLike = {
  id: number;
  color?: string | null;
  price: number;
  images?: { url: string; position?: number | null }[];
};

type SizeLike = {
  id: number;
  size: string;
};

type ServerCartResponse = {
  cart?: {
    publicCode?: string | null
    contactSnapshot?: Record<string, any> | null
  }
  publicCode?: string | null
  items?: any[]
};

const MAX_QTY = 99;
const QTY_UPDATE_DEBOUNCE_MS = 500;

let initPromise: Promise<void> | null = null;

const qtyUpdateTimers = new Map<string, ReturnType<typeof setTimeout>>();
const qtyUpdateVersions = new Map<string, number>();

const toInt = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'string' ? Number(value) : value;

  if (!Number.isFinite(n)) {
    return fallback;
  }

  return Math.trunc(Number(n));
};

const clampQty = (qty: unknown) => Math.min(MAX_QTY, Math.max(1, Math.floor(Number(qty) || 1)));

const makeKey = (productId: number, variantId: number, sizeId: number) => `p${productId}-v${variantId}-s${sizeId}`;

const pickPrimaryImage = (product?: ProductLike, variant?: VariantLike): string | null => {
  const variantImg =
        variant?.images?.length ?
          variant.images
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]?.url :
          null;

  const productImg = product?.images?.length ? product.images[0]?.url : null;

  return variantImg || productImg || null;
};

const normalizeServerItem = (item: any): CartItem => {
  const productId = toInt(item.productId ?? item.product_id);
  const variantId = toInt(item.variantId ?? item.variant_id);
  const sizeId = toInt(item.sizeId ?? item.productVariantSizeId ?? item.product_variant_size_id);

  return {
    key: makeKey(productId, variantId, sizeId),
    productId,
    variantId,
    sizeId,
    productName: String(item.productName ?? item.product_name ?? ''),
    brand: item.brand ?? null,
    categoryName: item.categoryName ?? item.category_name ?? null,
    sizeLabel: item.sizeLabel ?? item.size_label ?? null,
    variantLabel: item.variantLabel ?? item.variant_label ?? null,
    slug: String(item.slug ?? ''),
    image: item.image ?? null,
    price: toInt(item.priceSnapshot ?? item.price_snapshot ?? item.price),
    qty: clampQty(item.qty),
  };
};

export function useCart() {
  const itemsState = useState<CartItem[]>('cart:items', () => []);
  const isLoading = useState<boolean>('cart:loading', () => true);
  const initialized = useState<boolean>('cart:initialized', () => false);
  const sessionId = useState<string | null>('cart:sessionId', () => null);
  const publicCode = useState<string | null>('cart:publicCode', () => null);
  const contactSnapshot = useState<Record<string, any> | null>('cart:contactSnapshot', () => null);
  const isPending = useState<boolean>('cart:pending', () => false);
  const error = useState<string | null>('cart:error', () => null);

  const { trackAddToCart, trackRemoveFromCart } = useAnalyticsEvent();

  const currentSessionId = () => sessionId.value || useCookie<string | null>('sid').value || null;

  const applyServerCart = (response: ServerCartResponse | null | undefined) => {
    if (!response) {
      return;
    }

    publicCode.value = response.publicCode ?? response.cart?.publicCode ?? publicCode.value;
    contactSnapshot.value = response.cart?.contactSnapshot ?? contactSnapshot.value;
    itemsState.value = Array.isArray(response.items) ? response.items.map(normalizeServerItem) : [];
  };

  const requestCart = async <T extends ServerCartResponse>(url: string, body: Record<string, any>) => {
    const sid = currentSessionId();

    if (!sid) {
      throw new Error('Cart session is missing');
    }

    sessionId.value = sid;
    isPending.value = true;

    try {
      const response = await $fetch<T>(url, {
        method: 'POST',
        body: {
          session_id: sid,
          ...body,
        },
      });

      applyServerCart(response);
      error.value = null;

      return response;
    } catch (requestError: any) {
      error.value = requestError?.data?.message || requestError?.message || 'Cart request failed';
      throw requestError;
    } finally {
      isPending.value = false;
    }
  };

  const initCart = async (sid?: string | null) => {
    if (initialized.value) {
      return;
    }

    if (initPromise) {
      return initPromise;
    }

    sessionId.value = sid || currentSessionId();

    initPromise = (async () => {
      if (!sessionId.value) {
        isLoading.value = false;
        initialized.value = true;

        return;
      }

      isLoading.value = true;

      try {
        await requestCart('/api/cart/init', {});
      } catch {
        itemsState.value = [];
      } finally {
        isLoading.value = false;
        initialized.value = true;
        initPromise = null;
      }
    })();

    return initPromise;
  };

  const toCartGa4Item = (item: CartItem, quantity: number) =>
    makeGa4Item({
      productId: item.productId,
      name: item.productName,
      brand: item.brand ?? undefined,
      categoryName: item.categoryName ?? undefined,
      price: item.price,
      quantity,
      variantId: item.variantId,
      sizeId: item.sizeId,
      variantLabel: item.variantLabel ?? undefined,
      sizeLabel: item.sizeLabel ?? undefined,
    });

  const cancelScheduledQtyUpdate = (key: string) => {
    const timer = qtyUpdateTimers.get(key);

    if (timer) {
      clearTimeout(timer);
      qtyUpdateTimers.delete(key);
    }

    qtyUpdateVersions.set(key, (qtyUpdateVersions.get(key) || 0) + 1);
  };

  const cancelAllScheduledQtyUpdates = () => {
    for (const timer of qtyUpdateTimers.values()) {
      clearTimeout(timer);
    }

    qtyUpdateTimers.clear();
    qtyUpdateVersions.clear();
  };

  const scheduleQtyUpdate = (item: CartItem) => {
    const nextVersion = (qtyUpdateVersions.get(item.key) || 0) + 1;
    const snapshot = {
      key: item.key,
      variantId: item.variantId,
      sizeId: item.sizeId,
      qty: item.qty,
    };

    const existingTimer = qtyUpdateTimers.get(item.key);

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    qtyUpdateVersions.set(item.key, nextVersion);

    qtyUpdateTimers.set(item.key, setTimeout(async () => {
      qtyUpdateTimers.delete(snapshot.key);

      const sid = currentSessionId();

      if (!sid || qtyUpdateVersions.get(snapshot.key) !== nextVersion) {
        return;
      }

      isPending.value = true;

      try {
        const response = await $fetch<ServerCartResponse>('/api/cart/items/update', {
          method: 'POST',
          body: {
            session_id: sid,
            variant_id: snapshot.variantId,
            product_variant_size_id: snapshot.sizeId,
            qty: snapshot.qty,
          },
        });

        if (qtyUpdateVersions.get(snapshot.key) === nextVersion) {
          applyServerCart(response);
          error.value = null;
        }
      } catch (requestError: any) {
        if (qtyUpdateVersions.get(snapshot.key) === nextVersion) {
          error.value = requestError?.data?.message || requestError?.message || 'Cart request failed';
        }
      } finally {
        if (qtyUpdateVersions.get(snapshot.key) === nextVersion) {
          isPending.value = false;
        }
      }
    }, QTY_UPDATE_DEBOUNCE_MS));
  };

  const addItem = async (product: ProductLike, variant: VariantLike, size: SizeLike, qty = 1) => {
    if (!product?.id || !variant?.id || !size?.id) {
      throw new Error('product/variant/size missing');
    }

    const safeQty = clampQty(qty);
    const productId = toInt(product.id);
    const variantId = toInt(variant.id);
    const sizeId = toInt(size.id);
    const key = makeKey(productId, variantId, sizeId);
    const existing = itemsState.value.find(item => item.key === key);

    const previousItems = [...itemsState.value];

    if (existing) {
      existing.qty = Math.min(MAX_QTY, existing.qty + safeQty);
    } else {
      itemsState.value.push({
        key,
        productId,
        variantId,
        sizeId,
        productName: product.title,
        brand: product.brand_name ?? null,
        categoryName: product.primary_category_id ? String(product.primary_category_id) : null,
        variantLabel: variant.color ?? null,
        sizeLabel: size.size ?? null,
        slug: product.slug,
        image: pickPrimaryImage(product, variant),
        price: toInt(variant.price),
        qty: safeQty,
      });
    }

    const trackedItem = itemsState.value.find(item => item.key === key);

    if (import.meta.client && trackedItem) {
      trackAddToCart({
        value: trackedItem.price * safeQty,
        items: [toCartGa4Item(trackedItem, safeQty)],
      });
    }

    try {
      cancelScheduledQtyUpdate(key);

      await requestCart('/api/cart/items/add', {
        variant_id: variantId,
        product_variant_size_id: sizeId,
        qty: safeQty,
      });
    } catch {
      itemsState.value = previousItems;
    }
  };

  const updateQty = async (key: string, qty: number) => {
    const target = itemsState.value.find(item => item.key === key);

    if (!target) {
      return;
    }

    const nextQty = clampQty(qty);
    const previousQty = target.qty;

    if (nextQty === previousQty) {
      return;
    }

    target.qty = nextQty;

    if (import.meta.client) {
      const delta = nextQty - previousQty;

      if (delta > 0) {
        trackAddToCart({
          value: target.price * delta,
          items: [toCartGa4Item(target, delta)],
        });
      } else {
        trackRemoveFromCart({
          value: target.price * Math.abs(delta),
          items: [toCartGa4Item(target, Math.abs(delta))],
        });
      }
    }

    scheduleQtyUpdate(target);
  };

  const removeItem = async (key: string) => {
    const target = itemsState.value.find(item => item.key === key);

    if (!target) {
      return;
    }

    const previousItems = [...itemsState.value];

    cancelScheduledQtyUpdate(key);
    itemsState.value = itemsState.value.filter(item => item.key !== key);

    if (import.meta.client) {
      trackRemoveFromCart({
        value: target.price * target.qty,
        items: [toCartGa4Item(target, target.qty)],
      });
    }

    try {
      await requestCart('/api/cart/items/remove', {
        variant_id: target.variantId,
        product_variant_size_id: target.sizeId,
      });
    } catch {
      itemsState.value = previousItems;
    }
  };

  const increment = (key: string) => {
    const target = itemsState.value.find(item => item.key === key);

    if (target) {
      return updateQty(key, target.qty + 1);
    }
  };

  const decrement = (key: string) => {
    const target = itemsState.value.find(item => item.key === key);

    if (!target) {
      return;
    }

    if (target.qty <= 1) {
      return removeItem(key);
    }

    return updateQty(key, target.qty - 1);
  };

  const clearCart = async () => {
    const previousItems = [...itemsState.value];

    cancelAllScheduledQtyUpdates();
    itemsState.value = [];

    try {
      await requestCart('/api/cart/clear', {});
    } catch {
      itemsState.value = previousItems;
    }
  };

  const startCheckout = async (contact?: unknown) =>
    requestCart('/api/cart/checkout-started', { contact: contact ?? null });

  const items = computed(() => itemsState.value);
  const count = computed(() => itemsState.value.reduce((acc, item) => acc + item.qty, 0));
  const totalKz = computed(() => itemsState.value.reduce((sum, item) => sum + item.price * item.qty, 0));
  const isEmpty = computed(() => itemsState.value.length === 0);

  const getQty = (productId: number, variantId: number, sizeId: number) =>
    itemsState.value.find(item => item.key === makeKey(productId, variantId, sizeId))?.qty ?? 0;

  const hasItem = (productId: number, variantId: number, sizeId: number) => getQty(productId, variantId, sizeId) > 0;

  const getByKey = (key: string) => itemsState.value.find(item => item.key === key) ?? null;

  return {
    items,
    count,
    totalKz,
    isEmpty,
    isLoading,
    publicCode,
    contactSnapshot,
    isPending,
    error,
    initCart,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    startCheckout,
    add: addItem,
    setQty: updateQty,
    increment,
    decrement,
    remove: removeItem,
    clear: clearCart,
    getQty,
    hasItem,
    getByKey,
  };
}
