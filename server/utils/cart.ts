/* eslint-disable camelcase */
import { randomInt } from 'node:crypto';
import type { H3Event } from 'h3';
import { serverSupabaseServiceRole } from '#supabase/server';


const PUBLIC_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PUBLIC_CODE_LENGTH = 6;
const MAX_QTY = 99;
const SESSION_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SupabaseClient = any;

type CartItemInput = {
  variant_id?: unknown
  variantId?: unknown
  product_variant_size_id?: unknown
  productVariantSizeId?: unknown
  size_id?: unknown
  sizeId?: unknown
  qty?: unknown
};

const toPositiveInt = (value: unknown, field: string) => {
  const number = typeof value === 'string' ? Number(value) : value;

  if (!Number.isInteger(number) || Number(number) <= 0) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}` });
  }

  return Number(number);
};

export const normalizeCartSessionId = (value: unknown) => {
  const sessionId = String(value || '').trim();

  if (!SESSION_ID_RE.test(sessionId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid session_id' });
  }

  return sessionId;
};

export const normalizeCartQty = (value: unknown) => {
  const qty = toPositiveInt(value, 'qty');

  return Math.min(MAX_QTY, qty);
};

export const normalizeCartItemInput = (input: CartItemInput) => ({
  variantId: toPositiveInt(input.variant_id ?? input.variantId, 'variant_id'),
  sizeId: toPositiveInt(
    input.product_variant_size_id ?? input.productVariantSizeId ?? input.size_id ?? input.sizeId,
    'product_variant_size_id',
  ),
  qty: normalizeCartQty(input.qty),
});

const generatePublicCode = () => {
  let code = '';

  for (let i = 0; i < PUBLIC_CODE_LENGTH; i += 1) {
    code += PUBLIC_CODE_ALPHABET[randomInt(PUBLIC_CODE_ALPHABET.length)];
  }

  return code;
};

const isUniqueConflict = (error: any) => error?.code === '23505';

const mapCart = (cart: any) => ({
  id: cart.id,
  userId: cart.user_id ?? null,
  sessionId: cart.session_id,
  status: cart.status,
  currency: cart.currency,
  publicCode: cart.public_code,
  updatedAt: cart.updated_at,
  expiresAt: cart.expires_at,
  checkoutStartedAt: cart.checkout_started_at,
  contactSnapshot: cart.contact_snapshot ?? null,
  meta: cart.meta ?? null,
});

export const mapCartItem = (item: any) => {
  const variant = item.variant ?? null;
  const product = variant?.product ?? null;
  const size = item.size ?? null;
  const images = Array.isArray(variant?.images) ?
    [...variant.images].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0)) :
    [];

  return {
    id: item.id,
    cartId: item.cart_id,
    variantId: item.variant_id,
    productVariantSizeId: item.product_variant_size_id,
    sizeId: item.product_variant_size_id,
    qty: item.qty,
    priceSnapshot: item.price_snapshot,
    productId: variant?.product_id ?? product?.id ?? null,
    productName: product?.title ?? null,
    slug: product?.slug ?? null,
    brand: product?.brand?.name ?? null,
    categoryName: product?.primary_category_id ? String(product.primary_category_id) : null,
    variantLabel: variant?.color ?? null,
    sizeLabel: size?.size ?? null,
    image: images[0]?.url ?? null,
  };
};

export const getCartItems = async (client: SupabaseClient, cartId: string) => {
  const { data, error } = await client
    .from('cart_items')
    .select(`
      id,
      cart_id,
      variant_id,
      product_variant_size_id,
      qty,
      price_snapshot,
      variant:product_variants!cart_items_variant_id_fkey(
        id,
        product_id,
        color,
        price,
        product:products!product_variants_product_id_fkey(
          id,
          title,
          slug,
          primary_category_id,
          brand:brands(name)
        ),
        images:product_variant_images!product_variant_images_variant_id_fkey(
          url,
          position
        )
      ),
      size:product_variant_sizes!cart_items_product_variant_size_id_fkey(
        id,
        size,
        variant_id
      )
    `)
    .eq('cart_id', cartId)
    .order('id', { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return (data || []).map(mapCartItem);
};

const findCartBySessionId = async (client: SupabaseClient, sessionId: string) => {
  const { data, error } = await client
    .from('carts')
    .select('*')
    .eq('session_id', sessionId)
    .in('status', ['DRAFT', 'CHECKOUT'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
};

const insertCart = async (client: SupabaseClient, sessionId: string) => {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await client
      .from('carts')
      .insert({
        session_id: sessionId,
        status: 'DRAFT',
        currency: 'AOA',
        public_code: generatePublicCode(),
        updated_at: now,
        expires_at: expiresAt,
        meta: {},
      })
      .select('*')
      .single();

    if (!error && data) {
      return data;
    }

    if (!isUniqueConflict(error)) {
      throw createError({
        statusCode: 500,
        statusMessage: error?.message || 'Failed to create cart',
      });
    }

    const existing = await findCartBySessionId(client, sessionId);

    if (existing) {
      return existing;
    }
  }

  throw createError({ statusCode: 500, statusMessage: 'Failed to generate cart code' });
};

export const getOrCreateCart = async (client: SupabaseClient, sessionId: string) => {
  const existing = await findCartBySessionId(client, sessionId);

  return existing || await insertCart(client, sessionId);
};

export const getVariantSnapshot = async (client: SupabaseClient, variantId: number, sizeId: number) => {
  const { data: variant, error: variantError } = await client
    .from('product_variants')
    .select('id, price, active')
    .eq('id', variantId)
    .maybeSingle();

  if (variantError) {
    throw createError({ statusCode: 500, statusMessage: variantError.message });
  }

  if (!variant || variant.active === false) {
    throw createError({ statusCode: 400, statusMessage: 'Variant not found' });
  }

  const { data: size, error: sizeError } = await client
    .from('product_variant_sizes')
    .select('id, variant_id')
    .eq('id', sizeId)
    .eq('variant_id', variantId)
    .maybeSingle();

  if (sizeError) {
    throw createError({ statusCode: 500, statusMessage: sizeError.message });
  }

  if (!size) {
    throw createError({ statusCode: 400, statusMessage: 'Size does not belong to variant' });
  }

  const price = Number(variant.price);

  if (!Number.isInteger(price) || price < 0) {
    throw createError({ statusCode: 500, statusMessage: 'Invalid variant price' });
  }

  return { price };
};

export const addOrUpdateCartItem = async (
  client: SupabaseClient,
  cartId: string,
  variantId: number,
  sizeId: number,
  qty: number,
  mode: 'add' | 'set',
) => {
  const { price } = await getVariantSnapshot(client, variantId, sizeId);

  const { data: existing, error: existingError } = await client
    .from('cart_items')
    .select('id, qty')
    .eq('cart_id', cartId)
    .eq('variant_id', variantId)
    .eq('product_variant_size_id', sizeId)
    .maybeSingle();

  if (existingError) {
    throw createError({ statusCode: 500, statusMessage: existingError.message });
  }

  if (existing) {
    const nextQty = Math.min(MAX_QTY, mode === 'add' ? Number(existing.qty || 0) + qty : qty);
    const { error } = await client
      .from('cart_items')
      .update({ qty: nextQty, price_snapshot: price })
      .eq('id', existing.id);

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
  } else {
    if (mode === 'set') {
      throw createError({ statusCode: 404, statusMessage: 'Cart item not found' });
    }

    const { error } = await client
      .from('cart_items')
      .insert({
        cart_id: cartId,
        variant_id: variantId,
        product_variant_size_id: sizeId,
        qty,
        price_snapshot: price,
      });

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
  }

};

export const serializeCart = async (client: SupabaseClient, cart: any) => ({
  cart: mapCart(cart),
  publicCode: cart.public_code,
  items: await getCartItems(client, cart.id),
});

export const getCartApiContext = async (
  event: H3Event,
  rawSessionId: unknown,
): Promise<{ client: SupabaseClient; sessionId: string; cart: any }> => {
  const client = await serverSupabaseServiceRole(event) as SupabaseClient;
  const sessionId = normalizeCartSessionId(rawSessionId);
  const cart = await getOrCreateCart(client, sessionId);

  return { client, sessionId, cart };
};
