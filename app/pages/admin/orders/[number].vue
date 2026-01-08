<script setup lang="ts">
definePageMeta({ name: 'admin-orders-number', layout: 'admin', middleware: 'admin' });

const { t } = useI18n();
const route = useRoute();

const number = computed(() => String(route.params.number || ''));

const { data: orderData, error: orderError, pending: isPending, refresh } = await useFetch('/api/admin/orders/get', {
  query: { number },
});

const order = computed(() => (orderData.value as any) || null);

useHead(() => ({
  title: `${t('orderAdmin.title')} #${number.value} | Amoda Admin`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
}));

const toast = useToast();
const saving = ref(false);

const formatAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val)} AOA`;

const ORDER_STATUS_OPTIONS = ['PLACED', 'CONFIRMED', 'DELIVERED', 'CANCELLED'] as const;
const PAYMENT_STATUS_OPTIONS = ['UNPAID', 'PAID', 'REFUND_PARTIAL', 'REFUND_FULL'] as const;

type OrderStatus = (typeof ORDER_STATUS_OPTIONS)[number];
type PaymentStatus = (typeof PAYMENT_STATUS_OPTIONS)[number];

const status = ref<OrderStatus>('PLACED');
const paymentStatus = ref<PaymentStatus>('UNPAID');

watchEffect(() => {
  if (!order.value) return;

  status.value = String(order.value.status || 'PLACED') as OrderStatus;
  paymentStatus.value = String(order.value.paymentStatus || 'UNPAID') as PaymentStatus;
});


const orderStatusOptions = computed(() =>
  ORDER_STATUS_OPTIONS.map(v => ({
    value: v,
    label: t(`orderStatus.${v}`),
  })),
);

const paymentStatusOptions = computed(() =>
  PAYMENT_STATUS_OPTIONS.map(v => ({
    value: v,
    label: t(`paymentStatus.${v}`),
  })),
);


const cleanPhone = (v: string) => String(v || '').replace(/[^\d+]/g, '');
const phoneRaw = computed(() => String(order.value?.guestContact?.phone || '').trim());
const phoneTel = computed(() => cleanPhone(phoneRaw.value));
const telHref = computed(() => (phoneTel.value ? `tel:${phoneTel.value}` : null));
const waPhone = computed(() => phoneTel.value.replace(/\D/g, ''));

const pickupName = computed(() => String(order.value?.pickupOffice?.name || 'Amoda'));
const pickupAddress = computed(() => String(order.value?.pickupOffice?.address || ''));
const pickupPhone = computed(() => String(order.value?.pickupOffice?.phone || ''));
const customerName = computed(() => String(order.value?.guestContact?.name || '').trim() || 'cliente');

const totalAOA = computed(() => {
  const v = order.value?.totals?.total;

  return typeof v === 'number' ? formatAOA(v) : '—';
});


const ptMessageByStatus: Record<OrderStatus, (ctx: {
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

const waText = computed(() => {
  if (!order.value) return '';

  const make = ptMessageByStatus[status.value] || ptMessageByStatus.PLACED;

  return make({
    name: customerName.value,
    orderNumber: String(order.value.number || number.value),
    pickupName: pickupName.value,
    pickupAddress: pickupAddress.value,
    pickupPhone: pickupPhone.value,
    total: totalAOA.value,
  });
});

const waHref = computed(() => {
  if (!waPhone.value) return null;

  return `https://wa.me/${waPhone.value}?text=${encodeURIComponent(waText.value)}`;
});

const save = async () => {
  if (!order.value) return;

  saving.value = true;

  try {
    await $fetch('/api/admin/orders/update', {
      method: 'PATCH',
      body: {
        number: order.value.number,
        status: status.value,
        paymentStatus: paymentStatus.value,
      },
    });

    toast.add({ title: t('orderAdmin.saved') });
    await refresh();
  } catch (e: any) {
    toast.add({
      title: t('orderAdmin.saveError'),
      description: e?.data?.message || e?.message || String(e),
      color: 'error',
    });
  } finally {
    saving.value = false;
  }
};
</script>

<i18n lang="json">
{
  "en": {
    "orderAdmin": {
      "title": "Order",
      "loading": "Loading...",
      "notFound": "Order not found",
      "status": "Status",
      "paymentStatus": "Payment status",
      "save": "Save",
      "saved": "Saved",
      "saveError": "Save failed",
      "contact": "Contact",
      "call": "Call",
      "whatsapp": "WhatsApp",
      "pickup": "Pickup point",
      "notSelected": "Pickup point not selected",
      "items": "Items",
      "total": "Total",
      "qtyUnit": "qty / unit"
    },
    "orderStatus": {
      "PLACED": "Placed",
      "CONFIRMED": "Confirmed",
      "DELIVERED": "Delivered",
      "CANCELLED": "Cancelled"
    },
    "paymentStatus": {
      "UNPAID": "Unpaid",
      "PAID": "Paid",
      "REFUND_PARTIAL": "Partial refund",
      "REFUND_FULL": "Full refund"
    }
  },
  "pt": {
    "orderAdmin": {
      "title": "Pedido",
      "loading": "A carregar...",
      "notFound": "Encomenda não encontrada",
      "status": "Status",
      "paymentStatus": "Status do pagamento",
      "save": "Salvar",
      "saved": "Salvo",
      "saveError": "Falha ao salvar",
      "contact": "Contacto",
      "call": "Ligar",
      "whatsapp": "WhatsApp",
      "pickup": "Ponto de levantamento",
      "notSelected": "Ponto de levantamento não selecionado",
      "items": "Itens",
      "total": "Total",
      "qtyUnit": "qtd / unid"
    },
    "orderStatus": {
      "PLACED": "Novo",
      "CONFIRMED": "Confirmado",
      "DELIVERED": "Pronto para levantamento",
      "CANCELLED": "Cancelado"
    },
    "paymentStatus": {
      "UNPAID": "Não pago",
      "PAID": "Pago",
      "REFUND_PARTIAL": "Reembolso parcial",
      "REFUND_FULL": "Reembolso total"
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="`${t('orderAdmin.title')} #${number}`"
      :ui="{ root: 'py-4', title: 'text-lg font-semibold md:text-xl' }"
    >
      <template #links>
        <div class="flex items-center gap-2">
          <USelect
            v-model="status"
            :items="orderStatusOptions"
            valueAttribute="value"
            optionAttribute="label"
            class="w-56"
          />

          <USelect
            v-model="paymentStatus"
            :items="paymentStatusOptions"
            valueAttribute="value"
            optionAttribute="label"
            class="w-56"
          />

          <UButton
            color="primary"
            icon="i-lucide-save"
            :loading="saving"
            @click="save"
          >
            {{ t('orderAdmin.save') }}
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <UPageBody class="max-w-5xl mx-auto">
      <UCard
        v-if="isPending"
        class="p-6 text-center text-gray-500"
      >
        {{ t('orderAdmin.loading') }}
      </UCard>

      <UAlert
        v-else-if="orderError || !order"
        color="error"
        variant="soft"
        :description="t('orderAdmin.notFound')"
        icon="i-heroicons-exclamation-triangle"
      />

      <template v-else>
        <UCard class="mb-6">
          <div class="grid gap-6 md:grid-cols-2">
            <!-- CONTACT -->
            <div class="space-y-1">
              <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {{ t('orderAdmin.contact') }}
              </p>

              <p class="font-semibold">
                {{ order.guestContact?.name || '—' }}
              </p>

              <p
                v-if="order.guestContact?.email"
                class="text-sm text-gray-500 break-all"
              >
                {{ order.guestContact.email }}
              </p>

              <div class="flex items-center gap-2">
                <span class="text-sm font-mono">{{ phoneRaw || '—' }}</span>

                <UButton
                  v-if="telHref"
                  size="xs"
                  variant="soft"
                  icon="i-lucide-phone"
                  :to="telHref"
                >
                  {{ t('orderAdmin.call') }}
                </UButton>

                <UButton
                  v-if="waHref"
                  size="xs"
                  variant="soft"
                  icon="i-lucide-message-circle"
                  :to="waHref"
                  target="_blank"
                >
                  {{ t('orderAdmin.whatsapp') }}
                </UButton>
              </div>
            </div>

            <!-- PICKUP -->
            <div class="space-y-1">
              <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {{ t('orderAdmin.pickup') }}
              </p>

              <template v-if="order.pickupOffice">
                <p class="font-semibold">
                  {{ order.pickupOffice.name }}
                </p>

                <p class="text-sm text-gray-500">
                  {{ order.pickupOffice.address }}
                </p>

                <p class="text-sm mt-1">
                  <a
                    :href="`tel:${order.pickupOffice.phone}`"
                    class="text-primary underline underline-offset-2"
                  >
                    {{ order.pickupOffice.phone }}
                  </a>
                </p>
              </template>

              <template v-else>
                <p class="text-sm text-gray-500 italic">
                  {{ t('orderAdmin.notSelected') }}
                </p>
              </template>
            </div>
          </div>
        </UCard>

        <!-- ITEMS -->
        <UCard>
          <h2 class="text-lg font-semibold mb-4">
            {{ t('orderAdmin.items') }}
          </h2>

          <div class="divide-y divide-gray-200">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div class="flex items-center gap-3 min-w-0">
                <NuxtImg
                  v-if="item.image"
                  :src="item.image"
                  class="w-16 h-16 rounded border object-cover flex-none"
                />

                <div
                  v-else
                  class="w-16 h-16 rounded border flex items-center justify-center text-xs text-gray-400 flex-none"
                >
                  —
                </div>

                <div class="min-w-0">
                  <div class="font-medium line-clamp-2">
                    {{ item.title }}
                  </div>

                  <div class="mt-1 text-xs text-gray-500">
                    size: {{ item.variant?.size || '—' }} · color: {{ item.variant?.color || '—' }}
                  </div>
                </div>
              </div>

              <div class="text-right md:min-w-[160px]">
                <div class="text-xs uppercase tracking-wide text-gray-400 mb-0.5">
                  {{ t('orderAdmin.qtyUnit') }}
                </div>

                <div class="text-sm text-gray-600">
                  {{ item.qty }} × {{ formatAOA(item.unitPrice) }}
                </div>

                <div class="font-semibold">
                  {{ formatAOA(item.totalPrice) }}
                </div>
              </div>
            </div>
          </div>

          <div class="border-t mt-4 pt-3 text-right text-lg font-semibold">
            {{ t('orderAdmin.total') }}: {{ formatAOA(order.totals?.total || 0) }}
          </div>
        </UCard>
      </template>
    </UPageBody>
  </UPage>
</template>
