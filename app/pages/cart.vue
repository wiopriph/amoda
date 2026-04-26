<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'cart' });

const { t, tm, rt } = useI18n();

useHead(() => ({
  title: t('cart.meta.title'),
  meta: [
    { name: 'description', content: t('cart.meta.description') },
    { property: 'og:title', content: t('cart.meta.title') },
    { property: 'og:description', content: t('cart.meta.description') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const { items, totalAOA, increment, decrement, setQty, remove } = useCart();

const fmtAOA = (val: number) => `${new Intl.NumberFormat('pt-AO').format(val)} AOA`;

const localeRoute = useLocaleRoute();
const { trackBeginCheckout } = useAnalyticsEvent();

const totalCount = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0));

const cartTrustItems = computed(() =>
  (tm('cart.trust.items') as any[]).map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
  })),
);

const steps = computed(() =>
  (tm('cart.steps.items') as any[]).map((item) => ({
    title: rt(item.title),
    desc: rt(item.desc),
  })),
);

const goCheckout = () => {
  if (!items.value.length) {
    return;
  }

  if (import.meta.client) {
    trackBeginCheckout({
      value: totalAOA.value,
      items: items.value.map((i) =>
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
        })),
    });
  }

  navigateTo(localeRoute({ name: 'checkout' }));
};
</script>

<i18n lang="json">
{
  "pt": {
    "cart": {
      "title": "A sua seleção para experimentar",
      "subtitle": "Estes itens ainda não estão comprados. Você só está a reservar para experimentar primeiro.",
      "empty": {
        "title": "A sua seleção está vazia",
        "desc": "Escolha algumas peças para experimentar. Não precisa pagar agora.",
        "cta": "Ver produtos"
      },
      "item": {
        "variant": "Cor",
        "size": "Tamanho",
        "qty": "Qtd.",
        "priceEach": "Preço por item",
        "remove": "Remover"
      },
      "summary": {
        "title": "Resumo da reserva",
        "items": "{count} item(ns)",
        "total": "Total se levar tudo",
        "note": "Você não paga agora. Este valor é apenas uma referência caso decida levar todos os itens depois de experimentar."
      },
      "checkout": "Confirmar reserva",
      "continue": "Continuar a escolher",
      "trust": {
        "title": "Sem risco para você",
        "items": [
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
      },
      "steps": {
        "title": "O que acontece depois?",
        "items": [
          {
            "title": "Confirme a reserva",
            "desc": "Enviaremos o pedido com os itens escolhidos."
          },
          {
            "title": "Falamos consigo no WhatsApp",
            "desc": "Confirmamos disponibilidade, ponto e horário."
          },
          {
            "title": "Experimente e decida",
            "desc": "Você leva apenas o que gostar. Sem obrigação."
          }
        ]
      },
      "meta": {
        "title": "A sua seleção | Amoda Angola",
        "description": "Reserve peças para experimentar na Amoda. Sem pagamento online: escolha, confirme e pague apenas pelo que gostar."
      }
    }
  },
  "en": {
    "cart": {
      "title": "Your try-on selection",
      "subtitle": "These items are not purchased yet. You are only reserving them to try first.",
      "empty": {
        "title": "Your selection is empty",
        "desc": "Choose a few items to try on. No need to pay now.",
        "cta": "View products"
      },
      "item": {
        "variant": "Color",
        "size": "Size",
        "qty": "Qty.",
        "priceEach": "Price per item",
        "remove": "Remove"
      },
      "summary": {
        "title": "Reservation summary",
        "items": "{count} item(s)",
        "total": "Total if you keep everything",
        "note": "You do not pay now. This amount is only a reference if you decide to keep all items after trying them."
      },
      "checkout": "Confirm reservation",
      "continue": "Continue choosing",
      "trust": {
        "title": "No risk for you",
        "items": [
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
      },
      "steps": {
        "title": "What happens next?",
        "items": [
          {
            "title": "Confirm reservation",
            "desc": "We receive your selected items."
          },
          {
            "title": "We contact you on WhatsApp",
            "desc": "We confirm availability, point and time."
          },
          {
            "title": "Try and decide",
            "desc": "Keep only what you like. No obligation."
          }
        ]
      },
      "meta": {
        "title": "Your selection | Amoda Angola",
        "description": "Reserve items to try on at Amoda. No online payment: choose, confirm and pay only for what you like."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-5xl px-4 py-5 pb-28 sm:px-6 sm:py-8 sm:pb-8 lg:px-8">
      <!-- HERO -->
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          {{ t('cart.trust.title') }}
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          {{ t('cart.title') }}
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          {{ t('cart.subtitle') }}
        </p>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-toned">
          <div
            v-for="item in cartTrustItems"
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

      <!-- EMPTY -->
      <section
        v-if="!items.length"
        class="mt-5 sm:mt-6"
      >
        <UCard>
          <div class="flex flex-col items-center py-10 text-center">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UIcon
                name="i-lucide-shopping-bag"
                class="size-7"
              />
            </div>

            <h2 class="mt-4 text-xl font-bold text-highlighted">
              {{ t('cart.empty.title') }}
            </h2>

            <p class="mt-2 max-w-sm text-sm leading-6 text-muted">
              {{ t('cart.empty.desc') }}
            </p>

            <UButton
              color="primary"
              size="lg"
              :to="localeRoute({ name: 'index' })"
              class="mt-5 justify-center"
            >
              {{ t('cart.empty.cta') }}
            </UButton>
          </div>
        </UCard>
      </section>

      <template v-else>
        <div class="mt-5 grid gap-5 sm:mt-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <!-- ITEMS -->
          <section class="space-y-3">
            <UCard
              v-for="cartItem in items"
              :key="cartItem.key"
            >
              <div class="flex gap-3 sm:gap-4">
                <NuxtLink
                  :to="localeRoute({ name: 'product-slug', params: { slug: cartItem.slug } })"
                  class="shrink-0"
                >
                  <NuxtImg
                    :src="cartItem.image || '/placeholder.webp'"
                    :alt="cartItem.productName"
                    width="96"
                    height="120"
                    class="h-24 w-20 rounded-2xl object-cover sm:h-28 sm:w-24"
                  />
                </NuxtLink>

                <div class="min-w-0 flex-1">
                  <NuxtLink
                    class="line-clamp-2 text-sm font-bold text-highlighted hover:text-primary sm:text-base"
                    :to="localeRoute({ name: 'product-slug', params: { slug: cartItem.slug } })"
                  >
                    {{ cartItem.productName }}
                  </NuxtLink>

                  <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted sm:text-sm">
                    <span>{{ t('cart.item.variant') }}: {{ cartItem.variantLabel || '—' }}</span>

                    <span>{{ t('cart.item.size') }}: {{ cartItem.sizeLabel || '—' }}</span>
                  </div>

                  <div class="mt-2 text-xs text-muted sm:text-sm">
                    {{ t('cart.item.priceEach') }}:
                    <span class="font-semibold text-toned">{{ fmtAOA(cartItem.price) }}</span>
                  </div>

                  <div class="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <div class="mb-1 text-xs font-medium text-muted">
                        {{ t('cart.item.qty') }}
                      </div>

                      <div class="flex items-center gap-2">
                        <UButton
                          size="sm"
                          variant="outline"
                          :disabled="cartItem.qty <= 1"
                          @click="decrement(cartItem.key)"
                        >
                          −
                        </UButton>

                        <UInput
                          type="number"
                          inputmode="numeric"
                          pattern="[0-9]*"
                          size="sm"
                          class="w-16"
                          :modelValue="cartItem.qty"
                          @update:model-value="val => setQty(cartItem.key, Math.max(1, Number(val) || 1))"
                        />

                        <UButton
                          size="sm"
                          variant="outline"
                          @click="increment(cartItem.key)"
                        >
                          +
                        </UButton>
                      </div>
                    </div>

                    <div class="text-right">
                      <div class="text-base font-black text-primary sm:text-lg">
                        {{ fmtAOA(cartItem.price * cartItem.qty) }}
                      </div>

                      <UButton
                        variant="ghost"
                        size="xs"
                        color="neutral"
                        class="mt-1 px-0 text-muted hover:text-red-600"
                        @click="remove(cartItem.key)"
                      >
                        {{ t('cart.item.remove') }}
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </section>

          <!-- SUMMARY DESKTOP -->
          <aside class="hidden lg:block">
            <div class="sticky top-24 space-y-4">
              <UCard class="border-primary/20 bg-primary/5">
                <h2 class="text-lg font-black text-highlighted">
                  {{ t('cart.summary.title') }}
                </h2>

                <div class="mt-4 space-y-3">
                  <div class="flex justify-between text-sm text-muted">
                    <span>{{ t('cart.summary.items', { count: totalCount }) }}</span>

                    <span>{{ totalCount }}</span>
                  </div>

                  <div class="flex justify-between gap-4 border-t border-primary/10 pt-3">
                    <span class="text-sm font-semibold text-highlighted">
                      {{ t('cart.summary.total') }}
                    </span>

                    <span class="text-lg font-black text-primary">
                      {{ fmtAOA(totalAOA) }}
                    </span>
                  </div>

                  <p class="text-xs leading-5 text-muted">
                    {{ t('cart.summary.note') }}
                  </p>
                </div>

                <UButton
                  size="xl"
                  color="primary"
                  class="mt-5 w-full justify-center"
                  :disabled="!items.length"
                  @click="goCheckout"
                >
                  {{ t('cart.checkout') }}
                </UButton>

                <UButton
                  size="lg"
                  color="neutral"
                  variant="ghost"
                  class="mt-2 w-full justify-center"
                  :to="localeRoute({ name: 'index' })"
                >
                  {{ t('cart.continue') }}
                </UButton>
              </UCard>

              <UCard>
                <h2 class="text-base font-bold text-highlighted">
                  {{ t('cart.steps.title') }}
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

        <!-- STEPS MOBILE/TABLET -->
        <section class="mt-5 lg:hidden">
          <UCard>
            <h2 class="text-base font-bold text-highlighted">
              {{ t('cart.steps.title') }}
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
        </section>

        <!-- MOBILE STICKY SUMMARY -->
        <div class="fixed bottom-0 left-0 right-0 z-60 border-t border-gray-200 bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] lg:hidden">
          <div class="mx-auto max-w-5xl">
            <div class="mb-2 flex items-center justify-between gap-3">
              <div>
                <div class="text-xs text-muted">
                  {{ t('cart.summary.total') }}
                </div>

                <div class="text-lg font-black text-primary">
                  {{ fmtAOA(totalAOA) }}
                </div>
              </div>

              <div class="text-right text-xs leading-5 text-muted">
                {{ t('cart.summary.items', { count: totalCount }) }}
              </div>
            </div>

            <UButton
              size="xl"
              color="primary"
              class="w-full justify-center"
              :disabled="!items.length"
              @click="goCheckout"
            >
              {{ t('cart.checkout') }}
            </UButton>
          </div>
        </div>
      </template>
    </UPageBody>
  </UPage>
</template>
