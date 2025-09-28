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
    return navigateTo(localeRoute({ name: 'cart' }));
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
      }
    }
  }
}
</i18n>

<template>
  <section class="container mx-auto px-3 py-6 max-w-2xl">
    <h1 class="text-2xl font-semibold mb-2">
      {{ t('checkout.title') }}
    </h1>

    <p class="text-gray-600 mb-6">
      {{ t('checkout.subtitle') }}
    </p>

    <form
      class="space-y-5"
      @submit.prevent="submit"
    >
      <p class="text-sm text-gray-500">
        {{ t('checkout.hint') }}
      </p>

      <div>
        <label class="block mb-1 text-sm font-medium">{{ t('checkout.name') }}</label>

        <UInput
          v-model="form.name"
          class="w-full"
        />
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">{{ t('checkout.phone') }}</label>

        <UInput
          v-model="form.phone"
          class="w-full"
          placeholder="+244 ..."
        />
      </div>

      <div>
        <label class="block mb-1 text-sm font-medium">{{ t('checkout.email') }}</label>

        <UInput
          v-model="form.email"
          class="w-full"
        />
      </div>

      <UButton
        :loading="pending"
        :disabled="!items.length"
        type="submit"
        size="lg"
        class="w-full"
      >
        {{ t('checkout.submit') }}
      </UButton>

      <p
        v-if="message"
        class="text-red-600 text-sm"
      >
        {{ message }}
      </p>
    </form>
  </section>
</template>
