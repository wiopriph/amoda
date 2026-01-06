export const ANALYTICS_EVENTS = {
  VIEW_ITEM_LIST: 'view_item_list',
  SELECT_ITEM: 'select_item',
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
  SEARCH: 'search',
  FILTER_APPLY: 'filter_apply',
} as const;

export type Ga4Item = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
  item_list_id?: string;
  item_list_name?: string;
  index?: number;
  coupon?: string;
  discount?: number;

  // custom params
  product_id?: number;
  variant_id?: number;
  size_id?: number;
};

const CURRENCY = 'AOA' as const;

type ViewItemListPayload = {
  listId?: string;
  listName?: string;
  items: Ga4Item[]
};

type SelectItemPayload = {
  listId?: string;
  listName?: string;
  items: Ga4Item[]
};

type ViewItemPayload = { items: Ga4Item[] };

type AddToCartPayload = {
  value?: number;
  items: Ga4Item[]
};

type RemoveFromCartPayload = {
  value?: number;
  items: Ga4Item[]
};

type BeginCheckoutPayload = {
  value: number;
  items: Ga4Item[]
};

type PurchasePayload = {
  transaction_id: string;
  value: number;
  tax?: number;
  shipping?: number;
  coupon?: string;
  items: Ga4Item[]
};

type SearchPayload = {
  search_term: string;
  results_count?: number
};

type FilterApplyPayload = {
  filter_type: string;
  filter_value: string;
  category_id?: number
};

type PushParams = Record<string, unknown>;

export function useAnalyticsEvent() {
  const canPush =
        process.env.NODE_ENV === 'production' &&
        import.meta.client &&
        typeof window !== 'undefined' &&
        'dataLayer' in window &&
        Array.isArray((window as any).dataLayer);

  const push = (obj: PushParams) => {
    if (canPush) {
      (window as any).dataLayer.push(obj);
    } else {
      console.log('dataLayer.push', obj);
    }
  };

  const resetEcommerce = () => push({ ecommerce: null });

  const pushEvent = (event: string, params: PushParams = {}) => push({ event, ...params });

  const trackViewItemList = (p: ViewItemListPayload) => {
    resetEcommerce();

    pushEvent(ANALYTICS_EVENTS.VIEW_ITEM_LIST, {
      ecommerce: {
        currency: CURRENCY,
        item_list_id: p.listId,
        item_list_name: p.listName,
        items: p.items,
      },
    });
  };

  const trackSelectItem = (p: SelectItemPayload) => {
    resetEcommerce();

    pushEvent(ANALYTICS_EVENTS.SELECT_ITEM, {
      ecommerce: {
        currency: CURRENCY,
        item_list_id: p.listId,
        item_list_name: p.listName,
        items: p.items,
      },
    });
  };

  const trackViewItem = (p: ViewItemPayload) => {
    resetEcommerce();

    pushEvent(ANALYTICS_EVENTS.VIEW_ITEM, {
      ecommerce: {
        currency: CURRENCY,
        items: p.items,
      },
    });
  };

  const trackAddToCart = (p: AddToCartPayload) => {
    resetEcommerce();

    pushEvent(ANALYTICS_EVENTS.ADD_TO_CART, {
      ecommerce: {
        currency: CURRENCY,
        value: p.value,
        items: p.items,
      },
    });
  };

  const trackRemoveFromCart = (p: RemoveFromCartPayload) => {
    resetEcommerce();

    pushEvent(ANALYTICS_EVENTS.REMOVE_FROM_CART, {
      ecommerce: {
        currency: CURRENCY,
        value: p.value,
        items: p.items,
      },
    });
  };

  const trackBeginCheckout = (p: BeginCheckoutPayload) => {
    resetEcommerce();

    pushEvent(ANALYTICS_EVENTS.BEGIN_CHECKOUT, {
      ecommerce: {
        currency: CURRENCY,
        value: p.value,
        items: p.items,
      },
    });
  };

  const trackPurchase = (p: PurchasePayload) => {
    resetEcommerce();

    pushEvent(ANALYTICS_EVENTS.PURCHASE, {
      ecommerce: {
        transaction_id: p.transaction_id,
        currency: CURRENCY,
        value: p.value,
        items: p.items,

        tax: p.tax,
        shipping: p.shipping,
        coupon: p.coupon,
      },
    });
  };

  const trackSearch = (p: SearchPayload) => pushEvent(ANALYTICS_EVENTS.SEARCH, p);
  const trackFilterApply = (p: FilterApplyPayload) => pushEvent(ANALYTICS_EVENTS.FILTER_APPLY, p);

  return {
    pushEvent,
    trackViewItemList,
    trackSelectItem,
    trackViewItem,
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackPurchase,

    trackSearch,
    trackFilterApply,
  };
}
