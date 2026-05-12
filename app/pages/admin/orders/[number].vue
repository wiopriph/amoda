<script setup lang="ts">
definePageMeta({ name: 'admin-orders-number', layout: 'admin', middleware: 'admin' });


const route = useRoute();
const orderNumber = String(route.params.number || '');
const title = `Pedido #${orderNumber}`;
const description = 'Ver e atualizar detalhes do pedido';

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

const orderStatusValues = ['PLACED', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const;
const paymentStatusValues = ['UNPAID', 'PAID', 'REFUND_PARTIAL', 'REFUND_FULL'] as const;

type OrderStatus = (typeof orderStatusValues)[number];
type PaymentStatus = (typeof paymentStatusValues)[number];

type GuestContact = {
  name?: string | null
  email?: string | null
  phone?: string | null
};

type PickupOffice = {
  name?: string | null
  address?: string | null
  phone?: string | null
};

type OrderItem = {
  id: number | string
  title: string
  image?: string | null
  qty: number
  unitPrice: number
  totalPrice: number
  variant?: {
    size?: string | null
    color?: string | null
  } | null
};

type AdminOrder = {
  number: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  guestContact?: GuestContact | null
  pickupOffice?: PickupOffice | null
  items: OrderItem[]
  totals?: {
    total?: number
  } | null
};

const { data: order, error: orderError, pending: isOrderPending, refresh: refreshOrder } = await useFetch<AdminOrder>('/api/admin/orders/get', {
  query: { number: orderNumber },
});

const isSavingOrder = ref(false);
const selectedOrderStatus = ref<OrderStatus>('PLACED');
const selectedPaymentStatus = ref<PaymentStatus>('UNPAID');

const orderStatusLabels: Record<OrderStatus, string> = {
  PLACED: 'Novo',
  CONFIRMED: 'Confirmado',
  DELIVERED: 'Pronto para levantamento',
  CANCELLED: 'Cancelado',
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: 'Não pago',
  PAID: 'Pago',
  REFUND_PARTIAL: 'Reembolso parcial',
  REFUND_FULL: 'Reembolso total',
};

const orderStatusOptions = orderStatusValues.map(orderStatus => ({
  value: orderStatus,
  label: orderStatusLabels[orderStatus],
}));

const paymentStatusOptions = paymentStatusValues.map(paymentStatus => ({
  value: paymentStatus,
  label: paymentStatusLabels[paymentStatus],
}));

watchEffect(() => {
  if (!order.value) {
    return;
  }

  selectedOrderStatus.value = order.value.status || 'PLACED';
  selectedPaymentStatus.value = order.value.paymentStatus || 'UNPAID';
});

const formatPrice = (price: number) => `${new Intl.NumberFormat('pt-AO').format(price)} AOA`;
const normalizePhoneNumber = (phone: string) => String(phone || '').replace(/[^\d+]/g, '');

const guestContact = computed(() => order.value?.guestContact || null);
const pickupOffice = computed(() => order.value?.pickupOffice || null);
const orderItems = computed(() => order.value?.items || []);
const guestPhone = computed(() => String(guestContact.value?.phone || '').trim());
const normalizedGuestPhone = computed(() => normalizePhoneNumber(guestPhone.value));
const guestPhoneHref = computed(() => normalizedGuestPhone.value ? `tel:${normalizedGuestPhone.value}` : null);
const whatsappPhone = computed(() => normalizedGuestPhone.value.replace(/\D/g, ''));
const customerName = computed(() => String(guestContact.value?.name || '').trim() || 'cliente');
const pickupName = computed(() => String(pickupOffice.value?.name || 'Amoda'));
const pickupAddress = computed(() => String(pickupOffice.value?.address || ''));
const pickupPhone = computed(() => String(pickupOffice.value?.phone || ''));
const pickupPhoneHref = computed(() => pickupPhone.value ? `tel:${normalizePhoneNumber(pickupPhone.value)}` : null);

const formattedOrderTotal = computed(() => {
  const orderTotal = order.value?.totals?.total;

  return typeof orderTotal === 'number' ? formatPrice(orderTotal) : '—';
});

const whatsappMessageByStatus: Record<OrderStatus, (context: {
  name: string;
  orderNumber: string;
  pickupName: string;
  pickupAddress: string;
  pickupPhone: string;
  total: string;
}) => string> = {
  PLACED: ({ name, orderNumber, pickupName, total }) =>
    `Olá ${name}! Recebemos a sua encomenda nº ${orderNumber}. Total: ${total}. Em breve confirmaremos e avisaremos quando estiver pronta para levantamento em ${pickupName}. Obrigado! — Amoda`,
  CONFIRMED: ({ name, orderNumber, pickupName, total }) =>
    `Olá ${name}! A sua encomenda nº ${orderNumber} foi confirmada. Total: ${total}. Vamos preparar e avisar quando estiver pronta para levantamento em ${pickupName}. — Amoda`,
  DELIVERED: ({ name, orderNumber, pickupName, pickupAddress, pickupPhone }) =>
    `Olá ${name}! A sua encomenda nº ${orderNumber} está pronta para levantamento em ${pickupName}. Endereço: ${pickupAddress}. Contacto do ponto: ${pickupPhone}. Obrigado! — Amoda`,
  CANCELLED: ({ name, orderNumber }) =>
    `Olá ${name}. A sua encomenda nº ${orderNumber} foi cancelada. Se quiser, podemos ajudar a criar uma nova encomenda. — Amoda`,
};

const whatsappMessage = computed(() => {
  if (!order.value) return '';

  const makeMessage = whatsappMessageByStatus[selectedOrderStatus.value] || whatsappMessageByStatus.PLACED;

  return makeMessage({
    name: customerName.value,
    orderNumber: String(order.value.number || orderNumber),
    pickupName: pickupName.value,
    pickupAddress: pickupAddress.value,
    pickupPhone: pickupPhone.value,
    total: formattedOrderTotal.value,
  });
});

const whatsappHref = computed(() => {
  if (!whatsappPhone.value) return null;

  return `https://wa.me/${whatsappPhone.value}?text=${encodeURIComponent(whatsappMessage.value)}`;
});

const toast = useToast();

const saveOrder = async () => {
  if (!order.value) return;

  isSavingOrder.value = true;

  try {
    await $fetch('/api/admin/orders/update', {
      method: 'PATCH',
      body: {
        number: order.value.number,
        status: selectedOrderStatus.value,
        paymentStatus: selectedPaymentStatus.value,
      },
    });

    toast.add({ title: 'Salvo' });
    await refreshOrder();
  } catch (error: any) {
    toast.add({
      title: 'Falha ao salvar',
      description: error?.data?.message || error?.message || String(error),
      color: 'error',
    });
  } finally {
    isSavingOrder.value = false;
  }
};
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :ui="{ root: 'py-4', title: 'text-lg font-semibold md:text-xl' }"
    >
      <template #links>
        <div class="flex items-center gap-2">
          <USelect
            v-model="selectedOrderStatus"
            :items="orderStatusOptions"
            valueAttribute="value"
            optionAttribute="label"
            class="w-56"
          />

          <USelect
            v-model="selectedPaymentStatus"
            :items="paymentStatusOptions"
            valueAttribute="value"
            optionAttribute="label"
            class="w-56"
          />

          <UButton
            :loading="isSavingOrder"
            color="primary"
            icon="i-lucide-save"
            @click="saveOrder"
          >
            Salvar
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <UPageBody class="max-w-5xl mx-auto">
      <UCard
        v-if="isOrderPending"
        class="p-6 text-center text-gray-500"
      >
        A carregar...
      </UCard>

      <UAlert
        v-else-if="orderError || !order"
        color="error"
        variant="soft"
        description="Encomenda não encontrada"
        icon="i-heroicons-exclamation-triangle"
      />

      <template v-else>
        <UCard class="mb-6">
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-1">
              <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Contacto
              </p>

              <p
                class="font-semibold"
                v-text="order.guestContact?.name || '—'"
              />

              <p
                v-if="order.guestContact?.email"
                class="text-sm text-gray-500 break-all"
                v-text="order.guestContact?.email"
              />

              <div class="flex items-center gap-2">
                <span
                  class="text-sm font-mono"
                  v-text="guestPhone || '—'"
                />

                <UButton
                  v-if="guestPhoneHref"
                  :to="guestPhoneHref"
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
                Ponto de levantamento
              </p>

              <template v-if="pickupOffice">
                <p
                  class="font-semibold"
                  v-text="pickupOffice.name"
                />

                <p
                  class="text-sm text-gray-500"
                  v-text="pickupOffice.address"
                />

                <p class="text-sm mt-1">
                  <a
                    v-if="pickupPhoneHref"
                    :href="pickupPhoneHref"
                    class="text-primary underline underline-offset-2"
                    v-text="pickupOffice.phone"
                  />
                </p>
              </template>

              <template v-else>
                <p class="text-sm text-gray-500 italic">
                  Ponto de levantamento não selecionado
                </p>
              </template>
            </div>
          </div>
        </UCard>

        <UCard>
          <h2 class="text-lg font-semibold mb-4">
            Itens
          </h2>

          <div class="divide-y divide-gray-200">
            <div
              v-for="orderItem in orderItems"
              :key="orderItem.id"
              class="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div class="flex items-center gap-3 min-w-0">
                <NuxtImg
                  v-if="orderItem.image"
                  :src="orderItem.image"
                  class="w-16 h-16 rounded border object-cover flex-none"
                />

                <div
                  v-else
                  class="w-16 h-16 rounded border flex items-center justify-center text-xs text-gray-400 flex-none"
                >
                  —
                </div>

                <div class="min-w-0">
                  <div
                    class="font-medium line-clamp-2"
                    v-text="orderItem.title"
                  />

                  <div class="mt-1 text-xs text-gray-500">
                    size: {{ orderItem.variant?.size || '—' }} · color: {{ orderItem.variant?.color || '—' }}
                  </div>
                </div>
              </div>

              <div class="text-right md:min-w-[160px]">
                <div class="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
                  qtd / unid
                </div>

                <div class="text-sm text-gray-600">
                  {{ orderItem.qty }} × {{ formatPrice(orderItem.unitPrice) }}
                </div>

                <div
                  class="font-semibold"
                  v-text="formatPrice(orderItem.totalPrice)"
                />
              </div>
            </div>
          </div>

          <div class="border-t mt-4 pt-3 text-right text-lg font-semibold">
            Total: {{ formattedOrderTotal }}
          </div>
        </UCard>
      </template>
    </UPageBody>
  </UPage>
</template>
