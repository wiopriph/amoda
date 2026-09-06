<script setup lang="ts">
import { formatAoPhone } from '#shared/utils/phone';


definePageMeta({ name: 'conta-dados', layout: 'account', middleware: 'account' });

const title = 'Os meus dados | Amoda';

useHead({
  title,
  meta: [
    { name: 'description', content: 'Nome, telefone e e-mail da tua conta Amoda.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

const { signOut } = useAuth();
const { data: profile } = await useAccountProfile();
const toast = useToast();

const { makeWhatsappHref } = useWhatsappLink();
const changePhoneHref = makeWhatsappHref(() => 'Olá! Quero mudar o número de telefone da minha conta Amoda.');

const form = reactive({
  name: profile.value?.name || '',
});

const phoneLabel = computed(() => formatAoPhone(profile.value?.phone));

const isSaving = ref(false);
const isSigningOut = ref(false);

const save = async () => {
  isSaving.value = true;

  try {
    profile.value = await $fetch<typeof profile.value>('/api/account/profile', {
      method: 'PATCH',
      body: { name: form.name },
    });

    toast.add({ title: 'Dados guardados.', color: 'primary' });
  } catch (saveError: any) {
    toast.add({
      title: saveError?.data?.message || 'Não foi possível guardar. Tenta novamente.',
      color: 'error',
    });
  } finally {
    isSaving.value = false;
  }
};

const logout = async () => {
  isSigningOut.value = true;

  await signOut();
  await navigateTo({ name: 'index' });
};
</script>

<template>
  <div class="space-y-5">
    <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
      <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-4xl">
        Os meus dados
      </h1>

      <p class="mt-2 text-sm leading-6 text-muted sm:text-base">
        Usamos o teu nome e número só para confirmar os pedidos.
      </p>
    </section>

    <UForm
      class="grid gap-5"
      @submit.prevent="save"
    >
      <UCard>
        <div class="grid gap-4">
          <UFormField label="Nome">
            <UInput
              v-model="form.name"
              name="name"
              placeholder="Como te podemos chamar?"
              autocomplete="name"
              size="xl"
              class="w-full sm:max-w-sm"
            />
          </UFormField>

          <UFormField
            label="Número de telefone"
            help="Para mudar o número, fala connosco no WhatsApp."
          >
            <div class="flex flex-wrap items-center gap-3">
              <UInput
                :modelValue="phoneLabel || '—'"
                disabled
                size="xl"
                class="w-full sm:max-w-sm"
              />

              <UButton
                :to="changePhoneHref"
                target="_blank"
                variant="soft"
                color="neutral"
                size="sm"
                icon="i-simple-icons-whatsapp"
              >
                Mudar número
              </UButton>
            </div>
          </UFormField>

          <UFormField
            v-if="profile?.email"
            label="E-mail"
          >
            <UInput
              :modelValue="profile.email"
              disabled
              size="xl"
              class="w-full sm:max-w-sm"
            />
          </UFormField>

          <UButton
            :loading="isSaving"
            type="submit"
            color="primary"
            size="xl"
            class="w-full justify-center sm:w-fit"
          >
            Guardar
          </UButton>
        </div>
      </UCard>
    </UForm>

    <UButton
      :loading="isSigningOut"
      variant="ghost"
      color="neutral"
      icon="i-lucide-log-out"
      @click="logout"
    >
      Sair da conta
    </UButton>
  </div>
</template>
