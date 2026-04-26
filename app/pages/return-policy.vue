<script setup lang="ts">
import { CONTACT_PHONE } from '~/constants/contacts';


definePageMeta({ name: 'return-policy' });

const { t, tm, rt } = useI18n();

const highlights = computed(() =>
  (tm('returnPolicy.highlights.items') as any[]).map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
  })),
);

const rules = computed(() =>
  (tm('returnPolicy.rules.items') as any[]).map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
    text: rt(item.text),
  })),
);

const whatsappHref = computed(() => {
  const text = encodeURIComponent('Olá! Preciso de ajuda com troca ou devolução na Amoda.');

  return `https://wa.me/${CONTACT_PHONE}?text=${text}`;
});

useHead(() => ({
  title: t('returnPolicy.meta.title'),
  meta: [
    { name: 'description', content: t('returnPolicy.meta.description') },
    { property: 'og:title', content: t('returnPolicy.meta.title') },
    { property: 'og:description', content: t('returnPolicy.meta.description') },
  ],
}));
</script>

<i18n lang="json">
{
  "pt": {
    "returnPolicy": {
      "title": "Trocas e devoluções",
      "intro": "Na Amoda, você pode experimentar antes de pagar. Se não gostar no ponto, não leva e não paga.",
      "badge": "Sem pagamento antes de experimentar",
      "highlights": {
        "items": [
          {
            "icon": "i-lucide-shirt",
            "title": "Experimente primeiro"
          },
          {
            "icon": "i-lucide-wallet",
            "title": "Pague só o que levar"
          },
          {
            "icon": "i-lucide-refresh-ccw",
            "title": "Troca possível em até 7 dias"
          }
        ]
      },
      "main": {
        "title": "O mais importante",
        "text": "Antes de pagar, você pode ver, tocar e experimentar as peças. Se não servir, não ficar bem ou não gostar, basta recusar no local."
      },
      "rules": {
        "title": "Regras depois da compra",
        "items": [
          {
            "icon": "i-lucide-calendar-days",
            "title": "Prazo de 7 dias",
            "text": "Depois de levar a peça, você pode pedir troca ou devolução em até 7 dias."
          },
          {
            "icon": "i-lucide-tags",
            "title": "Produto sem uso",
            "text": "A peça precisa estar sem uso, em condição original, com etiqueta, embalagem e acessórios."
          },
          {
            "icon": "i-lucide-ban",
            "title": "Itens que não aceitamos",
            "text": "Não aceitamos devolução de roupa interior, itens de higiene pessoal, produtos Final Sale, peças usadas, danificadas ou alteradas."
          },
          {
            "icon": "i-lucide-banknote",
            "title": "Reembolso",
            "text": "Se a devolução for aprovada, o valor será devolvido conforme o método usado no ponto. O prazo normal é de 5 a 10 dias úteis."
          },
          {
            "icon": "i-lucide-alert-circle",
            "title": "Produto errado ou com defeito",
            "text": "Se receber algo errado ou com defeito, contacte-nos em até 24 horas após o levantamento e envie fotos."
          }
        ]
      },
      "how": {
        "title": "Como pedir troca ou devolução",
        "text": "Entre em contacto e informe o número da reserva. A nossa equipa vai orientar os próximos passos."
      },
      "contact": {
        "title": "Precisa de ajuda?",
        "text": "Fale connosco no WhatsApp. Vamos orientar sobre troca, devolução ou qualquer dúvida.",
        "button": "Escrever no WhatsApp"
      },
      "meta": {
        "title": "Trocas e Devoluções | Amoda",
        "description": "Entenda as regras de troca e devolução da Amoda. Experimente antes de pagar e leve apenas o que gostar."
      }
    }
  },
  "en": {
    "returnPolicy": {
      "title": "Exchanges and returns",
      "intro": "At Amoda, you can try before paying. If you do not like it at the point, do not take it and do not pay.",
      "badge": "No payment before trying",
      "highlights": {
        "items": [
          {
            "icon": "i-lucide-shirt",
            "title": "Try first"
          },
          {
            "icon": "i-lucide-wallet",
            "title": "Pay only for what you keep"
          },
          {
            "icon": "i-lucide-refresh-ccw",
            "title": "Exchange possible within 7 days"
          }
        ]
      },
      "main": {
        "title": "Most important",
        "text": "Before paying, you can see, touch and try the items. If it does not fit, does not look good, or you do not like it, simply refuse it at the point."
      },
      "rules": {
        "title": "Rules after purchase",
        "items": [
          {
            "icon": "i-lucide-calendar-days",
            "title": "7-day window",
            "text": "After taking the item, you can request an exchange or return within 7 days."
          },
          {
            "icon": "i-lucide-tags",
            "title": "Unused item",
            "text": "The item must be unused, in original condition, with tags, packaging and accessories."
          },
          {
            "icon": "i-lucide-ban",
            "title": "Items we cannot accept",
            "text": "We do not accept returns for underwear, personal hygiene items, Final Sale products, used, damaged or altered items."
          },
          {
            "icon": "i-lucide-banknote",
            "title": "Refund",
            "text": "If the return is approved, the amount will be refunded according to the method used at the point. Normal processing time is 5 to 10 business days."
          },
          {
            "icon": "i-lucide-alert-circle",
            "title": "Wrong or defective item",
            "text": "If you receive a wrong or defective item, contact us within 24 hours after pickup and send photos."
          }
        ]
      },
      "how": {
        "title": "How to request exchange or return",
        "text": "Contact us and provide your reservation number. Our team will guide you through the next steps."
      },
      "contact": {
        "title": "Need help?",
        "text": "Message us on WhatsApp. We’ll help with exchanges, returns, or any questions.",
        "button": "Message on WhatsApp"
      },
      "meta": {
        "title": "Exchanges and Returns | Amoda",
        "description": "Understand Amoda exchange and return rules. Try before paying and keep only what you like."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          {{ t('returnPolicy.badge') }}
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          {{ t('returnPolicy.title') }}
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          {{ t('returnPolicy.intro') }}
        </p>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-toned">
          <div
            v-for="item in highlights"
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

      <section class="mt-5 sm:mt-6">
        <UCard class="border-primary/20 bg-primary/5">
          <h2 class="text-xl font-black text-highlighted">
            {{ t('returnPolicy.main.title') }}
          </h2>

          <p class="mt-3 text-sm leading-7 text-muted sm:text-base">
            {{ t('returnPolicy.main.text') }}
          </p>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <h2 class="text-xl font-black text-highlighted">
            {{ t('returnPolicy.rules.title') }}
          </h2>

          <div class="mt-5 divide-y divide-gray-100">
            <div
              v-for="rule in rules"
              :key="rule.title"
              class="py-4 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="rule.icon"
                  class="size-5 text-primary"
                />

                <h3 class="font-bold text-highlighted">
                  {{ rule.title }}
                </h3>
              </div>

              <p class="mt-2 text-sm leading-6 text-muted">
                {{ rule.text }}
              </p>
            </div>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <h2 class="text-xl font-black text-highlighted">
            {{ t('returnPolicy.how.title') }}
          </h2>

          <p class="mt-3 text-sm leading-7 text-muted sm:text-base">
            {{ t('returnPolicy.how.text') }}
          </p>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UAlert
          color="success"
          variant="soft"
          icon="i-simple-icons-whatsapp"
          :title="t('returnPolicy.contact.title')"
          :description="t('returnPolicy.contact.text')"
        >
          <template #actions>
            <UButton
              :to="whatsappHref"
              target="_blank"
              color="success"
              variant="solid"
              size="sm"
            >
              {{ t('returnPolicy.contact.button') }}
            </UButton>
          </template>
        </UAlert>
      </section>
    </UPageBody>
  </UPage>
</template>
