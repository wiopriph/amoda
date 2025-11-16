export type AnalyticsEventData = Record<string, unknown>;

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

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export interface AnalyticsProduct {
  id: number;
  name: string;
  brand?: string;
  price?: number;
  categoryId?: number
}

export interface AnalyticsCartItem {
  id: string; // составной id типа productId:variantId(:sizeId)
  name: string;
  price?: number;
  quantity: number;
}

/**
 * view_item_list — просмотр списка товаров (категория, поиск и т.п.)
 */
export interface ViewItemListPayload extends AnalyticsEventData {
  categoryId?: number
  categoryName?: string;
  items: AnalyticsProduct[];
  itemsCount: number;
}

/**
 * select_item — клик по карточке товара
 */
export interface SelectItemPayload extends AnalyticsEventData {
  itemId: number;
  itemName: string;
  price?: number;
  categoryId?: number
  categoryName?: string;
}

/**
 * view_item — просмотр карточки товара
 */
export interface ViewItemPayload extends AnalyticsEventData {
  itemId: number;
  itemName: string;
  price?: number;
  categoryId?: number
  categoryName?: string;
}

/**
 * add_to_cart — добавление товара в корзину
 */
export interface AddToCartPayload extends AnalyticsEventData {
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  size?: string;
  variantId?: number;
}

/**
 * remove_from_cart — удаление товара из корзины
 */
export interface RemoveFromCartPayload extends AnalyticsEventData {
  itemId: string;
  quantity: number;
  size?: string;
}

/**
 * begin_checkout — переход к оформлению заказа
 */
export interface BeginCheckoutPayload extends AnalyticsEventData {
  total: number;
  items: AnalyticsCartItem[];
  itemsCount: number;
}

/**
 * purchase — успешный заказ
 */
export interface PurchasePayload extends AnalyticsEventData {
  transactionId: string;
  total: number;
  items: AnalyticsCartItem[];
}

/**
 * search — поиск по сайту
 */
export interface SearchPayload extends AnalyticsEventData {
  query: string;
  resultsCount: number;
}

/**
 * filter_apply — применение фильтра
 */
export interface FilterApplyPayload extends AnalyticsEventData {
  filterType: string;   // 'size' | 'brand' | 'price' | ...
  filterValue: string;  // 'M', 'Nike', '1000-3000'
  categoryId?: number
}

export function useAnalyticsEvent() {
  const pushEvent = <T extends AnalyticsEventData = AnalyticsEventData>(
    event: string,
    data: T = {} as T,
  ): void => {
    if (
      process.env.NODE_ENV === 'production' &&
            import.meta.client &&
            typeof window !== 'undefined' &&
            'dataLayer' in window &&
            Array.isArray((window as any).dataLayer)
    ) {
      (window as any).dataLayer.push({ event, ...data });
    } else {
      console.log('pushEvent', { event, ...data });
    }
  };

  const trackViewItemList = (payload: ViewItemListPayload) => {
    pushEvent<ViewItemListPayload>(ANALYTICS_EVENTS.VIEW_ITEM_LIST, payload);
  };

  const trackSelectItem = (payload: SelectItemPayload) => {
    pushEvent<SelectItemPayload>(ANALYTICS_EVENTS.SELECT_ITEM, payload);
  };

  const trackViewItem = (payload: ViewItemPayload) => {
    pushEvent<ViewItemPayload>(ANALYTICS_EVENTS.VIEW_ITEM, payload);
  };

  const trackAddToCart = (payload: AddToCartPayload) => {
    pushEvent<AddToCartPayload>(ANALYTICS_EVENTS.ADD_TO_CART, payload);
  };

  const trackRemoveFromCart = (payload: RemoveFromCartPayload) => {
    pushEvent<RemoveFromCartPayload>(ANALYTICS_EVENTS.REMOVE_FROM_CART, payload);
  };

  const trackBeginCheckout = (payload: BeginCheckoutPayload) => {
    pushEvent<BeginCheckoutPayload>(ANALYTICS_EVENTS.BEGIN_CHECKOUT, payload);
  };

  const trackPurchase = (payload: PurchasePayload) => {
    pushEvent<PurchasePayload>(ANALYTICS_EVENTS.PURCHASE, payload);
  };

  const trackSearch = (payload: SearchPayload) => {
    pushEvent<SearchPayload>(ANALYTICS_EVENTS.SEARCH, payload);
  };

  const trackFilterApply = (payload: FilterApplyPayload) => {
    pushEvent<FilterApplyPayload>(ANALYTICS_EVENTS.FILTER_APPLY, payload);
  };

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
