<script setup lang="ts">
definePageMeta({ name: 'auth' });

const { t, tm, rt } = useI18n();

useHead(() => ({
  title: t('auth.metaTitle'),
  meta: [
    { name: 'description', content: t('auth.metaDescription') },
    { property: 'og:title', content: t('auth.metaTitle') },
    { property: 'og:description', content: t('auth.metaDescription') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const route = useRoute();
const localeRoute = useLocaleRoute();
const toast = useToast();

const redirectTo = computed(() => route.query.redirected_from || localeRoute({ name: 'index' }));

const { signIn, signUp, signInOtp, signOut, user, isLoading, error } = useAuth();

const login = reactive({ email: '', password: '' });
const reg = reactive({ email: '', password: '' });
const otp = reactive({ email: '' });

const benefits = computed(() =>
  (tm('auth.benefits') as any[]).map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
  })),
);

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
      "title": "Entre na Amoda",
      "subtitle": "Guarde a sua seleção, acompanhe reservas e compre roupa sem pagamento antecipado.",
      "login": "Entrar",
      "register": "Criar conta",
      "email": "E-mail",
      "password": "Palavra-passe",
      "magicTitle": "Entrada rápida",
      "magicDesc": "Receba um link seguro no e-mail.",
      "magic": "Enviar link",
      "checkEmail": "Verifique o seu e-mail - enviámos um link de acesso seguro.",
      "welcomeBack": "Bem-vindo de volta à Amoda!",
      "confirmEmail": "Confirme o seu e-mail para ativar a conta.",
      "logout": "Sair",
      "metaTitle": "Entrar na Amoda {'|'} Conta para reservas de moda feminina",
      "metaDescription": "Entre ou crie conta na Amoda para guardar a sua seleção, acompanhar reservas e comprar moda feminina sem pagamento antecipado.",
      "magicSent": "Link mágico enviado",
      "accountTitle": "A sua conta",
      "accountDesc": "Você já está autenticado.",
      "continue": "Continuar a comprar",
      "benefits": [
        {
          "icon": "i-lucide-wallet",
          "title": "Sem pagamento online"
        },
        {
          "icon": "i-lucide-shirt",
          "title": "Experimente antes"
        },
        {
          "icon": "i-lucide-check-circle-2",
          "title": "Pague só o que gostar"
        }
      ]
    }
  },
  "en": {
    "auth": {
      "title": "Sign in to Amoda",
      "subtitle": "Save your selection, manage reservations and shop clothes with no prepayment.",
      "login": "Sign in",
      "register": "Create account",
      "email": "E-mail",
      "password": "Password",
      "magicTitle": "Quick access",
      "magicDesc": "Get a secure login link by email.",
      "magic": "Send link",
      "checkEmail": "Check your inbox - we’ve sent a secure login link.",
      "welcomeBack": "Welcome back to Amoda!",
      "confirmEmail": "Please confirm your email to activate your account.",
      "logout": "Sign out",
      "metaTitle": "Sign in to Amoda {'|'} Account for fashion reservations",
      "metaDescription": "Sign in or create an Amoda account to save your selection, manage reservations and shop women's fashion with no prepayment.",
      "magicSent": "Magic link sent",
      "accountTitle": "Your account",
      "accountDesc": "You are already signed in.",
      "continue": "Continue shopping",
      "benefits": [
        {
          "icon": "i-lucide-wallet",
          "title": "No online payment"
        },
        {
          "icon": "i-lucide-shirt",
          "title": "Try before paying"
        },
        {
          "icon": "i-lucide-check-circle-2",
          "title": "Pay only for what you like"
        }
      ]
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl sm:px-6 lg:px-8">
      <section class="overflow-hidden mb-2 sm:mb-2 rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          Amoda
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          {{ t('auth.title') }}
        </h1>

        <p class="mt-4 text-base leading-7 text-muted sm:text-lg">
          {{ t('auth.subtitle') }}
        </p>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-toned">
          <div
            v-for="item in benefits"
            :key="item.title"
            class="flex items-center gap-2"
          >
            <UIcon
              :name="item.icon"
              class="size-4 text-primary"
            />

            <span>{{ item.title }}</span>
          </div>
        </div>
      </section>

      <section class="mx-auto grid max-w-5xl mt-5 sm:mt-6">
        <UCard v-if="user">
          <div class="flex flex-col items-center py-8 text-center">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UIcon
                name="i-lucide-user-check"
                class="size-7"
              />
            </div>

            <h2 class="mt-4 text-xl font-black text-highlighted">
              {{ t('auth.accountTitle') }}
            </h2>

            <p class="mt-2 text-sm text-muted">
              {{ t('auth.accountDesc') }}
            </p>

            <p
              v-if="user.email"
              class="mt-3 break-all text-sm font-semibold text-toned"
            >
              {{ user.email }}
            </p>

            <UButton
              size="lg"
              color="primary"
              class="mt-6 w-full justify-center"
              :to="localeRoute({ name: 'index' })"
            >
              {{ t('auth.continue') }}
            </UButton>

            <UButton
              variant="ghost"
              color="neutral"
              class="mt-2 w-full justify-center"
              @click="signOut"
            >
              {{ t('auth.logout') }}
            </UButton>
          </div>
        </UCard>

        <template v-else>
          <UCard>
            <UTabs
              :items="[
                { label: t('auth.login'), slot: 'login' },
                { label: t('auth.register'), slot: 'register' }
              ]"
            >
              <template #login>
                <UForm
                  class="space-y-4 pt-4"
                  @submit.prevent="onLogin"
                >
                  <UFormField :label="t('auth.email')">
                    <UInput
                      v-model="login.email"
                      type="email"
                      autocomplete="email"
                      size="lg"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField :label="t('auth.password')">
                    <UInput
                      v-model="login.password"
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
                    size="xl"
                    class="w-full justify-center"
                  >
                    {{ t('auth.login') }}
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
              </template>

              <template #register>
                <UForm
                  class="space-y-4 pt-4"
                  @submit.prevent="onRegister"
                >
                  <UFormField :label="t('auth.email')">
                    <UInput
                      v-model="reg.email"
                      type="email"
                      autocomplete="email"
                      size="lg"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField :label="t('auth.password')">
                    <UInput
                      v-model="reg.password"
                      type="password"
                      autocomplete="new-password"
                      size="lg"
                      class="w-full"
                    />
                  </UFormField>

                  <UButton
                    :loading="isLoading"
                    type="submit"
                    color="primary"
                    size="xl"
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
                    class="text-sm"
                  />
                </UForm>
              </template>
            </UTabs>
          </UCard>

          <UCard class="mt-5 border-primary/20 bg-primary/5">
            <h2 class="text-lg font-black text-highlighted">
              {{ t('auth.magicTitle') }}
            </h2>

            <p class="mt-2 text-sm leading-6 text-muted">
              {{ t('auth.magicDesc') }}
            </p>

            <div class="mt-4 space-y-3">
              <UInput
                v-model="otp.email"
                type="email"
                autocomplete="email"
                placeholder="name@email.com"
                size="lg"
                class="w-full"
              />

              <UButton
                color="primary"
                variant="soft"
                size="lg"
                class="w-full justify-center"
                :loading="isLoading"
                @click="onMagic"
              >
                {{ t('auth.magic') }}
              </UButton>
            </div>
          </UCard>
        </template>
      </section>
    </UPageBody>
  </UPage>
</template>
