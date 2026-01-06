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

const STORAGE_KEY = 'amoda:cart';
const isClient = typeof window !== 'undefined';

const toInt = (v: unknown): number => {
  const n = typeof v === 'string' ? Number(v) : (v as number);

  if (!Number.isFinite(n)) throw new Error('Invalid number');

  return Math.trunc(n);
};

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

export function useCart() {
  const state = useState<CartItem[]>('cart:items', () => []);

  const { trackAddToCart, trackRemoveFromCart } = useAnalyticsEvent();

  const toCartGa4Item = (i: CartItem, quantity: number) =>
    makeGa4Item({
      productId: i.productId,
      name: i.productName,
      brand: i.brand ?? undefined,
      categoryName: i.categoryName ?? undefined,
      price: i.price,
      quantity,
      variantId: i.variantId,
      sizeId: i.sizeId,
      variantLabel: i.variantLabel ?? undefined,
      sizeLabel: i.sizeLabel ?? undefined,
    });

  const loadFromStorage = () => {
    if (!isClient) return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as any[]) : [];

      if (!Array.isArray(parsed)) {
        state.value = [];

        return;
      }

      const normalized: CartItem[] = parsed.map((i) => {
        const productId = toInt(i.productId);
        const variantId = toInt(i.variantId);
        const sizeId = toInt(i.sizeId);

        const key = String(i.key || makeKey(productId, variantId, sizeId));

        const price = toInt(i.price ?? 0);
        const qty = Math.max(1, toInt(i.qty ?? 1));

        const productName = String(i.productName ?? i.title ?? '');

        return {
          key,

          productId,
          variantId,
          sizeId,

          productName,
          brand: (i.brand ?? null) as string | null,
          categoryName: (i.categoryName ?? null) as string | null,

          variantLabel: (i.variantLabel ?? null) as string | null,
          sizeLabel: (i.sizeLabel ?? null) as string | null,

          slug: String(i.slug ?? ''),
          image: i.image ?? null,
          price,
          qty,
        };
      });

      // мердж по key (если вдруг задублилось)
      const map = new Map<string, CartItem>();

      for (const item of normalized) {
        const exist = map.get(item.key);

        if (exist) exist.qty += item.qty;
        else map.set(item.key, item);
      }

      state.value = Array.from(map.values());
    } catch {
      state.value = [];
    }
  };

  const persist = () => {
    if (!isClient) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
    } catch {}
  };

  if (isClient) {
    onMounted(loadFromStorage);
    watch(state, persist, { deep: true });
  }

  const items = computed(() => state.value);
  const count = computed(() => state.value.reduce((acc, item) => acc + item.qty, 0));
  const totalAOA = computed(() => state.value.reduce((sum, item) => sum + item.price * item.qty, 0));
  const isEmpty = computed(() => state.value.length === 0);

  const add = (product: ProductLike, variant: VariantLike, size: SizeLike, qty = 1) => {
    if (!product?.id || !variant?.id || !size?.id) {
      throw new Error('product/variant/size missing');
    }

    const safeQty = Math.max(1, Math.floor(qty));

    const productId = toInt(product.id);
    const variantId = toInt(variant.id);
    const sizeId = toInt(size.id);

    const key = makeKey(productId, variantId, sizeId);

    const existing = state.value.find(i => i.key === key);

    if (existing) {
      existing.qty += safeQty;

      if (import.meta.client) {
        trackAddToCart({
          value: existing.price * safeQty,
          items: [toCartGa4Item(existing, safeQty)],
        });
      }

      return;
    }

    const next: CartItem = {
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
    };

    state.value.push(next);

    if (import.meta.client) {
      trackAddToCart({
        value: next.price * safeQty,
        items: [toCartGa4Item(next, safeQty)],
      });
    }
  };

  const setQty = (key: string, qty: number) => {
    const target = state.value.find(i => i.key === key);

    if (!target) return;

    const next = Math.max(1, Math.floor(qty));
    const prev = target.qty;

    if (next === prev) return;

    const delta = next - prev;

    if (import.meta.client) {
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

    target.qty = next;
  };

  const increment = (key: string) => {
    const target = state.value.find(i => i.key === key);

    if (!target) {
      return;
    }

    if (import.meta.client) {
      trackAddToCart({
        value: target.price,
        items: [toCartGa4Item(target, 1)],
      });
    }

    target.qty += 1;
  };

  const remove = (key: string) => {
    const target = state.value.find(i => i.key === key);

    if (!target) {
      return;
    }

    if (import.meta.client) {
      trackRemoveFromCart({
        value: target.price * target.qty,
        items: [toCartGa4Item(target, target.qty)],
      });
    }

    state.value = state.value.filter(i => i.key !== key);
  };

  const decrement = (key: string) => {
    const target = state.value.find(i => i.key === key);

    if (!target) {
      return;
    }

    if (target.qty <= 1) {
      // корректно: минус 1 при qty=1 == remove item
      remove(key);

      return;
    }

    if (import.meta.client) {
      trackRemoveFromCart({
        value: target.price,
        items: [toCartGa4Item(target, 1)],
      });
    }

    target.qty -= 1;
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
