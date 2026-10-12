import { couponReasonMessage, type CouponSummary } from '#shared/constants/coupons';


type CouponQuote = { ok: boolean; reason: string | null; coupon: CouponSummary | null; discount: number };

type CouponState = {
  applied: CouponSummary | null
  discount: number
  // Клиентка сняла автокупон руками: не подставлять его снова при пересчёте
  dismissedCode: string | null
};

// Купон общий для корзины и чекаута: применённый в корзине не пересчитывается заново в чекауте
export const useCheckoutCoupon = () => {
  const state = useState<CouponState>('checkout:coupon', () => ({ applied: null, discount: 0, dismissedCode: null }));
  const isChecking = useState<boolean>('checkout:coupon:checking', () => false);
  const error = ref<string | null>(null);

  const { user } = useAuth();
  const { items, totalKz, isLoading } = useCart();

  const isAccountUser = computed(() => Boolean(user.value));
  const applied = computed(() => state.value.applied);
  const discount = computed(() => state.value.discount);
  const total = computed(() => Math.max(0, totalKz.value - state.value.discount));

  const clear = () => {
    state.value = { applied: null, discount: 0, dismissedCode: state.value.dismissedCode };
    error.value = null;
  };

  // code пустой: лучший персональный купон (кроме снятого руками); с кодом: проверка публичного
  const quote = async (code?: string) => {
    if (!isAccountUser.value || !items.value.length) {
      clear();

      return false;
    }

    isChecking.value = true;
    error.value = null;

    try {
      const result = await $fetch<CouponQuote>('/api/account/coupons/quote', {
        method: 'POST',
        body: { code: code || undefined, subtotal: totalKz.value },
      });

      const isDismissedAuto = !code && result.coupon && result.coupon.code === state.value.dismissedCode;

      if (result.ok && result.coupon && !isDismissedAuto) {
        state.value = { ...state.value, applied: result.coupon, discount: result.discount };

        return true;
      }

      if (code) {
        error.value = couponReasonMessage(result.reason);
      } else {
        state.value = { ...state.value, applied: null, discount: 0 };
      }

      return false;
    } catch (quoteError: any) {
      if (code) {
        error.value = quoteError?.data?.message || couponReasonMessage(null);
      }

      return false;
    } finally {
      isChecking.value = false;
    }
  };

  const remove = () => {
    state.value = { applied: null, discount: 0, dismissedCode: state.value.applied?.code ?? null };
    error.value = null;
  };

  // Пересчёт при изменении корзины или входе; вызывается со страниц, где купон виден
  const watchCart = () => {
    if (!import.meta.client) {
      return;
    }

    watch(
      () => [isLoading.value, totalKz.value, isAccountUser.value] as const,
      ([loading]) => {
        if (loading) {
          return;
        }

        quote(state.value.applied?.code);
      },
      { immediate: true },
    );
  };

  return {
    applied,
    discount,
    total,
    error,
    isChecking,
    quote,
    remove,
    clear,
    watchCart,
  };
};
