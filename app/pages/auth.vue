<script setup lang="ts">
definePageMeta({ name: 'auth' });

const { t } = useI18n();

useHead({ title: t('auth.metaTitle') });

const route = useRoute();
const localeRoute = useLocaleRoute();
const toast = useToast();

const redirectTo = computed(() => route.query.redirected_from || localeRoute({ name: 'index' }));

const { signIn, signUp, signInOtp, signOut, user, isLoading, error } = useAuth();

const login = reactive({ email: '', password: '' });
const reg = reactive({ email: '', password: '' });
const otp = reactive({ email: '' });

const onLogin = async () => {
  const ok = await signIn(login);

  if (ok) {
    toast.add({ title: t('auth.welcomeBack'), color: 'primary' });
    navigateTo(redirectTo.value);
  }
};

const onRegister = async () => {
  const user = await signUp(reg);

  if (user) {
    toast.add({ title: t('auth.confirmEmail'), color: 'primary' });
  }
};

const onMagic = async () => {
  const ok = await signInOtp(otp.email);

  if (ok) {
    toast.add({
      title: t('auth.magicSent'),
      description: t('auth.checkEmail'),
      color: 'primary',
    });

    otp.email = '';
  }
};
</script>

<i18n lang="json">
{
  "pt": {
    "auth": {
      "title": "Entrar na sua conta Amoda",
      "login": "Entrar",
      "register": "Criar conta",
      "email": "E-mail",
      "password": "Palavra-passe",
      "magicTitle": "Ou entre sem palavra-passe",
      "magic": "Enviar link mágico",
      "checkEmail": "Verifique o seu e-mail — enviámos um link de acesso seguro.",
      "welcomeBack": "Bem-vindo de volta à Amoda!",
      "confirmEmail": "Confirme o seu e-mail para ativar a conta e começar a comprar online.",
      "logout": "Sair",
      "metaTitle": "Entrar ou criar conta | Amoda Angola",
      "magicSent": "Link mágico enviado para o seu e-mail",
      "hintLogin": "Use o seu e-mail e palavra-passe para aceder ou experimente o login rápido com link mágico.",
      "hintRegister": "Crie a sua conta Amoda para comprar roupas online com entrega gratuita e sem pagamento antecipado."
    }
  },
  "en": {
    "auth": {
      "title": "Sign in to your Amoda account",
      "login": "Sign in",
      "register": "Create account",
      "email": "E-mail",
      "password": "Password",
      "magicTitle": "Or sign in without a password",
      "magic": "Send magic link",
      "checkEmail": "Check your inbox — we’ve sent a secure login link.",
      "welcomeBack": "Welcome back to Amoda!",
      "confirmEmail": "Please confirm your email to activate your account and start shopping online.",
      "logout": "Sign out",
      "metaTitle": "Sign in or create account | Amoda Angola",
      "magicSent": "Magic link sent to your email",
      "hintLogin": "Use your email and password to log in, or try quick access with a magic link.",
      "hintRegister": "Create your Amoda account to shop clothes online with free delivery and no prepayment."
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader :title="t('auth.title')" />

    <UPageBody class="max-w-md mx-auto">
      <div
        v-if="user"
        class="mt-4 text-center"
      >
        <p v-if="user.email">
          {{ user.email }}
        </p>

        <UButton
          variant="ghost"
          @click="signOut"
        >
          {{ t('auth.logout') }}
        </UButton>
      </div>

      <UCard v-else>
        <UTabs
          :items="[
            { label: t('auth.login'), slot: 'login' },
            { label: t('auth.register'), slot: 'register' }
          ]"
        >
          <!-- LOGIN -->
          <template #login>
            <UAlert
              :description="t('auth.hintLogin')"
              icon="i-heroicons-information-circle"
              color="primary"
              variant="soft"
              class="text-sm mb-4"
            />

            <UForm
              class="space-y-4"
              @submit.prevent="onLogin"
            >
              <UFormField :label="t('auth.email')">
                <UInput
                  v-model="login.email"
                  type="email"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('auth.password')">
                <UInput
                  v-model="login.password"
                  type="password"
                  class="w-full"
                />
              </UFormField>

              <UButton
                :loading="isLoading"
                type="submit"
                color="primary"
                class="w-full justify-center"
              >
                {{ t('auth.login') }}
              </UButton>

              <div class="space-y-3 pt-2">
                <p class="text-sm text-gray-500">
                  {{ t('auth.magicTitle') }}
                </p>

                <div class="flex gap-2">
                  <UInput
                    v-model="otp.email"
                    type="email"
                    placeholder="name@email.com"
                    class="flex-1"
                  />

                  <UButton
                    variant="soft"
                    :loading="isLoading"
                    @click="onMagic"
                  >
                    {{ t('auth.magic') }}
                  </UButton>
                </div>
              </div>

              <UAlert
                v-if="error"
                :description="error"
                color="error"
                variant="subtle"
                icon="i-heroicons-exclamation-triangle"
                class="text-sm mt-3"
              />
            </UForm>
          </template>

          <!-- REGISTER -->
          <template #register>
            <UAlert
              :description="t('auth.hintRegister')"
              icon="i-heroicons-information-circle"
              color="primary"
              variant="soft"
              class="text-sm mb-4"
            />

            <UForm
              class="space-y-4"
              @submit.prevent="onRegister"
            >
              <UFormField :label="t('auth.email')">
                <UInput
                  v-model="reg.email"
                  type="email"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('auth.password')">
                <UInput
                  v-model="reg.password"
                  type="password"
                  class="w-full"
                />
              </UFormField>

              <UButton
                :loading="isLoading"
                type="submit"
                color="primary"
                class="w-full justify-center"
              >
                {{ t('auth.register') }}
              </UButton>

              <UAlert
                v-if="error"
                :description="error"
                color="error"
                variant="subtle"
                icon="i-heroicons-exclamation-triangle"
                class="text-sm mt-3"
              />
            </UForm>
          </template>
        </UTabs>
      </UCard>
    </UPageBody>
  </UPage>
</template>
