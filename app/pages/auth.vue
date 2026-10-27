<script setup lang="ts">
// Вход администратора: e-mail + пароль или магическая ссылка. Клиентки входят по SMS на /entrar.
definePageMeta({ name: 'auth' });

useHead({
  title: 'Admin | Amoda',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

const { signIn, signInWithEmailLink, user, isAdmin, isLoading, error, signOut } = useAuth();
const { turnstileSiteKey } = useRuntimeConfig().public;
const route = useRoute();
const toast = useToast();

// Уже вошедший админ с redirected_from сразу уходит по адресу, ради которого пришел
if (user.value && isAdmin.value && route.query.redirected_from) {
  await navigateTo(route.query.redirected_from as string);
}

const form = reactive({ email: '', password: '' });
const linkEmail = ref('');

// Одна капча на обе формы: токен одноразовый, после каждой попытки сбрасываем
const captchaToken = ref('');
const captchaRef = ref<{ reset: () => void } | null>(null);

const takeCaptchaToken = () => {
  if (turnstileSiteKey && !captchaToken.value) {
    error.value = 'Confirma que não és um robô.';

    return null;
  }

  return captchaToken.value || undefined;
};

const onLogin = async () => {
  const token = takeCaptchaToken();

  if (token === null) {
    return;
  }

  const signedInUser = await signIn(form, token);

  captchaRef.value?.reset();

  if (signedInUser) {
    navigateTo((route.query.redirected_from as string) || { name: 'admin' });
  }
};

const onMagicLink = async () => {
  if (!linkEmail.value.trim()) {
    return;
  }

  const token = takeCaptchaToken();

  if (token === null) {
    return;
  }

  const ok = await signInWithEmailLink(linkEmail.value.trim(), token);

  captchaRef.value?.reset();

  if (ok) {
    toast.add({
      title: 'Link enviado',
      description: 'Verifica o e-mail e abre o link de acesso.',
      color: 'primary',
    });

    linkEmail.value = '';
  }
};
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-sm sm:px-6 lg:px-8">
      <UCard>
        <div class="mb-4 flex items-center gap-2 text-lg font-black text-highlighted">
          <UIcon
            name="i-lucide-shield-check"
            class="size-5 text-primary"
          />
          Amoda Admin
        </div>

        <div
          v-if="user"
          class="space-y-3"
        >
          <p
            class="break-all text-sm text-muted"
            v-text="user.email || user.phone"
          />

          <UButton
            v-if="isAdmin"
            :to="{ name: 'admin' }"
            color="primary"
            class="w-full justify-center"
          >
            Abrir painel
          </UButton>

          <UAlert
            v-else
            color="warning"
            variant="subtle"
            description="Esta conta não tem acesso ao painel."
          />

          <UButton
            variant="ghost"
            color="neutral"
            class="w-full justify-center"
            @click="signOut"
          >
            Sair
          </UButton>
        </div>

        <div
          v-else
          class="space-y-5"
        >
          <UForm
            class="space-y-4"
            @submit.prevent="onLogin"
          >
            <UFormField label="E-mail">
              <UInput
                v-model="form.email"
                type="email"
                autocomplete="email"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Palavra-passe">
              <UInput
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UButton
              :loading="isLoading"
              type="submit"
              color="primary"
              size="lg"
              class="w-full justify-center"
            >
              Entrar
            </UButton>
          </UForm>

          <UForm
            class="space-y-3 border-t border-gray-100 pt-5"
            @submit.prevent="onMagicLink"
          >
            <UFormField
              label="Entrada rápida"
              help="Enviamos um link de acesso para o e-mail."
            >
              <UInput
                v-model="linkEmail"
                type="email"
                autocomplete="email"
                placeholder="name@email.com"
                size="lg"
                class="w-full"
              />
            </UFormField>

            <UButton
              :loading="isLoading"
              type="submit"
              color="primary"
              variant="soft"
              size="lg"
              class="w-full justify-center"
            >
              Enviar link
            </UButton>
          </UForm>

          <AuthTurnstile
            ref="captchaRef"
            v-model="captchaToken"
          />

          <UAlert
            v-if="error"
            :description="error"
            color="error"
            variant="subtle"
            icon="i-heroicons-exclamation-triangle"
            class="text-sm"
          />
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>
