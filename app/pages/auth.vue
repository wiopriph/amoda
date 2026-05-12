<script setup lang="ts">
definePageMeta({ name: 'auth' });

const title = 'Entrar na Amoda | Conta para escolhas de moda feminina';
const description = 'Entre ou crie conta na Amoda para guardar a sua seleção, acompanhar escolhas e comprar moda feminina sem pagamento antecipado.';

useHead(() => ({
  title,
  meta: [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const login = reactive({ email: '', password: '' });
const reg = reactive({ email: '', password: '' });
const otp = reactive({ email: '' });


const { signIn, signUp, signInOtp, signOut, user, isLoading, error } = useAuth();
const toast = useToast();

const route = useRoute();

const onLogin = async () => {
  const ok = await signIn(login);

  if (ok) {
    toast.add({
      title: 'Bem-vindo de volta à Amoda!',
      color: 'primary',
    });

    navigateTo(route.query.redirected_from as string || { name: 'index' });
  }
};

const onRegister = async () => {
  const user = await signUp(reg);

  if (user) {
    toast.add({
      title: 'Confirme o seu e-mail para ativar a conta.',
      color: 'primary',
    });
  }
};

const onMagic = async () => {
  const ok = await signInOtp(otp.email);

  if (ok) {
    toast.add({
      title: 'Link mágico enviado',
      description: 'Verifique o seu e-mail - enviámos um link de acesso seguro.',
      color: 'primary',
    });

    otp.email = '';
  }
};

const authTabs = [
  { label: 'Entrar', slot: 'login' },
  { label: 'Criar conta', slot: 'register' },
];

const benefits = [
  {
    icon: 'i-lucide-wallet',
    title: 'Sem pagamento online',
  },
  {
    icon: 'i-lucide-shirt',
    title: 'Experimente antes',
  },
  {
    icon: 'i-lucide-check-circle-2',
    title: 'Pague só o que gostar',
  },
];
</script>

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
          Entre na Amoda
        </h1>

        <p class="mt-4 text-base leading-7 text-muted sm:text-lg">
          Guarde a sua seleção, acompanhe as suas escolhas e compre roupa sem pagamento antecipado.
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

            <span v-text="item.title" />
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
              A sua conta
            </h2>

            <p class="mt-2 text-sm text-muted">
              Você já está autenticado.
            </p>

            <p
              v-if="user.email"
              class="mt-3 break-all text-sm font-semibold text-toned"
              v-text="user.email"
            />

            <UButton
              :to="{ name: 'index' }"
              size="lg"
              color="primary"
              class="mt-6 w-full justify-center"
            >
              Continuar a comprar
            </UButton>

            <UButton
              variant="ghost"
              color="neutral"
              class="mt-2 w-full justify-center"
              @click="signOut"
            >
              Sair
            </UButton>
          </div>
        </UCard>

        <template v-else>
          <UCard>
            <UTabs :items="authTabs">
              <template #login>
                <UForm
                  class="space-y-4 pt-4"
                  @submit.prevent="onLogin"
                >
                  <UFormField label="E-mail">
                    <UInput
                      v-model="login.email"
                      type="email"
                      autocomplete="email"
                      size="lg"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField label="Palavra-passe">
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
                </UForm>
              </template>

              <template #register>
                <UForm
                  class="space-y-4 pt-4"
                  @submit.prevent="onRegister"
                >
                  <UFormField label="E-mail">
                    <UInput
                      v-model="reg.email"
                      type="email"
                      autocomplete="email"
                      size="lg"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField label="Palavra-passe">
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
                    Criar conta
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
              Entrada rápida
            </h2>

            <p class="mt-2 text-sm leading-6 text-muted">
              Receba um link seguro no e-mail.
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
                Enviar link
              </UButton>
            </div>
          </UCard>
        </template>
      </section>
    </UPageBody>
  </UPage>
</template>
