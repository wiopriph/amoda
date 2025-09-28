type CartItem = {
  id: string // "productId:variantId"
  slug: string
  title: string
  image?: string
  price: number
  qty: number
}

const STORAGE_KEY = 'amoda:cart';

export function useCart() {
  const state = useState<CartItem[]>('cart:items', () => []);

  const loadFromStorage = () => {
    try {
      const rawData = localStorage.getItem(STORAGE_KEY);

      state.value = rawData ? (JSON.parse(rawData) as CartItem[]) : [];
    } catch {
      state.value = [];
    }
  };

  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
    } catch {}
  };

  if (process.client) {
    onMounted(loadFromStorage); // инициализация на клиенте
    watch(state, persist, { deep: true });
  }

  const items = computed(() => state.value);
  const count = computed(() =>
    state.value.reduce((totalQty, cartItem) => totalQty + cartItem.qty, 0),
  );
  const totalAOA = computed(() =>
    state.value.reduce((total, cartItem) => total + cartItem.price * cartItem.qty, 0),
  );
  const isEmpty = computed(() => state.value.length === 0);

  const add = (product: any, variant: any, qty = 1) => {
    if (!product?.id || !variant?.id) {
      throw new Error('product/variant missing');
    }

    const cartItemId = `${product.id}:${variant.id}`;
    const existingItem = state.value.find(cartItem => cartItem.id === cartItemId);

    if (existingItem) {
      existingItem.qty += qty;

      return;
    }

    state.value.push({
      id: cartItemId,
      slug: product.slug,
      title: `${product.title}${variant.size ? ` / ${variant.size}` : ''}${variant.color ? ` / ${variant.color}` : ''}`,
      image: product.images?.[0]?.url,
      price: variant.price,
      qty,
    });
  };

  const setQty = (cartItemId: string, qty: number) => {
    const targetItem = state.value.find(cartItem => cartItem.id === cartItemId);

    if (!targetItem) {
      return;
    }

    targetItem.qty = Math.max(1, Math.floor(qty));
  };

  const increment = (cartItemId: string) => {
    const targetItem = state.value.find(cartItem => cartItem.id === cartItemId);

    setQty(cartItemId, (targetItem?.qty ?? 0) + 1);
  };

  const decrement = (cartItemId: string) => {
    const targetItem = state.value.find(cartItem => cartItem.id === cartItemId);

    setQty(cartItemId, Math.max(1, (targetItem?.qty ?? 1) - 1));
  };

  const remove = (cartItemId: string) => {
    state.value = state.value.filter(cartItem => cartItem.id !== cartItemId);
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
