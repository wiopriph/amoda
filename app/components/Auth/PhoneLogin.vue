<script setup lang="ts">
import { vMaska } from 'maska/vue';
import { normalizeAoPhone, formatAoPhone } from '#shared/utils/phone';


// Вход по SMS: номер -> код. Используется на /entrar и прямо в чекауте
const props = withDefaults(defineProps<{
  compact?: boolean
  initialPhone?: string
}>(), {
  compact: false,
  initialPhone: '',
});

const emit = defineEmits<{ (event: 'success', user: any): void }>();

const { isLoading, error, signInWithPhone, verifyPhoneOtp } = useAuth();
const { turnstileSiteKey } = useRuntimeConfig().public;

const step = ref<'phone' | 'code'>('phone');
const phoneInput = ref(props.initialPhone);
const code = ref('');
const captchaToken = ref('');
const phoneError = ref<string | null>(null);
const codeError = ref<string | null>(null);
const captchaRef = ref<{ reset: () => void } | null>(null);

const phone = computed(() => normalizeAoPhone(phoneInput.value));

const RESEND_SECONDS = 60;
const resendIn = ref(0);

let resendTimer: ReturnType<typeof setInterval> | null = null;

const startResendTimer = () => {
  resendIn.value = RESEND_SECONDS;

  if (resendTimer) {
    clearInterval(resendTimer);
  }

  resendTimer = setInterval(() => {
    resendIn.value -= 1;

    if (resendIn.value <= 0 && resendTimer) {
      clearInterval(resendTimer);
      resendTimer = null;
    }
  }, 1000);
};

onBeforeUnmount(() => {
  if (resendTimer) {
    clearInterval(resendTimer);
  }
});

const requestCode = async () => {
  phoneError.value = null;

  if (!phone.value) {
    phoneError.value = 'Indica um número válido em Angola (+244 e 9 dígitos).';

    return;
  }

  // Ошибка капчи в общий error: он виден и на шаге кода, где есть «enviar novo código»
  if (turnstileSiteKey && !captchaToken.value) {
    error.value = 'Confirma que não és um robô.';

    return;
  }

  const ok = await signInWithPhone(phone.value, captchaToken.value || undefined);

  captchaRef.value?.reset();

  if (ok) {
    step.value = 'code';
    code.value = '';
    startResendTimer();
  }
};

const confirmCode = async () => {
  codeError.value = null;

  const token = code.value.replace(/\D/g, '');

  if (token.length !== 6 || !phone.value) {
    codeError.value = 'Introduz os 6 dígitos do código.';

    return;
  }

  const signedInUser = await verifyPhoneOtp(phone.value, token);

  if (signedInUser) {
    emit('success', signedInUser);
  }
};

watch(code, (value) => {
  if (value.replace(/\D/g, '').length === 6 && !isLoading.value) {
    confirmCode();
  }
});

const changePhone = () => {
  step.value = 'phone';
  code.value = '';
  error.value = null;
};

const inputSize = computed(() => (props.compact ? 'lg' : 'xl'));
</script>

<template>
  <div>
    <UForm
      v-if="step === 'phone'"
      class="space-y-4"
      @submit.prevent="requestCode"
    >
      <UFormField
        :error="phoneError || undefined"
        label="Número de telemóvel"
        required
      >
        <UInput
          v-model="phoneInput"
          v-maska="'+244 ### ### ###'"
          :size="inputSize"
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="+244 XXX XXX XXX"
          class="w-full"
        />
      </UFormField>

      <UButton
        :loading="isLoading"
        :size="inputSize"
        type="submit"
        color="primary"
        class="w-full justify-center"
      >
        Receber código por SMS
      </UButton>

      <UAlert
        v-if="error"
        :description="error"
        color="error"
        variant="subtle"
        icon="i-heroicons-exclamation-triangle"
        class="text-sm"
      />
    </UForm>

    <UForm
      v-else
      class="space-y-4"
      @submit.prevent="confirmCode"
    >
      <div class="text-sm text-muted">
        Enviámos um código para
        <span
          class="font-semibold text-highlighted"
          v-text="formatAoPhone(phone)"
        />.

        <UButton
          variant="link"
          color="primary"
          size="sm"
          class="px-1"
          @click="changePhone"
        >
          Mudar número
        </UButton>
      </div>

      <UFormField
        :error="codeError || undefined"
        label="Código de 6 dígitos"
        required
      >
        <UInput
          v-model="code"
          v-maska="'######'"
          :size="inputSize"
          name="code"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          placeholder="••••••"
          class="w-full"
          :ui="{ base: 'text-center text-2xl tracking-[0.5em] font-black' }"
          autofocus
        />
      </UFormField>

      <UButton
        :loading="isLoading"
        :size="inputSize"
        type="submit"
        color="primary"
        class="w-full justify-center"
      >
        Entrar
      </UButton>

      <UAlert
        v-if="error"
        :description="error"
        color="error"
        variant="subtle"
        icon="i-heroicons-exclamation-triangle"
        class="text-sm"
      />

      <div class="text-center text-sm text-muted">
        <span v-if="resendIn > 0">
          Podes pedir outro código em {{ resendIn }}s
        </span>

        <UButton
          v-else
          :loading="isLoading"
          variant="link"
          color="primary"
          size="sm"
          @click="requestCode"
        >
          Enviar novo código
        </UButton>
      </div>
    </UForm>

    <!-- Один экземпляр на оба шага: токен одноразовый, повторная отправка тоже требует капчу -->
    <AuthTurnstile
      ref="captchaRef"
      v-model="captchaToken"
      class="mt-4"
    />
  </div>
</template>
