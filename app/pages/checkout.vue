<script setup lang="ts">
/* eslint-disable camelcase */
import { vMaska } from 'maska/vue';
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'checkout' });

const { t, tm, rt } = useI18n();
const toast = useToast();

useHead(() => ({
  title: t('checkout.meta.title'),
  meta: [
    { name: 'description', content: t('checkout.meta.description') },
    { property: 'og:title', content: t('checkout.meta.title') },
    { property: 'og:description', content: t('checkout.meta.description') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const {
  isLoading,
  items,
  totalAOA,
  clear,
  startCheckout,
  contactSnapshot,
} = useCart();

const { trackPurchase } = useAnalyticsEvent();
const localeRoute = useLocaleRoute();
const CONTACT_SYNC_DEBOUNCE_MS = 900;
const DEFAULT_PICKUP_OFFICE_ID = 1;

let contactSyncTimer: ReturnType<typeof setTimeout> | null = null;
let applyingContactSnapshot = false;

const redirectIfEmpty = () => {
  if (isLoading.value) {
    return;
  }

  if (!items.value.length) {
    navigateTo(localeRoute({ name: 'cart' }));
  }
};

if (process.client) {
  onMounted(redirectIfEmpty);
  watch(isLoading, redirectIfEmpty);
}

const form = reactive({
  phone: '',
});

const getContactSnapshot = () => ({
  name: '',
  phone: form.phone.trim(),
  pickupOfficeId: DEFAULT_PICKUP_OFFICE_ID,
});

const hasContactData = () => Boolean(form.phone.trim());

const syncContactSnapshot = () => {
  if (!import.meta.client || applyingContactSnapshot || !hasContactData()) {
    return;
  }

  if (contactSyncTimer) {
    clearTimeout(contactSyncTimer);
  }

  contactSyncTimer = setTimeout(() => {
    contactSyncTimer = null;
    startCheckout(getContactSnapshot()).catch(() => {});
  }, CONTACT_SYNC_DEBOUNCE_MS);
};

if (import.meta.client) {
  watch(
    contactSnapshot,
    (snapshot) => {
      if (!snapshot || hasContactData()) {
        return;
      }

      applyingContactSnapshot = true;

      if (typeof snapshot.phone === 'string') {
        form.phone = snapshot.phone;
      }

      nextTick(() => {
        applyingContactSnapshot = false;
      });
    },
    { immediate: true },
  );

  watch(
    () => form.phone,
    () => {
      syncContactSnapshot();
    },
  );
}

const errors = reactive({
  phone: false,
});

const validateForm = () => {
  errors.phone = !form.phone.trim() || form.phone.replace(/\D/g, '').length < 12;

  return !errors.phone;
};

watch(() => form.phone, () => {
  if (errors.phone && form.phone.trim()) errors.phone = false;
});

const pending = ref(false);

const fmtAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val)} AOA`;

const totalCount = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0));

const steps = computed(() =>
  (tm('checkout.steps.items') as any[]).map((item) => ({
    title: rt(item.title),
    desc: rt(item.desc),
  })),
);

const trustItems = computed(() =>
  (tm('checkout.trust.items') as any[]).map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
  })),
);

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => t('checkout.whatsappMessage'));

const phoneInputRef = ref<any>(null);

const scrollToPhoneInput = async () => {
  await nextTick();

  const inputEl = phoneInputRef.value?.inputRef ||
    phoneInputRef.value?.$el?.querySelector?.('input') ||
    document.querySelector('input[name="phone"]');

  if (!inputEl) {
    return;
  }

  inputEl.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });

  setTimeout(() => {
    inputEl.focus();
  }, 300);
};

const submit = async () => {
  if (!validateForm()) {
    await scrollToPhoneInput();

    return;
  }

  if (!items.value.length) {
    toast.add({
      title: t('checkout.errors.empty'),
      color: 'error',
    });

    return;
  }

  pending.value = true;

  try {
    await startCheckout(getContactSnapshot());

    const dtoItems = items.value.map(i => ({
      productId: i.productId,
      variantId: i.variantId,
      sizeId: i.sizeId,
      title: i.productName,
      price: i.price,
      qty: i.qty,
      slug: i.slug,
      image: i.image ?? null,
    }));

    const { number } = await $fetch('/api/checkout/place-order', {
      method: 'POST',
      body: {
        items: dtoItems,
        totals: { total: unref(totalAOA), currency: 'AOA' },
        contact: {
          name: '',
          phone: form.phone,
        },
        pickupOfficeId: DEFAULT_PICKUP_OFFICE_ID,
      },
    });

    if (import.meta.client) {
      trackPurchase({
        transaction_id: String(number),
        value: totalAOA.value,
        items: items.value.map(i =>
          makeGa4Item({
            productId: i.productId,
            name: i.productName,
            brand: i.brand ?? undefined,
            price: i.price,
            quantity: i.qty,
            variantId: i.variantId,
            sizeId: i.sizeId,
            variantLabel: i.variantLabel ?? undefined,
            sizeLabel: i.sizeLabel ?? undefined,
            categoryName: i.categoryName ?? undefined,
          }),
        ),
        pickup_office_id: DEFAULT_PICKUP_OFFICE_ID,
      } as any);
    }

    await clear();
    await navigateTo(localeRoute({ name: 'order-number', params: { number } }));
  } catch (error: any) {
    toast.add({
      title: error?.data?.message || t('checkout.errors.common'),
      color: 'error',
    });
  } finally {
    pending.value = false;
  }
};
</script>

<i18n lang="json">
{
  "pt": {
    "checkout": {
      "title": "Finalizar escolha",
      "subtitle": "Não paga agora. Pode confirmar a escolha pelo WhatsApp ou deixar o seu número para a nossa equipa escrever ou ligar.",
      "badge": "Escolha grátis",
      "phone": "WhatsApp",
      "submit": "Enviar número",
      "or": "ou",
      "whatsapp": {
        "title": "Confirmar pelo WhatsApp",
        "desc": "Abra a conversa com a Amoda e confirme diretamente com a nossa equipa.",
        "cta": "Confirmar no WhatsApp"
      },
      "callback": {
        "title": "Deixar o meu número",
        "desc": "Digite o seu número e a nossa equipa vai escrever ou ligar para confirmar a sua escolha."
      },
      "whatsappMessage": "Olá! Quero confirmar a minha escolha na Amoda.",
      "summary": {
        "title": "Resumo",
        "items": "{count} item(ns)",
        "total": "Total se levar tudo",
        "note": "Este valor é apenas uma referência. Você só paga depois de experimentar e apenas pelo que decidir levar."
      },
      "trust": {
        "title": "Sem risco para você",
        "items": [
          {
            "icon": "i-lucide-wallet",
            "title": "Sem pagamento online"
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Experimente primeiro"
          },
          {
            "icon": "i-lucide-check-circle-2",
            "title": "Pague só o que gostar"
          }
        ]
      },
      "steps": {
        "title": "Depois de confirmar",
        "items": [
          {
            "title": "Recebemos a sua escolha",
            "desc": "A nossa equipa vê os itens escolhidos."
          },
          {
            "title": "Falamos no WhatsApp",
            "desc": "Confirmamos disponibilidade, ponto e horário."
          },
          {
            "title": "Você experimenta e decide",
            "desc": "Leva apenas o que gostar. Sem obrigação."
          }
        ]
      },
      "errors": {
        "phoneRequired": "Por favor, indique o seu número de WhatsApp.",
        "empty": "A sua seleção está vazia.",
        "common": "Não foi possível enviar a sua escolha. Tente novamente em alguns instantes."
      },
      "meta": {
        "title": "Confirmar escolha {'|'} Amoda",
        "description": "Confirme a sua escolha na Amoda pelo WhatsApp ou deixe o seu número para a nossa equipa entrar em contacto."
      }
    }
  },
  "en": {
    "checkout": {
      "title": "Finalize your selection",
      "subtitle": "You do not pay now. Confirm your selection on WhatsApp or leave your number so our team can message or call you.",
      "badge": "Free selection",
      "phone": "WhatsApp",
      "submit": "Send number",
      "or": "or",
      "whatsapp": {
        "title": "Confirm on WhatsApp",
        "desc": "Open a chat with Amoda and confirm directly with our team.",
        "cta": "Confirm on WhatsApp"
      },
      "callback": {
        "title": "Leave my number",
        "desc": "Enter your number and our team will message or call you to confirm your selection."
      },
      "whatsappMessage": "Hello! I want to confirm my Amoda selection.",
      "summary": {
        "title": "Summary",
        "items": "{count} item(s)",
        "total": "Total if you keep everything",
        "note": "This amount is only a reference. You pay only after trying and only for what you decide to keep."
      },
      "trust": {
        "title": "No risk for you",
        "items": [
          {
            "icon": "i-lucide-wallet",
            "title": "No online payment"
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Try first"
          },
          {
            "icon": "i-lucide-check-circle-2",
            "title": "Pay only for what you like"
          }
        ]
      },
      "steps": {
        "title": "After confirmation",
        "items": [
          {
            "title": "We receive your selection",
            "desc": "Our team sees your selected items."
          },
          {
            "title": "We message you on WhatsApp",
            "desc": "We confirm availability, point and time."
          },
          {
            "title": "You try and decide",
            "desc": "Keep only what you like. No obligation."
          }
        ]
      },
      "errors": {
        "phoneRequired": "Please enter your WhatsApp number.",
        "empty": "Your selection is empty.",
        "common": "We could not send your selection. Please try again shortly."
      },
      "meta": {
        "title": "Confirm selection {'|'} Amoda",
        "description": "Confirm your Amoda selection on WhatsApp or leave your number so our team can contact you."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-6xl sm:px-6 lg:px-8">
      <section class="overflow-hidden  mb-2 sm:mb-2 rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          {{ t('checkout.badge') }}
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          {{ t('checkout.title') }}
        </h1>

        <p class="mt-4 text-base leading-7 text-muted sm:text-lg">
          {{ t('checkout.subtitle') }}
        </p>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-toned">
          <div
            v-for="item in trustItems"
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

      <div class="mt-5 grid gap-5 sm:mt-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <section class="space-y-4">
          <UCard class="border-green-200 bg-green-50/70">
            <div class="flex flex-col gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-simple-icons-whatsapp"
                    class="size-5 text-green-600"
                  />

                  <h3 class="text-lg font-black text-highlighted">
                    {{ t('checkout.whatsapp.title') }}
                  </h3>
                </div>

                <p class="mt-2 text-sm leading-6 text-muted">
                  {{ t('checkout.whatsapp.desc') }}
                </p>
              </div>

              <UButton
                :to="whatsappHref"
                target="_blank"
                size="xl"
                color="success"
                icon="i-simple-icons-whatsapp"
                class="w-full justify-center sm:w-fit"
              >
                {{ t('checkout.whatsapp.cta') }}
              </UButton>
            </div>
          </UCard>

          <div class="flex items-center gap-3">
            <div class="h-px flex-1 bg-gray-200" />

            <span class="text-xs font-bold uppercase tracking-wide text-muted">
              {{ t('checkout.or') }}
            </span>

            <div class="h-px flex-1 bg-gray-200" />
          </div>

          <UForm @submit.prevent="submit">
            <UCard>
              <h3 class="text-lg font-black text-highlighted">
                {{ t('checkout.callback.title') }}
              </h3>

              <p class="mt-2 text-sm leading-6 text-muted">
                {{ t('checkout.callback.desc') }}
              </p>

              <div class="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                <UFormField
                  :label="t('checkout.phone')"
                  :error="errors.phone ? t('checkout.errors.phoneRequired') : undefined"
                  required
                >
                  <UInput
                    ref="phoneInputRef"
                    v-model="form.phone"
                    v-maska="'+244 ### ### ###'"
                    required
                    name="phone"
                    placeholder="+244 XXX XXX XXX"
                    type="tel"
                    size="xl"
                    class="w-full"
                  />
                </UFormField>

                <UButton
                  :loading="pending"
                  :disabled="!items.length || errors.phone"
                  size="lg"
                  color="primary"
                  type="submit"
                  class="mt-0 justify-center sm:mt-6"
                >
                  {{ t('checkout.submit') }}
                </UButton>
              </div>
            </UCard>
          </UForm>
        </section>

        <aside>
          <div class="sticky top-24 space-y-4">
            <UCard class="border-primary/20 bg-primary/5 hidden lg:block">
              <h2 class="text-lg font-black text-highlighted">
                {{ t('checkout.summary.title') }}
              </h2>

              <div class="mt-4 space-y-3">
                <div class="flex justify-between text-sm text-muted">
                  <span>{{ t('checkout.summary.items', { count: totalCount }) }}</span>

                  <span>{{ totalCount }}</span>
                </div>

                <div class="flex justify-between gap-4 border-t border-primary/10 pt-3">
                  <span class="text-sm font-semibold text-highlighted">
                    {{ t('checkout.summary.total') }}
                  </span>

                  <span class="text-lg font-black text-primary">
                    {{ fmtAOA(totalAOA) }}
                  </span>
                </div>

                <p class="text-xs leading-5 text-muted">
                  {{ t('checkout.summary.note') }}
                </p>
              </div>
            </UCard>

            <UCard>
              <h2 class="text-base font-bold text-highlighted">
                {{ t('checkout.steps.title') }}
              </h2>

              <div class="mt-4 space-y-3">
                <div
                  v-for="(step, index) in steps"
                  :key="step.title"
                  class="flex gap-3"
                >
                  <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {{ index + 1 }}
                  </div>

                  <div>
                    <div class="text-sm font-semibold text-highlighted">
                      {{ step.title }}
                    </div>

                    <div class="text-sm leading-6 text-muted">
                      {{ step.desc }}
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </aside>
      </div>
    </UPageBody>
  </UPage>
</template>
