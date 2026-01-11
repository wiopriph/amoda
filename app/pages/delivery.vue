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
      "title": "Como funciona a reserva na Amoda",
      "intro": "Reserve online e venha experimentar no ponto. Sem pagamento online — você decide na hora o que levar.",
      "meta": {
        "title": "Como funciona a Amoda | Reservar e experimentar em Luanda",
        "description": "Passo a passo: escolher, reservar, selecionar o ponto, confirmar no WhatsApp e experimentar. Pontos e horários em Luanda."
      },
      "badges": {
        "try": "Reserva grátis",
        "pickup": "Pontos para experimentar",
        "fast": "Rápido e simples"
      },
      "value": {
        "title": "Por que isto funciona melhor",
        "subtitle": "Ideia simples: você não depende de fotos. Você vê ao vivo no ponto e leva só o que gostar.",
        "items": [
          {
            "icon": "i-lucide-check-circle",
            "title": "Sem adivinhações",
            "desc": "Experimente o tamanho e veja o caimento ao vivo. Se não ficar bem, não leva."
          },
          {
            "icon": "i-lucide-palette",
            "title": "Cor e material reais",
            "desc": "Veja a cor e o tecido na mão. Sem surpresas."
          },
          {
            "icon": "i-lucide-shield-check",
            "title": "Mais confiança",
            "desc": "Você decide no ponto. Menos risco e menos arrependimento."
          },
          {
            "icon": "i-lucide-clock",
            "title": "Rápido e prático",
            "desc": "Escolha, reserve e venha experimentar. Sem complicação."
          }
        ]
      },
      "how": {
        "title": "Como funciona",
        "steps": [
          { "icon": "i-lucide-search", "title": "Escolha os itens", "desc": "Navegue pelas categorias e adicione os itens que quer experimentar." },
          { "icon": "i-lucide-clipboard-check", "title": "Faça a reserva", "desc": "Preencha nome e WhatsApp — sem pagamento online." },
          { "icon": "i-lucide-map-pin", "title": "Selecione o ponto", "desc": "Escolha um ponto de levantamento conveniente para experimentar." },
          { "icon": "i-lucide-phone", "title": "Confirmação no WhatsApp", "desc": "Entraremos em contacto quando estiver pronto para experimentar." },
          { "icon": "i-lucide-shirt", "title": "Experimente e decida", "desc": "Experimente no ponto e leve só o que gostar. Sem compromisso." }
        ]
      },
      "pickup": {
        "title": "Pontos para experimentar",
        "desc": "Veja endereços, contactos e horários de funcionamento.",
        "button": "Ver pontos"
      },
      "rules": {
        "title": "Regras e detalhes importantes",
        "items": [
          {
            "icon": "i-lucide-calendar-days",
            "title": "Prazo da reserva",
            "desc": "A reserva fica disponível por um período limitado. Avisaremos o prazo no WhatsApp."
          },
          {
            "icon": "i-lucide-phone-call",
            "title": "Confirmação",
            "desc": "Confirmamos quando estiver pronto e combinamos o melhor horário para você ir."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Experimentação no ponto",
            "desc": "Você pode experimentar e recusar qualquer item que não sirva ou não agrade."
          },
          {
            "icon": "i-lucide-package-check",
            "title": "Verifique no local",
            "desc": "Confira os itens no ponto antes de levar."
          },
          {
            "icon": "i-lucide-rotate-ccw",
            "title": "Trocas e devoluções",
            "desc": "Se você levar e depois quiser trocar, as regras dependem do tipo do item e do estado. Veja a política."
          }
        ],
        "returnLinkText": "Política de Trocas e Devoluções"
      },
      "faq": {
        "title": "Perguntas frequentes",
        "items": [
          { "q": "Posso experimentar várias peças?", "a": "Sim. Reserve quantas quiser e leve apenas o que gostar." },
          { "q": "E se nada servir?", "a": "Sem problema — você pode recusar no local e não leva nada." },
          { "q": "Como sei quando posso ir?", "a": "Entraremos em contacto no WhatsApp quando estiver pronto para experimentar." },
          { "q": "Quanto tempo a reserva fica no ponto?", "a": "Guardamos por um período limitado. Informamos o prazo no WhatsApp." },
          { "q": "Onde vejo os pontos e horários?", "a": "Na página de pontos (endereços, contactos e horários)." }
        ]
      }
    }
  },
  "en": {
    "delivery": {
      "title": "How Amoda reservation works",
      "intro": "Reserve online and come try on at the point. No online payment — decide on the spot what you keep.",
      "meta": {
        "title": "How Amoda works | Reserve & try on in Luanda",
        "description": "Step-by-step: choose, reserve, pick a point, WhatsApp confirmation, and try on. Points and opening hours in Luanda."
      },
      "badges": {
        "try": "Free reservation",
        "pickup": "Try-on points",
        "fast": "Simple process"
      },
      "value": {
        "title": "Why this works better",
        "subtitle": "Simple idea: you don’t rely on photos. You check at the point and keep only what you like.",
        "items": [
          {
            "icon": "i-lucide-check-circle",
            "title": "No guessing",
            "desc": "Try the size and see the fit in real life. If it’s not right, don’t take it."
          },
          {
            "icon": "i-lucide-palette",
            "title": "Real color & material",
            "desc": "See the color and feel the fabric. No surprises."
          },
          {
            "icon": "i-lucide-shield-check",
            "title": "More confidence",
            "desc": "You decide at the point. Less risk, less regret."
          },
          {
            "icon": "i-lucide-clock",
            "title": "Fast and practical",
            "desc": "Choose, reserve, and come try on. No hassle."
          }
        ]
      },
      "how": {
        "title": "How it works",
        "steps": [
          { "icon": "i-lucide-search", "title": "Choose items", "desc": "Browse categories and add the items you want to try on." },
          { "icon": "i-lucide-clipboard-check", "title": "Place a reservation", "desc": "Enter your name and WhatsApp — no online payment." },
          { "icon": "i-lucide-map-pin", "title": "Select a point", "desc": "Choose a convenient pickup point to try on." },
          { "icon": "i-lucide-phone", "title": "WhatsApp confirmation", "desc": "We’ll message you when it’s ready to try on." },
          { "icon": "i-lucide-shirt", "title": "Try on & decide", "desc": "Try on at the point and take only what you like. No obligation." }
        ]
      },
      "pickup": {
        "title": "Try-on points",
        "desc": "See addresses, contacts, and opening hours.",
        "button": "View points"
      },
      "rules": {
        "title": "Important rules & details",
        "items": [
          {
            "icon": "i-lucide-calendar-days",
            "title": "Reservation window",
            "desc": "Reservations are held for a limited time. We’ll share the exact window on WhatsApp."
          },
          {
            "icon": "i-lucide-phone-call",
            "title": "Confirmation",
            "desc": "We confirm when it’s ready and help coordinate the best time to come."
          },
          {
            "icon": "i-lucide-shirt",
            "title": "Try-on at the point",
            "desc": "You can try on and decline any item that doesn’t fit or you don’t like."
          },
          {
            "icon": "i-lucide-package-check",
            "title": "Check on-site",
            "desc": "Inspect items at the point before taking them."
          },
          {
            "icon": "i-lucide-rotate-ccw",
            "title": "Exchanges & returns",
            "desc": "If you take items and later want to exchange, rules depend on item type and condition. See the policy."
          }
        ],
        "returnLinkText": "Exchange & Return Policy"
      },
      "faq": {
        "title": "FAQ",
        "items": [
          { "q": "Can I try multiple items?", "a": "Yes. Reserve as many as you want and keep only what you like." },
          { "q": "What if nothing fits?", "a": "No problem — you can decline on-site and take nothing." },
          { "q": "How do I know when I can come?", "a": "We’ll message you on WhatsApp when it’s ready to try on." },
          { "q": "How long is my reservation held?", "a": "Reservations are held for a limited time. We’ll share the exact window on WhatsApp." },
          { "q": "Where can I see locations and hours?", "a": "On the points page (addresses, contacts, and opening hours)." }
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
