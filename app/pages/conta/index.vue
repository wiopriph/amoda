<script setup lang="ts">
definePageMeta({ name: 'conta', layout: 'account', middleware: 'account' });

const title = 'Os meus pedidos | Amoda';

useHead({
  title,
  meta: [
    { name: 'description', content: 'Os pedidos feitos na Amoda e o estado de cada um.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

const { isAdmin } = useAuth();
const { data: profile } = await useAccountProfile();

const greeting = computed(() => (profile.value?.name ? `Olá, ${profile.value.name}!` : 'Olá!'));
</script>

<template>
  <div class="space-y-5">
    <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
      <p
        class="text-sm font-semibold text-primary"
        v-text="greeting"
      />

      <h1 class="mt-1 text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
        Os meus pedidos
      </h1>

      <p class="mt-2 text-sm leading-6 text-muted sm:text-base">
        Aqui acompanhas os pedidos feitos no site e o estado de cada um.
      </p>
    </section>

    <!-- Этап 2: здесь появится список педидов -->
    <UEmpty
      icon="i-lucide-list"
      title="Ainda não tens pedidos."
      description="Quando fizeres um pedido no site, ele aparece aqui."
    >
      <template #actions>
        <UButton
          :to="{ name: 'products' }"
          color="primary"
        >
          Ver novidades
        </UButton>
      </template>
    </UEmpty>

    <UButton
      v-if="isAdmin"
      :to="{ name: 'admin' }"
      variant="ghost"
      color="neutral"
      icon="i-lucide-shield-check"
    >
      Painel de administração
    </UButton>
  </div>
</template>
