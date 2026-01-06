import type { Ga4Item } from '~/composables/useAnalyticsEvent';


export const toGa4Variant = (variantId: number, sizeId: number) => `v${variantId}/s${sizeId}`;

export function makeGa4Item(input: {
  productId: number;
  name: string;
  brand?: string;
  price?: number;
  quantity?: number;
  variantId: number;
  sizeId: number;
  variantLabel?: string;
  sizeLabel?: string;
  categoryName?: string;
  listId?: string;
  listName?: string;
  index?: number;
}): Ga4Item {
  return {
    item_id: String(input.productId),
    item_name: input.name,
    item_brand: input.brand,
    item_category: input.categoryName,
    item_variant: input.variantLabel && input.sizeLabel ? `${input.variantLabel} / ${input.sizeLabel}` : toGa4Variant(input.variantId, input.sizeId),
    price: input.price,
    quantity: input.quantity,
    item_list_id: input.listId,
    item_list_name: input.listName,
    index: input.index,

    // custom params
    product_id: input.productId,
    variant_id: input.variantId,
    size_id: input.sizeId,
  };
}
