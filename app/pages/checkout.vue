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
  "pt": {
    "checkout": {
      "title": "Finalizar pedido",
      "subtitle": "Preencha os seus dados para concluir a encomenda",
      "hint": "Estas informações são necessárias para **entrega gratuita e recolha no ponto**. Indique o seu nome e contacto reais — enviaremos confirmação quando o pedido estiver pronto para recolha.",
      "name": "Nome completo",
      "phone": "Telefone (WhatsApp recomendado)",
      "email": "E-mail",
      "submit": "Confirmar pedido",
      "note": "📦 A entrega é gratuita. Entraremos em contacto assim que o seu pedido estiver pronto para recolha.",
      "errors": {
        "empty": "O carrinho está vazio.",
        "common": "Ocorreu um erro ao enviar o pedido. Tente novamente em alguns instantes."
      },
      "meta": {
        "title": "Finalizar pedido | Amoda Angola",
        "description": "Preencha os seus dados de contacto para concluir a compra online na Amoda e receber a entrega gratuita em Luanda."
      },
      "summary": {
        "title": "Resumo do pedido",
        "items": "Itens no carrinho",
        "total": "Valor total"
      }
    }
  },
  "en": {
    "checkout": {
      "title": "Complete your order",
      "subtitle": "Enter your contact details to finish checkout",
      "hint": "We need this information for **free delivery and pickup**. Please provide your real name and phone (WhatsApp preferred) — we’ll contact you when your order arrives at the pickup point.",
      "name": "Full Name",
      "phone": "Phone (WhatsApp preferred)",
      "email": "E-mail",
      "submit": "Confirm Order",
      "note": "📦 Delivery is free. We’ll contact you as soon as your order is ready for pickup.",
      "errors": {
        "empty": "Your cart is empty.",
        "common": "Something went wrong while placing the order. Please try again shortly."
      },
      "meta": {
        "title": "Checkout | Amoda Angola",
        "description": "Enter your contact details to finish your online order at Amoda and get free delivery in Luanda."
      },
      "summary": {
        "title": "Order summary",
        "items": "Cart items",
        "total": "Total amount"
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

        <UAlert
          color="success"
          variant="subtle"
          icon="i-heroicons-check-circle"
          class="mt-4 text-sm leading-relaxed"
        >
          {{ t('checkout.note') }}
        </UAlert>
      </UForm>
    </UPageBody>
  </UPage>
</template>
