<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice';
import { couponLabel, type CouponSummary } from '#shared/constants/coupons';


const props = withDefaults(defineProps<{
  redirectTo?: string
  allowCode?: boolean
}>(), {
  redirectTo: '/checkout',
  allowCode: false,
});

const { user } = useAuth();
const isAccountUser = computed(() => Boolean(user.value));

const { applied, discount, error, isChecking, quote, remove } = useCheckoutCoupon();

const { data: welcome } = await useFetch<CouponSummary | null>('/api/coupons/welcome', {
  key: 'coupon-welcome',
  server: false,
  immediate: !isAccountUser.value,
  default: () => null,
});

const input = ref('');
const isFieldOpen = ref(false);

const apply = async () => {
  if (await quote(input.value.trim())) {
    input.value = '';
    isFieldOpen.value = false;
  }
};

const welcomeText = computed(() => (welcome.value ?
  `Tens ${couponLabel(welcome.value)} de desconto no primeiro pedido.` :
  'Tens um cupão de boas-vindas à tua espera.'));
</script>

<template>
  <div
    v-if="isAccountUser && applied"
    class="flex items-center justify-between gap-3 text-sm text-primary"
  >
    <span class="flex min-w-0 items-center gap-2">
      <UIcon
        name="i-lucide-ticket"
        class="size-4 shrink-0"
      />

      <span class="truncate">{{ applied.code }} · −{{ couponLabel(applied) }}</span>
    </span>

    <span class="flex shrink-0 items-center gap-1">
      <span
        class="font-semibold"
        v-text="`−${formatPrice(discount)}`"
      />

      <UButton
        variant="ghost"
        color="neutral"
        size="xs"
        icon="i-heroicons-x-mark"
        aria-label="Remover cupão"
        @click="remove"
      />
    </span>
  </div>

  <div v-else-if="isAccountUser && allowCode">
    <UButton
      variant="link"
      color="primary"
      size="sm"
      icon="i-lucide-ticket"
      class="px-0"
      @click="isFieldOpen = !isFieldOpen"
    >
      Tens um cupão?
    </UButton>

    <UFormField
      v-if="isFieldOpen"
      :error="error || undefined"
      class="mt-2"
    >
      <div class="flex gap-2">
        <UInput
          v-model="input"
          placeholder="Código do cupão"
          autocapitalize="characters"
          size="lg"
          class="w-full uppercase"
          @keydown.enter.prevent="apply"
        />

        <UButton
          :loading="isChecking"
          :disabled="!input.trim()"
          color="primary"
          variant="soft"
          size="lg"
          @click="apply"
        >
          Aplicar
        </UButton>
      </div>
    </UFormField>
  </div>

  <div
    v-else-if="!isAccountUser"
    class="rounded-xl border border-primary/15 bg-white/80 p-3"
  >
    <div class="flex items-start gap-2">
      <UIcon
        name="i-lucide-ticket"
        class="mt-0.5 size-4 shrink-0 text-primary"
      />

      <div class="min-w-0 text-sm leading-5">
        <div
          class="font-semibold text-highlighted"
          v-text="welcomeText"
        />

        <div class="text-muted">
          Entra com o teu número para o usar.
        </div>
      </div>
    </div>

    <UButton
      :to="{ name: 'entrar', query: { redirected_from: props.redirectTo } }"
      color="primary"
      variant="soft"
      size="sm"
      class="mt-3 w-full justify-center"
    >
      Entrar e usar o cupão
    </UButton>
  </div>
</template>
