<script setup lang="ts">
definePageMeta({ name: 'admin-login' });

useHead({
  title: 'Admin | Amoda',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

const { signIn, user, isAdmin, isLoading, error, signOut } = useAuth();
const route = useRoute();

const form = reactive({ email: '', password: '' });

const onLogin = async () => {
  const signedInUser = await signIn(form);

  if (signedInUser) {
    navigateTo((route.query.redirected_from as string) || { name: 'admin' });
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
            v-text="user.email"
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

        <UForm
          v-else
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

          <UAlert
            v-if="error"
            :description="error"
            color="error"
            variant="subtle"
            icon="i-heroicons-exclamation-triangle"
            class="text-sm"
          />
        </UForm>
      </UCard>
    </UPageBody>
  </UPage>
</template>
