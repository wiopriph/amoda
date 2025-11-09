<script setup lang="ts">
definePageMeta({ name: 'delivery' });

const { t, tm, rt } = useI18n();
const localeRoute = useLocaleRoute();

useHead(() => {
  const faqsItems = tm('delivery.faq.items');

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqsItems.map((f) => ({
      '@type': 'Question',
      name: rt(f.q),
      acceptedAnswer: {
        '@type': 'Answer',
        text: rt(f.a),
      },
    })),
  };

  return {
    title: t('delivery.meta.title'),
    meta: [
      { name: 'description', content: t('delivery.meta.description') },
      { property: 'og:title', content: t('delivery.meta.title') },
      { property: 'og:description', content: t('delivery.meta.description') },
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(faqStructuredData),
      },
    ],
  };
});

const steps = computed(() => tm('delivery.how.steps').map((s: any) => ({
  icon: rt(s.icon),
  title: rt(s.title),
  desc: rt(s.desc),
})));
const faqs = computed(() => tm('delivery.faq.items').map((faq: any) => ({
  label: rt(faq.q),
  content: rt(faq.a),
})));
</script>

<i18n lang="json">
{
  "pt": {
    "delivery": {
      "title": "Entrega gratuita e pontos de recolha",
      "intro": "Na Amoda a entrega é 100% gratuita para pontos de recolha. Encomende roupas online em Angola, escolha o ponto em Luanda, experimente no local e pague apenas se gostar.",
      "meta": {
        "title": "Entrega gratuita e pontos de recolha | Amoda Angola",
        "description": "Entrega gratuita em Luanda, pontos de recolha, comprar roupas online Angola sem pagamento antecipado. Experimente no local e pague apenas se gostar."
      },
      "badges": {
        "free": "Entrega gratuita",
        "noprepay": "Sem pagamento antecipado",
        "safe": "Compra segura — experimente primeiro"
      },
      "how": {
        "title": "Como funciona",
        "steps": [
          {
            "icon": "i-lucide-search",
            "title": "Escolha online",
            "desc": "Adicione roupas, sapatos e acessórios ao carrinho."
          },
          {
            "icon": "i-lucide-map-pin",
            "title": "Selecione o ponto",
            "desc": "Escolha o ponto de recolha mais perto de si em Luanda."
          },
          {
            "icon": "i-lucide-phone",
            "title": "Confirmação",
            "desc": "Quando a encomenda chegar, entraremos em contacto por telefone."
          },
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Experimente no local",
            "desc": "Veja e experimente. Pague apenas o que decidir levar."
          }
        ]
      },
      "pickup": {
        "title": "Pontos de recolha",
        "desc": "Estamos a expandir a rede de pontos. No início — Luanda, depois outras cidades. Verifique o mapa e horários.",
        "button": "Ver pontos de recolha"
      },
      "pay": {
        "title": "Pagamento",
        "methods": [
          {
            "icon": "i-lucide-banknote",
            "title": "Dinheiro",
            "desc": "Pague em dinheiro no ponto de recolha."
          },
          {
            "icon": "i-lucide-credit-card",
            "title": "Cartão",
            "desc": "Pagamento por cartão disponível em pontos selecionados."
          },
          {
            "icon": "i-lucide-smartphone",
            "title": "Transferência / App",
            "desc": "Métodos digitais populares — quando disponíveis no ponto."
          }
        ],
        "note": "Sem pré-pagamento. Só paga após verificar o produto."
      },
      "faq": {
        "title": "Perguntas frequentes",
        "items": [
          {
            "q": "Quanto custa a entrega?",
            "a": "Grátis para pontos de recolha em Luanda."
          },
          {
            "q": "Preciso pagar online?",
            "a": "Não. Sem pagamento antecipado — paga apenas no ponto de recolha."
          },
          {
            "q": "Quanto tempo a encomenda fica no ponto?",
            "a": "Normalmente guardamos por um período limitado. Receberá informação no contacto de confirmação."
          },
          {
            "q": "Posso experimentar várias peças?",
            "a": "Sim, pode experimentar e escolher apenas o que quiser levar."
          },
          {
            "q": "O que acontece se nada servir?",
            "a": "Sem problema — pode recusar no local e não paga nada."
          }
        ]
      },
      "cta": {
        "title": "Pronto para comprar online?",
        "desc": "Escolha as suas peças favoritas — entrega gratuita e compra segura nos nossos pontos.",
        "button": "Começar a comprar"
      }
    }
  },
  "en": {
    "delivery": {
      "title": "Free delivery & pickup points",
      "intro": "With Amoda, delivery is 100% free to pickup points. Order clothes online in Angola, choose a point in Luanda, try on at the location, and pay only if you like it.",
      "meta": {
        "title": "Free delivery and pickup points | Amoda Angola",
        "description": "Free delivery in Luanda, pickup points, buy clothes online in Angola with no prepayment. Try first at pickup and pay only for what you keep."
      },
      "badges": {
        "free": "Free delivery",
        "noprepay": "No prepayment",
        "safe": "Safe shopping — try first"
      },
      "how": {
        "title": "How it works",
        "steps": [
          {
            "icon": "i-lucide-search",
            "title": "Choose online",
            "desc": "Add clothes, shoes and accessories to your cart."
          },
          {
            "icon": "i-lucide-map-pin",
            "title": "Select pickup point",
            "desc": "Pick the nearest location in Luanda."
          },
          {
            "icon": "i-lucide-phone",
            "title": "Get notified",
            "desc": "We’ll call you when your order arrives."
          },
          {
            "icon": "i-lucide-shopping-bag",
            "title": "Try on & decide",
            "desc": "Try your items on-site. Pay only for what you keep."
          }
        ]
      },
      "pickup": {
        "title": "Pickup points",
        "desc": "We’re expanding our network. Starting with Luanda, more cities next. Check the map and opening hours.",
        "button": "See pickup locations"
      },
      "pay": {
        "title": "Payment",
        "methods": [
          {
            "icon": "i-lucide-banknote",
            "title": "Cash",
            "desc": "Pay with cash at the pickup point."
          },
          {
            "icon": "i-lucide-credit-card",
            "title": "Card",
            "desc": "Card payments available at selected points."
          },
          {
            "icon": "i-lucide-smartphone",
            "title": "Transfer / App",
            "desc": "Popular digital methods — where available."
          }
        ],
        "note": "No upfront payment. You pay only after checking your items."
      },
      "faq": {
        "title": "FAQ",
        "items": [
          {
            "q": "How much is delivery?",
            "a": "Free to pickup points in Luanda."
          },
          {
            "q": "Do I need to pay online?",
            "a": "No. No prepayment — you pay at the pickup point."
          },
          {
            "q": "How long is my order held?",
            "a": "We hold orders for a limited time. Details are shared in the confirmation call."
          },
          {
            "q": "Can I try multiple items?",
            "a": "Yes, try on and choose only what you want."
          },
          {
            "q": "What if nothing fits?",
            "a": "No problem — you can decline on-site and pay nothing."
          }
        ]
      },
      "cta": {
        "title": "Ready to shop online?",
        "desc": "Pick your favorite styles — free delivery and safe shopping at our pickup points.",
        "button": "Start shopping"
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader :title="t('delivery.title')" />

    <UPageBody>
      <UPageSection
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <p v-text="t('delivery.intro')" />

        <div class="mt-4 flex flex-wrap gap-2">
          <UBadge>
            {{ t('delivery.badges.free') }}
          </UBadge>

          <UBadge>
            {{ t('delivery.badges.noprepay') }}
          </UBadge>

          <UBadge>
            {{ t('delivery.badges.safe') }}
          </UBadge>
        </div>
      </UPageSection>

      <UPageSection
        :title="t('delivery.how.title')"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <UStepper
          :items="steps"
          color="primary"
        />
      </UPageSection>

      <UPageSection
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <UCard>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-base sm:text-lg font-semibold">
                {{ t('delivery.pickup.title') }}
              </h3>

              <p class="text-sm text-gray-600 mt-1">
                {{ t('delivery.pickup.desc') }}
              </p>
            </div>

            <UButton
              :to="localeRoute({ name: 'contacts' })"
              color="primary"
              icon="i-lucide-map"
            >
              {{ t('delivery.pickup.button') }}
            </UButton>
          </div>
        </UCard>
      </UPageSection>

      <UPageSection
        :title="t('delivery.pay.title')"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <UCard
            v-for="m in tm('delivery.pay.methods')"
            :key="m.title"
          >
            <div class="flex items-start gap-3">
              <UIcon
                :name="rt(m.icon)"
                class="size-6"
              />

              <div>
                <h4 class="font-medium">
                  {{ rt(m.title) }}
                </h4>

                <p class="text-sm text-gray-600">
                  {{ rt(m.desc) }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <p class="text-xs text-gray-500 mt-3">
          {{ t('delivery.pay.note') }}
        </p>
      </UPageSection>

      <UPageSection
        :title="t('delivery.faq.title')"
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <UAccordion
          :items="faqs"
        />
      </UPageSection>

      <UPageSection
        :ui="{
          container: 'w-full max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid py-8 sm:py-10 lg:py-12 gap-6 sm:gap-8'
        }"
      >
        <UPageCTA
          :title="t('delivery.cta.title')"
          :description="t('delivery.cta.desc')"
          :links="[
            {
              label: t('delivery.cta.button'),
              color: 'primary',
              to: localeRoute({ name: 'gender', params: { gender: 'women' } })
            }
          ]"
          orientation="horizontal"
        />
      </UPageSection>
    </UPageBody>
  </UPage>
</template>
