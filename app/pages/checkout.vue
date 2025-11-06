<script setup lang="ts">
definePageMeta({ name: 'checkout' });

const { t } = useI18n();

useHead(() => ({
  title: t('checkout.meta.title'),
  meta: [
    { name: 'description', content: t('checkout.meta.description') },
    { property: 'og:title', content: t('checkout.meta.title') },
    { property: 'og:description', content: t('checkout.meta.description') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const { items, totalAOA, clear } = useCart();


const localeRoute = useLocaleRoute();

const redirectIfEmpty = () => {
  if (!items.value.length) {
    navigateTo(localeRoute({ name: 'cart' }));
  }
};

if (process.client) {
  onMounted(redirectIfEmpty);
  watch(items, redirectIfEmpty, { deep: true });
}

const form = reactive({ name: '', phone: '', email: '' });
const pending = ref(false);
const message = ref<string | null>(null);

const submit = async () => {
  if (!items.value.length) {
    message.value = t('checkout.errors.empty');

    return;
  }

  pending.value = true;

  try {
    const { number } = await $fetch('/api/checkout/place-order', {
      method: 'POST',
      body: {
        items: unref(items),
        totals: { total: unref(totalAOA), currency: 'AOA' },
        contact: toRaw(form),
      },
    });

    clear();

    await navigateTo(localeRoute({ name: 'order-number', params: { number } }));
  } catch (error: any) {
    message.value = error?.data?.message || t('checkout.errors.common');
  } finally {
    pending.value = false;
  }
};

const fmtAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val)} AOA`;
</script>

<i18n lang="json">
{
  "pt-AO": {
    "checkout": {
      "title": "Finalização",
      "subtitle": "Preencha os dados para receber o seu pedido",
      "hint": "Estas informações são necessárias para levantar o pedido no ponto de entrega. Indique contactos reais para que possamos comunicar consigo.",
      "name": "Nome completo",
      "phone": "Telefone",
      "email": "E-mail",
      "submit": "Confirmar pedido",
      "errors": {
        "empty": "O carrinho está vazio.",
        "common": "Ocorreu um erro. Tente novamente."
      },
      "meta": {
        "title": "Finalização | Amoda",
        "description": "Preencha os seus dados de contacto para concluir a compra."
      },
      "summary": {
        "title": "Resumo do pedido",
        "items": "Itens",
        "total": "Total"
      }
    }
  },
  "en": {
    "checkout": {
      "title": "Checkout",
      "subtitle": "Fill in your details to receive your order",
      "hint": "This information is required to pick up your order at a collection point. Please provide real contact details so we can reach you.",
      "name": "Full Name",
      "phone": "Phone",
      "email": "E-mail",
      "submit": "Confirm Order",
      "errors": {
        "empty": "Your cart is empty.",
        "common": "Something went wrong. Please try again."
      },
      "meta": {
        "title": "Checkout | Amoda",
        "description": "Enter your contact details to complete your purchase."
      },
      "summary": {
        "title": "Order summary",
        "items": "Items",
        "total": "Total"
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('checkout.title')"
      :description="t('checkout.subtitle')"
    />

    <UPageBody class="max-w-3xl mx-auto">
      <UAlert
        :description="t('checkout.hint')"
        icon="i-heroicons-information-circle"
        color="primary"
        variant="soft"
        class="mb-4 text-sm"
      />

      <UForm
        class="space-y-5"
        @submit.prevent="submit"
      >
        <UFormField :label="t('checkout.name')">
          <UInput
            v-model="form.name"
            required
            name="name"
            class="block w-full"
          />
        </UFormField>

        <UFormField :label="t('checkout.phone')">
          <UInput
            v-model="form.phone"
            required
            name="phone"
            placeholder="+244 ..."
            type="tel"
            class="block w-full"
          />
        </UFormField>

        <UFormField :label="t('checkout.email')">
          <UInput
            v-model="form.email"
            required
            name="email"
            type="email"
            class="block w-full"
          />
        </UFormField>

        <div class="flex items-center justify-between border-t pt-4 text-sm">
          <span class="text-gray-500">
            {{ t('checkout.summary.items') }}:
            {{ items.length }}
          </span>

          <span class="font-semibold">
            {{ t('checkout.summary.total') }}:
            {{ fmtAOA(totalAOA) }}
          </span>
        </div>

        <UButton
          :loading="pending"
          :disabled="!items.length"
          size="xl"
          color="primary"
          type="submit"
          class="w-full py-4 text-lg font-semibold tracking-wide uppercase justify-center"
        >
          {{ t('checkout.submit') }}
        </UButton>

        <UAlert
          v-if="message"
          color="error"
          variant="subtle"
          class="text-sm"
          icon="i-heroicons-exclamation-triangle"
        >
          {{ message }}
        </UAlert>
      </UForm>
    </UPageBody>
  </UPage>
</template>
