<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';
import { vMaska } from 'maska/vue';
import { formatPrice } from '~/utils/formatPrice';
import { formatDate } from '~/utils/formatDate';


definePageMeta({ name: 'admin-coupons', layout: 'admin', middleware: 'admin' });

const title = 'Cupões';
const description = 'Descontos para pedidos feitos no site';

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');

type Coupon = {
  id: number
  code: string
  kind: 'public' | 'personal'
  discountType: 'percent' | 'fixed'
  value: number
  minSubtotal: number | null
  maxDiscount: number | null
  startsAt: string
  endsAt: string | null
  maxUses: number | null
  perUserLimit: number
  active: boolean
  note: string | null
  uses: number
  grants: number
};

type CouponForm = {
  id: number | null
  code: string
  kind: Coupon['kind']
  discountType: Coupon['discountType']
  value: number | null
  minSubtotal: number | null
  maxDiscount: number | null
  endsAt: string
  maxUses: number | null
  perUserLimit: number
  active: boolean
  note: string
};

const { data: coupons, refresh } = await useFetch<Coupon[]>('/api/admin/coupons/list');

const toast = useToast();

const kindOptions = [
  { value: 'public', label: 'Público (código introduzido pela cliente)' },
  { value: 'personal', label: 'Pessoal (atribuído a contas específicas)' },
];

const discountTypeOptions = [
  { value: 'percent', label: 'Percentagem' },
  { value: 'fixed', label: 'Valor fixo (kz)' },
];

const emptyForm = (): CouponForm => ({
  id: null,
  code: '',
  kind: 'public',
  discountType: 'percent',
  value: null,
  minSubtotal: null,
  maxDiscount: null,
  endsAt: '',
  maxUses: null,
  perUserLimit: 1,
  active: true,
  note: '',
});

const form = reactive<CouponForm>(emptyForm());
const isModalOpen = ref(false);
const isSaving = ref(false);

const modalTitle = computed(() => (form.id ? 'Editar cupão' : 'Novo cupão'));

const openCreate = () => {
  Object.assign(form, emptyForm());
  isModalOpen.value = true;
};

const openEdit = (coupon: Coupon) => {
  Object.assign(form, {
    id: coupon.id,
    code: coupon.code,
    kind: coupon.kind,
    discountType: coupon.discountType,
    value: coupon.value,
    minSubtotal: coupon.minSubtotal,
    maxDiscount: coupon.maxDiscount,
    endsAt: coupon.endsAt ? coupon.endsAt.slice(0, 10) : '',
    maxUses: coupon.maxUses,
    perUserLimit: coupon.perUserLimit,
    active: coupon.active,
    note: coupon.note || '',
  });

  isModalOpen.value = true;
};

const save = async () => {
  isSaving.value = true;

  try {
    await $fetch('/api/admin/coupons/save', {
      method: 'POST',
      body: {
        ...form,
        code: form.code.trim().toUpperCase(),
        endsAt: form.endsAt ? new Date(`${form.endsAt}T23:59:59`).toISOString() : null,
      },
    });

    toast.add({ title: form.id ? 'Cupão atualizado.' : 'Cupão criado.', color: 'success' });
    isModalOpen.value = false;
    await refresh();
  } catch (saveError: any) {
    toast.add({ title: saveError?.data?.statusMessage || 'Falha ao guardar cupão.', color: 'error' });
  } finally {
    isSaving.value = false;
  }
};

const toggleActive = async (coupon: Coupon) => {
  try {
    await $fetch('/api/admin/coupons/save', {
      method: 'POST',
      body: { ...coupon, active: !coupon.active },
    });

    await refresh();
  } catch (toggleError: any) {
    toast.add({ title: toggleError?.data?.statusMessage || 'Falha ao atualizar.', color: 'error' });
  }
};

// Выдача персонального купона по номеру
const grantCoupon = ref<Coupon | null>(null);
const grantPhone = ref('');
const isGranting = ref(false);
const isGrantModalOpen = computed({
  get: () => Boolean(grantCoupon.value),
  set: (open) => {
    if (!open) {
      grantCoupon.value = null;
    }
  },
});

const openGrant = (coupon: Coupon) => {
  grantPhone.value = '';
  grantCoupon.value = coupon;
};

const grant = async () => {
  if (!grantCoupon.value) {
    return;
  }

  isGranting.value = true;

  try {
    const result = await $fetch<{ ok: boolean; name: string | null }>('/api/admin/coupons/grant', {
      method: 'POST',
      body: { couponId: grantCoupon.value.id, phone: grantPhone.value },
    });

    toast.add({ title: `Cupão atribuído${result.name ? ` a ${result.name}` : ''}.`, color: 'success' });
    grantCoupon.value = null;
    await refresh();
  } catch (grantError: any) {
    toast.add({ title: grantError?.data?.statusMessage || 'Falha ao atribuir cupão.', color: 'error' });
  } finally {
    isGranting.value = false;
  }
};

// Использования
type Redemption = {
  id: number
  discount: number
  status: 'reserved' | 'consumed' | 'released'
  createdAt: string
  orderNumber: string | null
  orderStatus: string | null
  phone: string | null
};

const redemptionsCoupon = ref<Coupon | null>(null);
const redemptions = ref<Redemption[]>([]);
const isRedemptionsOpen = computed({
  get: () => Boolean(redemptionsCoupon.value),
  set: (open) => {
    if (!open) {
      redemptionsCoupon.value = null;
    }
  },
});

const REDEMPTION_LABELS: Record<Redemption['status'], string> = {
  reserved: 'Reservado',
  consumed: 'Usado',
  released: 'Devolvido',
};

const openRedemptions = async (coupon: Coupon) => {
  redemptionsCoupon.value = coupon;
  redemptions.value = await $fetch<Redemption[]>('/api/admin/coupons/redemptions', { query: { couponId: coupon.id } });
};

const discountLabel = (coupon: Coupon) => (coupon.discountType === 'percent' ? `${coupon.value}%` : formatPrice(coupon.value));

const columns: TableColumn<Coupon>[] = [
  {
    accessorKey: 'code',
    header: 'Código',
    cell: ({ row }) => h('div', [
      h('div', { class: 'font-semibold' }, row.original.code),
      row.original.note ? h('div', { class: 'text-xs text-muted' }, row.original.note) : null,
    ]),
  },
  {
    accessorKey: 'kind',
    header: 'Tipo',
    cell: ({ row }) => h(UBadge, { variant: 'subtle', color: row.original.kind === 'personal' ? 'primary' : 'neutral' }, () => (row.original.kind === 'personal' ? 'Pessoal' : 'Público')),
  },
  { accessorKey: 'value', header: 'Desconto', cell: ({ row }) => discountLabel(row.original) },
  {
    accessorKey: 'endsAt',
    header: 'Válido até',
    cell: ({ row }) => (row.original.endsAt ? formatDate(row.original.endsAt) : '—'),
  },
  {
    accessorKey: 'uses',
    header: 'Usos',
    cell: ({ row }) => `${row.original.uses}${row.original.maxUses ? ` / ${row.original.maxUses}` : ''}`,
  },
  {
    accessorKey: 'active',
    header: 'Ativo',
    cell: ({ row }) => h(UBadge, { variant: 'subtle', color: row.original.active ? 'success' : 'error' }, () => (row.original.active ? 'Ativo' : 'Inativo')),
  },
  {
    accessorKey: 'actions',
    header: '',
    meta: { class: { th: 'w-40 text-right', td: 'text-right' } },
    cell: ({ row }) => {
      const coupon = row.original;

      return h('div', { class: 'inline-flex gap-1' }, [
        h(UButton, { size: 'xs', variant: 'ghost', icon: 'i-lucide-list', title: 'Usos', onClick: () => openRedemptions(coupon) }),
        coupon.kind === 'personal' ?
          h(UButton, { size: 'xs', variant: 'ghost', icon: 'i-lucide-user-plus', title: 'Atribuir a cliente', onClick: () => openGrant(coupon) }) :
          null,
        h(UButton, { size: 'xs', variant: 'ghost', icon: 'i-lucide-pen-line', title: 'Editar', onClick: () => openEdit(coupon) }),
        h(UButton, {
          size: 'xs',
          variant: 'ghost',
          color: coupon.active ? 'error' : 'success',
          icon: coupon.active ? 'i-lucide-pause' : 'i-lucide-play',
          title: coupon.active ? 'Desativar' : 'Ativar',
          onClick: () => toggleActive(coupon),
        }),
      ]);
    },
  },
];
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :description="description"
    >
      <template #links>
        <UButton
          icon="i-lucide-plus"
          color="primary"
          @click="openCreate"
        >
          Novo cupão
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <UTable
          :data="coupons || []"
          :columns="columns"
          :loading="!coupons"
        />
      </UCard>
    </UPageBody>

    <UModal
      v-model:open="isModalOpen"
      :title="modalTitle"
    >
      <template #body>
        <UForm
          class="space-y-4"
          @submit.prevent="save"
        >
          <UFormField
            label="Código"
            help="Letras latinas e dígitos, sem espaços. Ex.: TIKTOK20"
            required
          >
            <UInput
              v-model="form.code"
              :disabled="Boolean(form.id)"
              class="w-full uppercase"
            />
          </UFormField>

          <UFormField label="Tipo">
            <USelect
              v-model="form.kind"
              :items="kindOptions"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-3">
            <UFormField label="Desconto">
              <USelect
                v-model="form.discountType"
                :items="discountTypeOptions"
                class="w-full"
              />
            </UFormField>

            <UFormField
              :label="form.discountType === 'percent' ? 'Percentagem' : 'Valor (kz)'"
              required
            >
              <UInput
                v-model.number="form.value"
                type="number"
                min="1"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UFormField
              label="Compra mínima (kz)"
              help="Vazio = sem mínimo"
            >
              <UInput
                v-model.number="form.minSubtotal"
                type="number"
                min="0"
                class="w-full"
              />
            </UFormField>

            <UFormField
              v-if="form.discountType === 'percent'"
              label="Desconto máximo (kz)"
              help="Vazio = sem limite"
            >
              <UInput
                v-model.number="form.maxDiscount"
                type="number"
                min="0"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UFormField
              label="Válido até"
              help="Vazio = sem prazo"
            >
              <UInput
                v-model="form.endsAt"
                type="date"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Limite total de usos"
              help="Vazio = ilimitado"
            >
              <UInput
                v-model.number="form.maxUses"
                type="number"
                min="1"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Usos por cliente">
            <UInput
              v-model.number="form.perUserLimit"
              type="number"
              min="1"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Nota interna">
            <UInput
              v-model="form.note"
              placeholder="ex.: campanha TikTok setembro"
              class="w-full"
            />
          </UFormField>

          <UCheckbox
            v-model="form.active"
            label="Ativo"
          />

          <div class="flex justify-end gap-3 pt-2">
            <UButton
              variant="ghost"
              @click="isModalOpen = false"
            >
              Cancelar
            </UButton>

            <UButton
              :loading="isSaving"
              type="submit"
              color="primary"
            >
              Guardar
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="isGrantModalOpen"
      :title="`Atribuir ${grantCoupon?.code || ''} a uma cliente`"
    >
      <template #body>
        <UForm
          class="space-y-4"
          @submit.prevent="grant"
        >
          <UFormField
            label="Número de telefone da cliente"
            help="A cliente já deve ter conta no site."
            required
          >
            <UInput
              v-model="grantPhone"
              v-maska="'+244 ### ### ###'"
              placeholder="+244 XXX XXX XXX"
              type="tel"
              class="w-full"
            />
          </UFormField>

          <div class="flex justify-end gap-3 pt-2">
            <UButton
              variant="ghost"
              @click="isGrantModalOpen = false"
            >
              Cancelar
            </UButton>

            <UButton
              :loading="isGranting"
              type="submit"
              color="primary"
            >
              Atribuir
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="isRedemptionsOpen"
      :title="`Usos de ${redemptionsCoupon?.code || ''}`"
    >
      <template #body>
        <p
          v-if="!redemptions.length"
          class="text-sm text-muted"
        >
          Ainda sem usos.
        </p>

        <div
          v-else
          class="divide-y divide-gray-100"
        >
          <div
            v-for="redemption in redemptions"
            :key="redemption.id"
            class="flex items-center justify-between gap-3 py-2 text-sm"
          >
            <div>
              <NuxtLink
                v-if="redemption.orderNumber"
                :to="{ name: 'admin-orders-number', params: { number: redemption.orderNumber } }"
                class="font-semibold text-primary"
              >
                #{{ redemption.orderNumber }}
              </NuxtLink>

              <div class="text-xs text-muted">
                {{ formatDate(redemption.createdAt) }} · {{ redemption.phone || '—' }}
              </div>
            </div>

            <div class="text-right">
              <div class="font-semibold">
                −{{ formatPrice(redemption.discount) }}
              </div>

              <div class="text-xs text-muted">
                {{ REDEMPTION_LABELS[redemption.status] }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </UPage>
</template>
