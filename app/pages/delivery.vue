<script setup lang="ts">
definePageMeta({ name: 'delivery' });

const { t, tm, rt } = useI18n();
const localeRoute = useLocaleRoute();

const seoTitle = computed(() => t('delivery.meta.title'));
const seoDescription = computed(() => t('delivery.meta.description'));

const valueItems = computed(() =>
  (tm('delivery.value.items') as any[]).map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
    desc: rt(item.desc),
  })),
);

const steps = computed(() =>
  (tm('delivery.how.steps') as any[]).map((s) => ({
    title: rt(s.title),
    desc: rt(s.desc),
  })),
);

const ruleItems = computed(() =>
  (tm('delivery.rules.items') as any[]).map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
    desc: rt(item.desc),
  })),
);

const faqs = computed(() =>
  (tm('delivery.faq.items') as any[]).map((faq) => ({
    label: rt(faq.q),
    content: rt(faq.a),
  })),
);

useHead(() => {
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (tm('delivery.faq.items') as any[]).map((f) => ({
      '@type': 'Question',
      name: rt(f.q),
      acceptedAnswer: { '@type': 'Answer', text: rt(f.a) },
    })),
  };

  return {
    title: seoTitle.value,
    meta: [
      { name: 'description', content: seoDescription.value },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: seoTitle.value },
      { property: 'og:description', content: seoDescription.value },
      { property: 'twitter:title', content: seoTitle.value },
      { property: 'twitter:description', content: seoDescription.value },
    ],
    script: [{ type: 'application/ld+json', children: JSON.stringify(faqStructuredData) }],
  };
});
</script>

<i18n lang="json">
{
  "pt": {
    "delivery": {
      "title": "Escolha online. Experimente antes de pagar.",
      "intro": "Na Amoda você reserva as peças pelo site, recebe a confirmação no WhatsApp e experimenta antes de decidir. Pague apenas pelo que gostar.",
      "meta": {
        "title": "Como comprar na Amoda | Experimente antes de pagar em Luanda",
        "description": "Veja como funciona a Amoda: escolha roupa online, reserve sem pagar, confirme no WhatsApp, experimente e pague apenas pelo que gostar."
      },
      "badges": {
        "try": "Sem pagamento online",
        "pickup": "Experimente antes",
        "fast": "Fácil pelo WhatsApp"
      },
      "value": {
        "title": "Comprar roupa online sem medo",
        "subtitle": "Sabemos que roupa pode ficar diferente no corpo. Por isso você não precisa pagar antes de experimentar.",
        "items": [
          {
            "icon": "i-lucide-shirt",
            "title": "Você prova primeiro",
            "desc": "Veja o tamanho, o tecido e como a peça fica em você antes de decidir."
          },
          {
            "icon": "i-lucide-wallet",
            "title": "Paga só o que gostar",
            "desc": "Se uma peça não servir ou não agradar, você simplesmente não leva."
          },
          {
            "icon": "i-lucide-shield-check",
            "title": "Sem risco desnecessário",
            "desc": "Nada de pagar online por uma peça que você ainda não viu ao vivo."
          },
          {
            "icon": "i-simple-icons-whatsapp",
            "title": "Ajuda no WhatsApp",
            "desc": "Se tiver dúvidas sobre tamanho, ponto ou reserva, fale connosco pelo WhatsApp."
          }
        ]
      },
      "how": {
        "title": "Como funciona",
        "steps": [
          {
            "title": "Escolha as peças",
            "desc": "Veja os produtos no site e adicione ao pedido as peças que quer experimentar."
          },
          {
            "title": "Faça a reserva",
            "desc": "Envie o pedido com seu nome e WhatsApp. Não precisa pagar online."
          },
          {
            "title": "Nós confirmamos",
            "desc": "A nossa equipa fala consigo no WhatsApp para confirmar a reserva e orientar o próximo passo."
          },
          {
            "title": "Experimente",
            "desc": "Receba ou vá ao ponto combinado para ver as peças ao vivo e experimentar."
          },
          {
            "title": "Pague só o que levar",
            "desc": "Gostou? Leva e paga. Não gostou? Sem problema, não precisa levar."
          }
        ]
      },
      "pickup": {
        "title": "Quer ver onde experimentar?",
        "desc": "Veja os pontos disponíveis, endereço, horário e contactos.",
        "button": "Ver pontos de experimentação"
      },
      "rules": {
        "title": "Informações importantes",
        "items": [
          {
            "icon": "i-lucide-shopping-bag",
            "title": "A reserva não é compra obrigatória",
            "desc": "Reservar significa que você quer experimentar. Você só paga se decidir levar."
          },
          {
            "icon": "i-simple-icons-whatsapp",
            "title": "Confirmação pelo WhatsApp",
            "desc": "Depois do pedido, a nossa equipa entra em contacto para confirmar disponibilidade e detalhes."
          },
          {
            "icon": "i-lucide-clock",
            "title": "Produtos ficam reservados por tempo limitado",
            "desc": "Informamos no WhatsApp até quando a sua reserva estará disponível."
          },
          {
            "icon": "i-lucide-search-check",
            "title": "Confira tudo antes de pagar",
            "desc": "Veja tamanho, cor, tecido e estado da peça antes de finalizar a compra."
          },
          {
            "icon": "i-lucide-refresh-ccw",
            "title": "Trocas e devoluções",
            "desc": "Depois de comprar, trocas e devoluções seguem a nossa política oficial."
          }
        ],
        "returnLinkText": "Ver política de trocas"
      },
      "faq": {
        "title": "Dúvidas frequentes",
        "items": [
          {
            "q": "Preciso pagar antes?",
            "a": "Não. Você reserva online e paga apenas se gostar da peça depois de experimentar."
          },
          {
            "q": "Posso reservar várias peças?",
            "a": "Sim. Você pode escolher várias peças e levar apenas as que gostar."
          },
          {
            "q": "E se nada servir?",
            "a": "Tudo bem. Se nada servir ou agradar, você não precisa comprar."
          },
          {
            "q": "Como sei quando posso experimentar?",
            "a": "A nossa equipa entra em contacto pelo WhatsApp para confirmar os detalhes."
          },
          {
            "q": "Onde vejo os pontos?",
            "a": "Na página de pontos de experimentação, com endereço, horário e contactos."
          }
        ]
      }
    }
  },
  "en": {
    "delivery": {
      "title": "Choose online. Try before you pay.",
      "intro": "With Amoda, you reserve items on the website, get confirmation on WhatsApp, and try before deciding. Pay only for what you like.",
      "meta": {
        "title": "How to buy on Amoda | Try before you pay in Luanda",
        "description": "Learn how Amoda works: choose clothes online, reserve with no payment, confirm on WhatsApp, try on, and pay only for what you like."
      },
      "badges": {
        "try": "No online payment",
        "pickup": "Try before paying",
        "fast": "Easy via WhatsApp"
      },
      "value": {
        "title": "Buy clothes online with less risk",
        "subtitle": "Clothes can look different in real life. That is why you do not need to pay before trying.",
        "items": [
          {
            "icon": "i-lucide-shirt",
            "title": "Try first",
            "desc": "Check the size, fabric, and fit before deciding."
          },
          {
            "icon": "i-lucide-wallet",
            "title": "Pay only for what you like",
            "desc": "If an item does not fit or you do not like it, simply do not take it."
          },
          {
            "icon": "i-lucide-shield-check",
            "title": "Less risk",
            "desc": "No need to pay online for an item you have not seen in real life."
          },
          {
            "icon": "i-simple-icons-whatsapp",
            "title": "WhatsApp support",
            "desc": "Ask us about sizes, points, or your reservation on WhatsApp."
          }
        ]
      },
      "how": {
        "title": "How it works",
        "steps": [
          {
            "title": "Choose items",
            "desc": "Browse the website and add the items you want to try."
          },
          {
            "title": "Reserve",
            "desc": "Send your request with your name and WhatsApp. No online payment needed."
          },
          {
            "title": "We confirm",
            "desc": "Our team contacts you on WhatsApp to confirm availability and details."
          },
          {
            "title": "Try on",
            "desc": "Receive or visit the agreed point to see the items in real life and try them."
          },
          {
            "title": "Pay only if you keep it",
            "desc": "Like it? Take it and pay. Do not like it? No problem."
          }
        ]
      },
      "pickup": {
        "title": "Want to see where to try?",
        "desc": "See available points, address, opening hours, and contacts.",
        "button": "See try-on points"
      },
      "rules": {
        "title": "Important information",
        "items": [
          {
            "icon": "i-lucide-shopping-bag",
            "title": "A reservation is not an obligation to buy",
            "desc": "Reservation means you want to try. You only pay if you decide to keep the item."
          },
          {
            "icon": "i-simple-icons-whatsapp",
            "title": "WhatsApp confirmation",
            "desc": "After your request, our team contacts you to confirm availability and details."
          },
          {
            "icon": "i-lucide-clock",
            "title": "Items are reserved for a limited time",
            "desc": "We will tell you on WhatsApp how long your reservation is available."
          },
          {
            "icon": "i-lucide-search-check",
            "title": "Check everything before paying",
            "desc": "Check size, color, fabric, and condition before completing the purchase."
          },
          {
            "icon": "i-lucide-refresh-ccw",
            "title": "Exchanges and returns",
            "desc": "After purchase, exchanges and returns follow our official policy."
          }
        ],
        "returnLinkText": "See exchange policy"
      },
      "faq": {
        "title": "FAQ",
        "items": [
          {
            "q": "Do I need to pay first?",
            "a": "No. You reserve online and pay only if you like the item after trying it."
          },
          {
            "q": "Can I reserve several items?",
            "a": "Yes. You can choose several items and keep only the ones you like."
          },
          {
            "q": "What if nothing fits?",
            "a": "No problem. If nothing fits or you do not like it, you do not need to buy."
          },
          {
            "q": "How do I know when I can try?",
            "a": "Our team contacts you on WhatsApp to confirm the details."
          },
          {
            "q": "Where can I see the points?",
            "a": "On the try-on points page, with address, opening hours, and contacts."
          }
        ]
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <div class="flex flex-wrap gap-2">
          <UBadge
            color="primary"
            variant="soft"
          >
            {{ t('delivery.badges.try') }}
          </UBadge>

          <UBadge
            color="primary"
            variant="soft"
          >
            {{ t('delivery.badges.pickup') }}
          </UBadge>

          <UBadge
            color="primary"
            variant="soft"
          >
            {{ t('delivery.badges.fast') }}
          </UBadge>
        </div>

        <h1 class="mt-5 text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          {{ t('delivery.title') }}
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          {{ t('delivery.intro') }}
        </p>

        <div class="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <UButton
            :to="localeRoute({ name: 'pickup-points' })"
            size="xl"
            color="primary"
            icon="i-lucide-map-pin"
            class="justify-center"
          >
            {{ t('delivery.pickup.button') }}
          </UButton>

          <UButton
            :to="localeRoute({ name: 'return-policy' })"
            size="xl"
            color="primary"
            variant="soft"
            icon="i-lucide-refresh-ccw"
            class="justify-center"
          >
            {{ t('delivery.rules.returnLinkText') }}
          </UButton>
        </div>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <div>
            <h2 class="text-xl font-bold text-highlighted">
              {{ t('delivery.value.title') }}
            </h2>

            <p class="mt-2 text-sm leading-6 text-muted sm:text-base">
              {{ t('delivery.value.subtitle') }}
            </p>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div
              v-for="item in valueItems"
              :key="item.title"
              class="rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="item.icon"
                  class="size-5 text-primary"
                />

                <h3 class="font-semibold text-highlighted">
                  {{ item.title }}
                </h3>
              </div>

              <p class="mt-2 text-sm leading-6 text-muted">
                {{ item.desc }}
              </p>
            </div>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <h2 class="text-xl font-bold text-highlighted">
            {{ t('delivery.how.title') }}
          </h2>

          <div class="mt-5 space-y-3">
            <div
              v-for="(s, idx) in steps"
              :key="`${idx}-${s.title}`"
              class="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {{ idx + 1 }}
              </div>

              <div class="min-w-0">
                <h3 class="font-semibold text-highlighted">
                  {{ s.title }}
                </h3>

                <p class="mt-1 text-sm leading-6 text-muted">
                  {{ s.desc }}
                </p>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard class="border-primary/20 bg-primary/5">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-bold text-highlighted">
                {{ t('delivery.pickup.title') }}
              </h2>

              <p class="mt-1 text-sm leading-6 text-muted">
                {{ t('delivery.pickup.desc') }}
              </p>
            </div>

            <UButton
              :to="localeRoute({ name: 'pickup-points' })"
              color="primary"
              size="lg"
              class="w-full justify-center sm:w-auto"
            >
              {{ t('delivery.pickup.button') }}
            </UButton>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <h2 class="text-xl font-bold text-highlighted">
            {{ t('delivery.rules.title') }}
          </h2>

          <div class="mt-5 divide-y divide-gray-100">
            <div
              v-for="rule in ruleItems"
              :key="rule.title"
              class="py-4 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="rule.icon"
                  class="size-5 text-primary"
                />

                <h3 class="font-semibold text-highlighted">
                  {{ rule.title }}
                </h3>
              </div>

              <p class="mt-2 text-sm leading-6 text-muted">
                {{ rule.desc }}
              </p>
            </div>
          </div>

          <div class="mt-5">
            <UButton
              :to="localeRoute({ name: 'return-policy' })"
              color="neutral"
              variant="soft"
              class="w-full justify-center sm:w-auto"
            >
              {{ t('delivery.rules.returnLinkText') }}
            </UButton>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <template #header>
            <h2 class="text-xl font-bold text-highlighted">
              {{ t('delivery.faq.title') }}
            </h2>
          </template>

          <UAccordion :items="faqs" />
        </UCard>
      </section>
    </UPageBody>
  </UPage>
</template>
