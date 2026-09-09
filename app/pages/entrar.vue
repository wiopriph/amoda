<script setup lang="ts">
import { vMaska } from 'maska/vue';
import { normalizeAoPhone, formatAoPhone } from '#shared/utils/phone';


definePageMeta({ name: 'entrar' });

const title = 'Entrar | Amoda';
const description = 'Entra na tua conta Amoda com o teu número de telemóvel. Enviamos um código por SMS.';

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

const { user, isLoading, error, signInWithPhone, verifyPhoneOtp, resolveHomeRoute } = useAuth();
const { turnstileSiteKey } = useRuntimeConfig().public;
const route = useRoute();

const redirectTarget = computed(() => (route.query.redirected_from as string) || null);

// Уже вошла — сразу в кабинет
if (user.value) {
  await navigateTo(redirectTarget.value || resolveHomeRoute());
}

const step = ref<'phone' | 'code'>('phone');
const phoneInput = ref('');
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

  // Ошибка капчи — в общий error: он виден и на шаге кода, где тоже есть «enviar novo código»
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
    await navigateTo(redirectTarget.value || resolveHomeRoute(signedInUser));
  }
};

// 6 цифр введены — отправляем сами, без кнопки
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

const benefits = [
  { icon: 'i-lucide-list', title: 'Acompanha os teus pedidos' },
  { icon: 'i-heroicons-heart', title: 'Guarda favoritos' },
  { icon: 'i-lucide-zap', title: 'Pedidos mais rápidos' },
];
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-lg sm:px-6 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
          Entra na Amoda
        </h1>

        <p class="mt-2 text-sm leading-6 text-muted sm:text-base">
          Só precisas do teu número. Enviamos um código por SMS, sem palavras-passe.
        </p>

        <div class="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-toned">
          <div
            v-for="item in benefits"
            :key="item.title"
            class="flex items-center gap-2"
          >
            <UIcon
              :name="item.icon"
              class="size-4 text-primary"
            />

            <span v-text="item.title" />
          </div>
        </div>
      </section>

      <UCard class="mt-5">
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
              name="phone"
              type="tel"
              inputmode="tel"
              autocomplete="tel"
              placeholder="+244 XXX XXX XXX"
              size="xl"
              class="w-full"
              autofocus
            />
          </UFormField>

          <UButton
            :loading="isLoading"
            type="submit"
            color="primary"
            size="xl"
            class="w-full justify-center"
          >
            Enviar código
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
              name="code"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              placeholder="••••••"
              size="xl"
              class="w-full"
              :ui="{ base: 'text-center text-2xl tracking-[0.5em] font-black' }"
              autofocus
            />
          </UFormField>

          <UButton
            :loading="isLoading"
            type="submit"
            color="primary"
            size="xl"
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

        <!-- Один экземпляр на оба шага: токен одноразовый, повторная отправка кода тоже требует капчу -->
        <AuthTurnstile
          ref="captchaRef"
          v-model="captchaToken"
          class="mt-4"
        />
      </UCard>

      <p class="mt-4 text-center text-xs leading-5 text-muted">
        Ao entrar, aceitas os
        <NuxtLink
          :to="{ name: 'terms-of-use' }"
          class="underline underline-offset-2"
        >
          termos de uso
        </NuxtLink>
        e a
        <NuxtLink
          :to="{ name: 'privacy-policy' }"
          class="underline underline-offset-2"
        >
          política de privacidade
        </NuxtLink>.
      </p>
    </UPageBody>
  </UPage>
</template>
