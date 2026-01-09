<script setup lang="ts">
definePageMeta({ name: 'delivery' });

const { t, tm, rt } = useI18n();
const localeRoute = useLocaleRoute();

const seoTitle = computed(() => t('delivery.meta.title'));
const seoDescription = computed(() => t('delivery.meta.description'));

const steps = computed(() =>
  (tm('delivery.how.steps') as any[]).map((s) => ({
    icon: rt(s.icon),
    title: rt(s.title),
    desc: rt(s.desc),
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
      "title": "Como comprar na Amoda",
      "intro": "Compra online e levanta no ponto. Experimenta no local e decide na hora o que vais levar — simples e sem stress.",
      "meta": {
        "title": "Como comprar na Amoda | Pontos de levantamento em Luanda",
        "description": "Passo a passo: escolher online, levantar no ponto, experimentar e decidir. Endereços e horários dos pontos de levantamento em Luanda."
      },
      "badges": {
        "try": "Experimente primeiro",
        "pickup": "Pontos de levantamento",
        "fast": "Processo simples"
      },
      "value": {
        "title": "Por que isto funciona melhor",
        "subtitle": "A ideia é simples: você não precisa confiar em fotos. Você verifica no ponto e leva só o que faz sentido.",
        "items": [
          {
            "icon": "i-lucide-check-circle",
            "title": "Sem adivinhações",
            "desc": "Experimente o tamanho e veja o caimento ao vivo. Se não ficar bem, recuse na hora."
          },
          {
            "icon": "i-lucide-palette",
            "title": "Cor e material reais",
            "desc": "Veja a cor e o tecido na mão. O que você vê é o que você leva."
          },
          {
            "icon": "i-lucide-shield-check",
            "title": "Mais confiança",
            "desc": "Você decide no ponto. Menos risco, menos arrependimento."
          },
          {
            "icon": "i-lucide-clock",
            "title": "Rápido e prático",
            "desc": "Escolha online, confirme, levante. Sem conversas longas e sem complicação."
          }
        ]
      },
      "how": {
        "title": "Como funciona",
        "steps": [
          { "icon": "i-lucide-search", "title": "Escolha online", "desc": "Navegue pelas categorias e adicione os artigos ao carrinho." },
          { "icon": "i-lucide-clipboard-check", "title": "Finalize o pedido", "desc": "No checkout, preencha nome, telefone e email." },
          { "icon": "i-lucide-map-pin", "title": "Selecione o ponto", "desc": "Escolha um ponto de levantamento conveniente." },
          { "icon": "i-lucide-phone", "title": "Confirmação", "desc": "Entraremos em contacto quando o pedido estiver pronto." },
          { "icon": "i-lucide-shopping-bag", "title": "Experimente e decida", "desc": "Experimente no ponto e pague apenas o que levar." }
        ]
      },
      "pickup": {
        "title": "Pontos de levantamento",
        "desc": "Veja endereços, contactos e horários de funcionamento.",
        "button": "Ver pontos de levantamento"
      },
      "rules": {
        "title": "Regras e detalhes importantes",
        "items": [
          {
            "icon": "i-lucide-calendar-days",
            "title": "Prazo para levantar",
            "desc": "O pedido fica disponível por um período limitado. Avisaremos exatamente o prazo no contacto de confirmação."
          },
          {
            "icon": "i-lucide-phone-call",
            "title": "Confirmação por contacto",
            "desc": "Confirmamos quando o pedido estiver pronto e combinamos o melhor horário para você levantar."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Experimentação no ponto",
            "desc": "Você pode experimentar e recusar qualquer artigo que não sirva ou não agrade."
          },
          {
            "icon": "i-lucide-package-check",
            "title": "Condição do artigo",
            "desc": "Verifique o artigo no ponto antes de confirmar. Depois de levar, devoluções seguem a política."
          },
          {
            "icon": "i-lucide-rotate-ccw",
            "title": "Devoluções e reembolsos",
            "desc": "Se você levar e depois mudar de ideia, as regras dependem do tipo de artigo e do estado. Veja os detalhes na política."
          }
        ],
        "returnLinkText": "Política de Devoluções"
      },
      "faq": {
        "title": "Perguntas frequentes",
        "items": [
          { "q": "Posso experimentar várias peças?", "a": "Sim. Experimente e leve apenas o que quiser." },
          { "q": "E se nada servir?", "a": "Sem problema — pode recusar no local e não paga nada." },
          { "q": "Como sei quando posso levantar?", "a": "Entraremos em contacto quando o pedido estiver pronto." },
          { "q": "Quanto tempo o pedido fica no ponto?", "a": "Guardamos por um período limitado. Os detalhes são informados no contacto de confirmação." },
          { "q": "Onde vejo os pontos e horários?", "a": "Na página de pontos de levantamento (endereços, contactos e horários)." }
        ]
      }
    }
  },
  "en": {
    "delivery": {
      "title": "How to shop on Amoda",
      "intro": "Shop online and collect at a pickup point. Try on at the location and decide on the spot what you keep — simple and stress-free.",
      "meta": {
        "title": "How to shop on Amoda | Pickup points in Luanda",
        "description": "Step-by-step: choose online, collect at a pickup point, try on and decide. Addresses and opening hours for pickup points in Luanda."
      },
      "badges": {
        "try": "Try first",
        "pickup": "Pickup points",
        "fast": "Simple process"
      },
      "value": {
        "title": "Why this works better",
        "subtitle": "Simple idea: you don’t have to trust photos. You check at pickup and keep only what makes sense.",
        "items": [
          {
            "icon": "i-lucide-check-circle",
            "title": "No guessing",
            "desc": "Try the size and see the fit in real life. If it’s not right, decline on the spot."
          },
          {
            "icon": "i-lucide-palette",
            "title": "Real color & material",
            "desc": "See the color and feel the fabric. What you see is what you get."
          },
          {
            "icon": "i-lucide-shield-check",
            "title": "More confidence",
            "desc": "You decide at pickup. Less risk, less regret."
          },
          {
            "icon": "i-lucide-clock",
            "title": "Fast and practical",
            "desc": "Choose online, confirm, collect. No long back-and-forth, no hassle."
          }
        ]
      },
      "how": {
        "title": "How it works",
        "steps": [
          { "icon": "i-lucide-search", "title": "Choose online", "desc": "Browse categories and add items to your cart." },
          { "icon": "i-lucide-clipboard-check", "title": "Checkout", "desc": "At checkout, enter your name, phone number and email." },
          { "icon": "i-lucide-map-pin", "title": "Select pickup point", "desc": "Choose a convenient pickup point." },
          { "icon": "i-lucide-phone", "title": "Confirmation", "desc": "We’ll contact you when your order is ready." },
          { "icon": "i-lucide-shopping-bag", "title": "Try on & decide", "desc": "Try on at pickup and pay only for what you keep." }
        ]
      },
      "pickup": {
        "title": "Pickup points",
        "desc": "See addresses, contacts, and opening hours.",
        "button": "See pickup points"
      },
      "rules": {
        "title": "Important rules & details",
        "items": [
          {
            "icon": "i-lucide-calendar-days",
            "title": "Pickup window",
            "desc": "Orders are held for a limited time. We’ll tell you the exact window during confirmation."
          },
          {
            "icon": "i-lucide-phone-call",
            "title": "Confirmation contact",
            "desc": "We confirm when the order is ready and help coordinate the best pickup time."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Try-on at pickup",
            "desc": "You can try on and decline any item that doesn’t fit or you don’t like."
          },
          {
            "icon": "i-lucide-package-check",
            "title": "Check item condition",
            "desc": "Inspect items at pickup before confirming. After collection, returns follow the policy."
          },
          {
            "icon": "i-lucide-rotate-ccw",
            "title": "Returns & refunds",
            "desc": "If you collect and later change your mind, rules depend on item type and condition. See details in the policy."
          }
        ],
        "returnLinkText": "Return Policy"
      },
      "faq": {
        "title": "FAQ",
        "items": [
          { "q": "Can I try multiple items?", "a": "Yes. Try on and keep only what you want." },
          { "q": "What if nothing fits?", "a": "No problem — you can decline on-site and pay nothing." },
          { "q": "How do I know when I can pick up?", "a": "We’ll contact you when your order is ready." },
          { "q": "How long is my order held?", "a": "Orders are held for a limited time. Details are shared during confirmation." },
          { "q": "Where can I see locations and hours?", "a": "On the pickup points page (addresses, contacts, and opening hours)." }
        ]
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('delivery.title')"
      :description="t('delivery.intro')"
    />

    <UPageBody class="max-w-3xl mx-auto">
      <div class="space-y-10">
        <div class="flex flex-wrap gap-2">
          <UBadge>
            {{ t('delivery.badges.try') }}
          </UBadge>

          <UBadge>
            {{ t('delivery.badges.pickup') }}
          </UBadge>

          <UBadge>
            {{ t('delivery.badges.fast') }}
          </UBadge>
        </div>

        <UCard>
          <template #header>
            <div class="space-y-1">
              <h2 class="text-base font-semibold">
                {{ t('delivery.value.title') }}
              </h2>

              <p class="text-sm text-gray-600">
                {{ t('delivery.value.subtitle') }}
              </p>
            </div>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UCard
              v-for="item in tm('delivery.value.items')"
              :key="rt(item.title)"
            >
              <div class="flex items-start gap-3">
                <UIcon
                  :name="rt(item.icon)"
                  class="size-6"
                />

                <div>
                  <h3 class="font-medium">
                    {{ rt(item.title) }}
                  </h3>

                  <p class="text-sm text-gray-600">
                    {{ rt(item.desc) }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('delivery.how.title') }}
            </h2>
          </template>

          <div class="space-y-3">
            <UCard
              v-for="(s, idx) in steps"
              :key="`${idx}-${s.title}`"
            >
              <div class="flex items-start gap-3">
                <div class="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary text-sm font-semibold tabular-nums">
                  {{ idx + 1 }}
                </div>

                <UIcon
                  :name="s.icon"
                  class="size-6 mt-0.5"
                />

                <div class="min-w-0">
                  <div class="font-medium">
                    {{ s.title }}
                  </div>

                  <div class="text-sm text-gray-600">
                    {{ s.desc }}
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </UCard>

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
              :to="localeRoute({ name: 'pickup-points' })"
              color="primary"
              icon="i-lucide-map-pin"
            >
              {{ t('delivery.pickup.button') }}
            </UButton>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('delivery.rules.title') }}
            </h2>
          </template>

          <div class="space-y-4">
            <div
              v-for="r in tm('delivery.rules.items')"
              :key="rt(r.title)"
              class="flex items-start gap-3"
            >
              <UIcon
                :name="rt(r.icon)"
                class="size-6 mt-0.5"
              />

              <div>
                <div class="font-medium">
                  {{ rt(r.title) }}
                </div>

                <div class="text-sm text-gray-600">
                  {{ rt(r.desc) }}
                </div>
              </div>
            </div>

            <div class="pt-2">
              <NuxtLink
                class="text-primary underline underline-offset-4"
                :to="localeRoute({ name: 'return-policy' })"
              >
                {{ t('delivery.rules.returnLinkText') }}
              </NuxtLink>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('delivery.faq.title') }}
            </h2>
          </template>

          <UAccordion :items="faqs" />
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>
