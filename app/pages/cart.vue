<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'cart' });

const { t } = useI18n();

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
      "title": "A sua seleção",
      "empty": "Ainda não escolheu nada. Adicione os itens e reserve para experimentar — sem pagamento.",
      "priceEach": "Preço por item",
      "remove": "Remover",
      "total": "Total",
      "checkout": "Reservar para experimentar",
      "delivery": "✅ Sem pagamento online. Reserve agora e venha experimentar no ponto de levantamento. Você decide na hora se vai levar.",
      "meta": {
        "title": "A sua seleção | Amoda Angola",
        "description": "Escolha os itens e faça uma reserva grátis para experimentar no ponto. Sem pagamento online."
      }
    }
  },
  "en": {
    "cart": {
      "title": "Your selection",
      "empty": "You haven’t picked anything yet. Add items and reserve to try on — no payment.",
      "priceEach": "Price per item",
      "remove": "Remove",
      "total": "Total",
      "checkout": "Reserve to try on",
      "delivery": "✅ No online payment. Reserve now and come try on at the pickup point. You decide on the spot if you want to take it.",
      "meta": {
        "title": "Your selection | Amoda Angola",
        "description": "Pick items and place a free reservation to try on at the pickup point. No online payment."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader :title="t('cart.title')" />

    <UPageBody class="max-w-3xl mx-auto">
      <div
        v-if="!items.length"
        class="text-center py-16 text-gray-600 space-y-4"
      >
        <p class="text-base">
          {{ t('cart.empty') }}
        </p>
      </div>

      <div
        v-else
        class="space-y-4"
      >
        <UCard
          v-for="cartItem in items"
          :key="cartItem.key"
          class="p-4"
        >
          <!-- TOP: image + title -->
          <div class="flex gap-4">
            <NuxtLink
              :to="localeRoute({ name: 'product-slug', params: { slug: cartItem.slug } })"
              class="shrink-0"
            >
              <NuxtImg
                :src="cartItem.image || '/placeholder.webp'"
                :alt="cartItem.productName"
                width="96"
                height="96"
                class="rounded-xl border object-cover w-24 h-24"
              />
            </NuxtLink>

            <div class="flex-1 min-w-0">
              <NuxtLink
                class="font-medium hover:underline"
                :to="localeRoute({ name: 'product-slug', params: { slug: cartItem.slug } })"
              >
                {{ cartItem.productName }}
              </NuxtLink>

              <div class="text-sm text-gray-500 mt-1">
                {{ cartItem.variantLabel || '—' }} • {{ cartItem.sizeLabel || '—' }}
              </div>

              <div class="text-sm text-gray-500 mt-1">
                {{ t('cart.priceEach') }}: {{ fmtAOA(cartItem.price) }}
              </div>

              <!-- DESKTOP -->
              <div class="hidden sm:flex items-center justify-between mt-3">
                <div class="flex items-center gap-2">
                  <UButton
                    size="sm"
                    variant="outline"
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

                <div class="text-right">
                  <div class="font-semibold">
                    {{ fmtAOA(cartItem.price * cartItem.qty) }}
                  </div>

                  <UButton
                    variant="ghost"
                    size="xs"
                    class="mt-1 text-gray-500 hover:text-red-600 px-0"
                    @click="remove(cartItem.key)"
                  >
                    {{ t('cart.remove') }}
                  </UButton>
                </div>
              </div>
            </div>
          </div>

          <!-- MOBILE -->
          <div class="sm:hidden mt-4 pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <UButton
                size="sm"
                variant="outline"
                @click="decrement(cartItem.key)"
              >
                −
              </UButton>

              <UInput
                type="number"
                inputmode="numeric"
                pattern="[0-9]*"
                size="sm"
                class="w-18"
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

            <div class="text-right shrink-0">
              <div class="text-base font-semibold leading-tight">
                {{ fmtAOA(cartItem.price * cartItem.qty) }}
              </div>

              <UButton
                variant="ghost"
                size="xs"
                class="mt-1 text-gray-500 hover:text-red-600 px-0"
                @click="remove(cartItem.key)"
              >
                {{ t('cart.remove') }}
              </UButton>
            </div>
          </div>
        </UCard>

        <div>
          <div class="flex items-center justify-between border-t pt-4 font-semibold text-lg">
            <span>{{ t('cart.total') }}</span>

            <span>{{ fmtAOA(totalAOA) }}</span>
          </div>

          <UAlert
            :description="t('cart.delivery')"
            icon="i-heroicons-information-circle"
            color="primary"
            variant="soft"
            class="text-sm mt-4"
          />

          <UButton
            size="xl"
            color="primary"
            class="w-full uppercase justify-center mt-4"
            :disabled="!items.length"
            @click="goCheckout"
          >
            {{ t('cart.checkout') }} ({{ totalCount }})
          </UButton>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
