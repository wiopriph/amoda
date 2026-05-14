<script setup lang="ts">
definePageMeta({ name: 'admin-carts-code', layout: 'admin', middleware: 'admin' });


const route = useRoute();
const cartPublicCode = String(route.params.code || '');
const title = `Carrinho #${cartPublicCode}`;
const description = 'Ver detalhes do carrinho';

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

type CartStatus = 'DRAFT' | 'CHECKOUT' | 'ORDERED' | 'ABANDONED' | 'EXPIRED';

type CartItem = {
  id: number | string
  productName?: string | null
  image?: string | null
  qty: number
  priceSnapshot: number
  slug?: string | null
  brand?: string | null
  variantLabel?: string | null
  sizeLabel?: string | null
};

type AdminCart = {
  publicCode: string
  sessionId?: string | null
  userId?: string | null
  status: CartStatus
  updatedAt: string
  expiresAt?: string | null
  checkoutStartedAt?: string | null
  contactSnapshot?: {
    name?: string | null
    email?: string | null
    phone?: string | null
  } | null
  totals?: {
    total?: number
  } | null
  items: CartItem[]
};

const { data: cart, error: cartError, pending: isCartPending } = await useFetch<AdminCart>('/api/admin/carts/get', {
  query: { publicCode: cartPublicCode },
});

const statusLabels: Record<CartStatus, string> = {
  DRAFT: 'Rascunho',
  CHECKOUT: 'Checkout',
  ORDERED: 'Convertido',
  ABANDONED: 'Abandonado',
  EXPIRED: 'Expirado',
};

const getStatusLabel = (status?: CartStatus) => status ? statusLabels[status] || status : '—';

const getStatusColor = (status?: CartStatus) => {
  switch (status) {
    case 'CHECKOUT':
      return 'warning';
    case 'ORDERED':
      return 'success';
    case 'ABANDONED':
    case 'EXPIRED':
      return 'error';
    case 'DRAFT':
    default:
      return 'neutral';
  }
};

const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const formatDate = (date?: string | null) => date ? dateFormatter.format(new Date(date)) : '—';
const formatPrice = (price: number) => `${new Intl.NumberFormat('pt-AO').format(price)} AOA`;
const normalizePhoneNumber = (phone: string) => String(phone || '').replace(/[^\d+]/g, '');

const contact = computed(() => cart.value?.contactSnapshot || null);
const cartItems = computed(() => cart.value?.items || []);
const contactPhone = computed(() => String(contact.value?.phone || '').trim());
const contactPhoneHref = computed(() => {
  const normalizedPhone = normalizePhoneNumber(contactPhone.value);

  return normalizedPhone ? `tel:${normalizedPhone}` : null;
});
const whatsappPhone = computed(() => normalizePhoneNumber(contactPhone.value).replace(/\D/g, ''));
const whatsappHref = computed(() => {
  if (!whatsappPhone.value || !cart.value?.publicCode) return null;

  const message = `Olá! Sobre o carrinho ${cart.value.publicCode}.`;

  return `https://wa.me/${whatsappPhone.value}?text=${encodeURIComponent(message)}`;
});

const totalItemsCount = computed(() => cartItems.value.reduce((sum, item) => sum + Number(item.qty || 0), 0));

const formattedCartTotal = computed(() => {
  const cartTotal = cart.value?.totals?.total;

  return typeof cartTotal === 'number' ? formatPrice(cartTotal) : '—';
});

const getItemTotal = (item: CartItem) => Number(item.priceSnapshot || 0) * Number(item.qty || 0);
const getProductTo = (item: CartItem) => item.slug ? { name: 'product-slug', params: { slug: item.slug } } : undefined;
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :description="description"
      :ui="{ root: 'py-4', title: 'text-lg font-semibold md:text-xl' }"
    >
      <template #links>
        <div class="flex items-center gap-2">
          <UButton
            :to="{ name: 'admin-carts' }"
            variant="soft"
            icon="i-lucide-arrow-left"
          >
            Voltar
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <UPageBody class="max-w-5xl mx-auto">
      <UCard
        v-if="isCartPending"
        class="p-6 text-center text-gray-500"
      >
        A carregar...
      </UCard>

      <UAlert
        v-else-if="cartError || !cart"
        color="error"
        variant="soft"
        description="Carrinho não encontrado"
        icon="i-heroicons-exclamation-triangle"
      />

      <template v-else>
        <UCard class="mb-6">
          <div class="grid gap-6 md:grid-cols-3">
            <div class="space-y-1">
              <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Carrinho
              </p>

              <div class="flex items-center gap-2">
                <span
                  class="font-mono font-semibold"
                  v-text="cart.publicCode"
                />

                <UBadge
                  variant="subtle"
                  :color="getStatusColor(cart.status)"
                >
                  {{ getStatusLabel(cart.status) }}
                </UBadge>
              </div>

              <p class="text-sm text-gray-500">
                {{ totalItemsCount }} itens · {{ formattedCartTotal }}
              </p>
            </div>

            <div class="space-y-1">
              <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Contacto
              </p>

              <p
                class="font-semibold"
                v-text="contact?.name || '—'"
              />

              <p
                v-if="contact?.email"
                class="text-sm text-gray-500 break-all"
                v-text="contact.email"
              />

              <div class="flex items-center gap-2">
                <span
                  class="text-sm font-mono"
                  v-text="contactPhone || '—'"
                />

                <UButton
                  v-if="contactPhoneHref"
                  :to="contactPhoneHref"
                  size="xs"
                  variant="soft"
                  icon="i-lucide-phone"
                >
                  Ligar
                </UButton>

                <UButton
                  v-if="whatsappHref"
                  :to="whatsappHref"
                  size="xs"
                  variant="soft"
                  icon="i-lucide-message-circle"
                  target="_blank"
                >
                  WhatsApp
                </UButton>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Datas
              </p>

              <p class="text-sm">
                Atualizado: {{ formatDate(cart.updatedAt) }}
              </p>

              <p class="text-sm">
                Checkout: {{ formatDate(cart.checkoutStartedAt) }}
              </p>

              <p class="text-sm">
                Expira: {{ formatDate(cart.expiresAt) }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <h2 class="text-lg font-semibold mb-4">
            Itens
          </h2>

          <div
            v-if="!cartItems.length"
            class="py-8 text-center text-sm text-gray-500"
          >
            Carrinho sem itens
          </div>

          <div
            v-else
            class="divide-y divide-gray-200"
          >
            <div
              v-for="cartItem in cartItems"
              :key="cartItem.id"
              class="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div class="flex items-center gap-3 min-w-0">
                <NuxtImg
                  v-if="cartItem.image"
                  :src="cartItem.image"
                  class="w-16 h-16 rounded border object-cover flex-none"
                />

                <div
                  v-else
                  class="w-16 h-16 rounded border flex items-center justify-center text-xs text-gray-400 flex-none"
                >
                  —
                </div>

                <div class="min-w-0">
                  <NuxtLink
                    v-if="getProductTo(cartItem)"
                    :to="getProductTo(cartItem)"
                    class="font-medium line-clamp-2 hover:text-primary"
                  >
                    {{ cartItem.productName || '—' }}
                  </NuxtLink>

                  <div
                    v-else
                    class="font-medium line-clamp-2"
                    v-text="cartItem.productName || '—'"
                  />

                  <div class="mt-1 text-xs text-gray-500">
                    brand: {{ cartItem.brand || '—' }} · size: {{ cartItem.sizeLabel || '—' }} · color: {{ cartItem.variantLabel || '—' }}
                  </div>
                </div>
              </div>

              <div class="text-right md:min-w-[160px]">
                <div class="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
                  qtd / unid
                </div>

                <div class="text-sm text-gray-600">
                  {{ cartItem.qty }} × {{ formatPrice(cartItem.priceSnapshot) }}
                </div>

                <div
                  class="font-semibold"
                  v-text="formatPrice(getItemTotal(cartItem))"
                />
              </div>
            </div>
          </div>

          <div class="border-t mt-4 pt-3 text-right text-lg font-semibold">
            Total: {{ formattedCartTotal }}
          </div>
        </UCard>
      </template>
    </UPageBody>
  </UPage>
</template>
