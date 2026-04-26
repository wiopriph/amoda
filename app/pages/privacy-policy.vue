<script setup lang="ts">
import { CONTACT_PHONE, COMPANY_ADDRESS } from '~/constants/contacts';


definePageMeta({
  name: 'privacy-policy',
});

const { t, tm, rt } = useI18n();

const whatsappHref = computed(() => {
  const text = encodeURIComponent('Olá! Preciso de ajuda com privacidade ou dados pessoais na Amoda.');

  return `https://wa.me/${CONTACT_PHONE}?text=${text}`;
});

const highlights = computed(() =>
  (tm('privacy.highlights.items') as any[]).map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
  })),
);

const sections = computed(() =>
  (tm('privacy.sections') as any[]).map((section) => ({
    icon: rt(section.icon),
    title: rt(section.title),
    text: rt(section.text),
    items: section.items ? (section.items as any[]).map((item) => rt(item)) : [],
  })),
);

useHead(() => ({
  title: t('privacy.meta.title'),
  meta: [
    { name: 'description', content: t('privacy.meta.description') },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: t('privacy.meta.title') },
    { property: 'og:description', content: t('privacy.meta.description') },
  ],
}));
</script>

<i18n lang="json">
{
  "pt": {
    "privacy": {
      "title": "Política de Privacidade",
      "subtitle": "A Amoda usa apenas os dados necessários para receber a sua reserva, falar consigo no WhatsApp e preparar os seus itens.",
      "badge": "Privacidade simples",
      "effective": "Atualizado em 09/01/2026",
      "highlights": {
        "items": [
          {
            "icon": "i-lucide-user",
            "title": "Sem cadastro obrigatório"
          },
          {
            "icon": "i-simple-icons-whatsapp",
            "title": "Usamos o WhatsApp para confirmar"
          },
          {
            "icon": "i-lucide-shield-check",
            "title": "Dados usados só para o pedido"
          }
        ]
      },
      "main": {
        "title": "O mais importante",
        "text": "Você não precisa criar conta para usar a Amoda. Quando faz uma reserva, pedimos apenas o seu nome e WhatsApp para confirmar o pedido e combinar a experimentação."
      },
      "sections": [
        {
          "icon": "i-lucide-building-2",
          "title": "Quem somos",
          "text": "A Amoda é a responsável pelo website e pelo tratamento dos dados usados para reservas.",
          "items": [
            "Endereço: %%address%%"
          ]
        },
        {
          "icon": "i-lucide-database",
          "title": "Dados que recolhemos",
          "text": "Não pedimos dados desnecessários. No checkout, recolhemos apenas o necessário para processar a reserva.",
          "items": [
            "Nome",
            "Número de telefone / WhatsApp",
            "Itens escolhidos e ponto de experimentação"
          ]
        },
        {
          "icon": "i-lucide-message-circle",
          "title": "Como usamos os dados",
          "text": "Usamos os seus dados para confirmar a reserva, preparar os itens, falar consigo no WhatsApp e prestar apoio ao cliente.",
          "items": []
        },
        {
          "icon": "i-lucide-share-2",
          "title": "Partilha de dados",
          "text": "Não vendemos os seus dados. Só partilhamos informações quando for necessário para cumprir o pedido ou quando a lei exigir.",
          "items": []
        },
        {
          "icon": "i-lucide-clock",
          "title": "Por quanto tempo guardamos",
          "text": "Guardamos os dados pelo tempo necessário para gerir a reserva, apoio ao cliente e obrigações legais. Depois, os dados podem ser eliminados ou anonimizados.",
          "items": []
        },
        {
          "icon": "i-lucide-lock",
          "title": "Segurança",
          "text": "Aplicamos medidas razoáveis para proteger os seus dados contra acesso não autorizado, perda ou alteração.",
          "items": []
        },
        {
          "icon": "i-lucide-user-check",
          "title": "Os seus direitos",
          "text": "Você pode pedir informação, correção ou eliminação dos seus dados, quando aplicável. Para isso, fale connosco no WhatsApp.",
          "items": []
        },
        {
          "icon": "i-lucide-child",
          "title": "Menores",
          "text": "A Amoda não é destinada a menores. Se acredita que recebemos dados de um menor, contacte-nos para resolvermos.",
          "items": []
        },
        {
          "icon": "i-lucide-external-link",
          "title": "Links externos",
          "text": "O nosso site pode ter links para outros websites, como WhatsApp, TikTok, Facebook ou Google Maps. Não controlamos as políticas desses serviços.",
          "items": []
        },
        {
          "icon": "i-lucide-refresh-ccw",
          "title": "Alterações",
          "text": "Podemos atualizar esta política quando necessário. A versão nova entra em vigor quando for publicada no site.",
          "items": []
        }
      ],
      "contact": {
        "title": "Precisa de ajuda com privacidade?",
        "text": "Fale connosco no WhatsApp se quiser perguntar algo sobre os seus dados pessoais.",
        "button": "Falar no WhatsApp"
      },
      "meta": {
        "title": "Política de Privacidade | Amoda",
        "description": "Entenda como a Amoda recolhe e usa os seus dados pessoais para reservas, WhatsApp e apoio ao cliente."
      }
    }
  },
  "en": {
    "privacy": {
      "title": "Privacy Policy",
      "subtitle": "Amoda only uses the data needed to receive your reservation, contact you on WhatsApp, and prepare your items.",
      "badge": "Simple privacy",
      "effective": "Updated on 09/01/2026",
      "highlights": {
        "items": [
          {
            "icon": "i-lucide-user",
            "title": "No account required"
          },
          {
            "icon": "i-simple-icons-whatsapp",
            "title": "We use WhatsApp to confirm"
          },
          {
            "icon": "i-lucide-shield-check",
            "title": "Data used only for orders"
          }
        ]
      },
      "main": {
        "title": "Most important",
        "text": "You do not need to create an account to use Amoda. When you place a reservation, we only ask for your name and WhatsApp to confirm the request and arrange the try-on."
      },
      "sections": [
        {
          "icon": "i-lucide-building-2",
          "title": "Who we are",
          "text": "Amoda is responsible for the website and the data used for reservations.",
          "items": [
            "Address: %%address%%"
          ]
        },
        {
          "icon": "i-lucide-database",
          "title": "Data we collect",
          "text": "We do not ask for unnecessary data. At checkout, we collect only what is needed to process your reservation.",
          "items": [
            "Name",
            "Phone number / WhatsApp",
            "Selected items and try-on point"
          ]
        },
        {
          "icon": "i-lucide-message-circle",
          "title": "How we use data",
          "text": "We use your data to confirm the reservation, prepare items, contact you on WhatsApp, and provide customer support.",
          "items": []
        },
        {
          "icon": "i-lucide-share-2",
          "title": "Data sharing",
          "text": "We do not sell your data. We only share information when needed to complete your request or when required by law.",
          "items": []
        },
        {
          "icon": "i-lucide-clock",
          "title": "How long we keep data",
          "text": "We keep data as long as needed to manage reservations, customer support, and legal obligations. After that, data may be deleted or anonymized.",
          "items": []
        },
        {
          "icon": "i-lucide-lock",
          "title": "Security",
          "text": "We apply reasonable measures to protect your data against unauthorized access, loss, or changes.",
          "items": []
        },
        {
          "icon": "i-lucide-user-check",
          "title": "Your rights",
          "text": "You may request information, correction, or deletion of your data where applicable. To do so, contact us on WhatsApp.",
          "items": []
        },
        {
          "icon": "i-lucide-scan-face",
          "title": "Minors",
          "text": "Amoda is not intended for minors. If you believe we received data from a minor, contact us so we can resolve it.",
          "items": []
        },
        {
          "icon": "i-lucide-external-link",
          "title": "External links",
          "text": "Our website may include links to other services, such as WhatsApp, TikTok, Facebook, or Google Maps. We do not control their policies.",
          "items": []
        },
        {
          "icon": "i-lucide-refresh-ccw",
          "title": "Changes",
          "text": "We may update this policy when needed. The new version becomes effective when published on the website.",
          "items": []
        }
      ],
      "contact": {
        "title": "Need help with privacy?",
        "text": "Message us on WhatsApp if you have questions about your personal data.",
        "button": "Chat on WhatsApp"
      },
      "meta": {
        "title": "Privacy Policy | Amoda",
        "description": "Understand how Amoda collects and uses your personal data for reservations, WhatsApp, and customer support."
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
          {{ t('privacy.badge') }}
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          {{ t('privacy.title') }}
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          {{ t('privacy.subtitle') }}
        </p>

        <p class="mt-3 text-sm text-muted">
          {{ t('privacy.effective') }}
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
            {{ t('privacy.main.title') }}
          </h2>

          <p class="mt-3 text-sm leading-7 text-muted sm:text-base">
            {{ t('privacy.main.text') }}
          </p>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UCard>
          <div class="divide-y divide-gray-100">
            <div
              v-for="section in sections"
              :key="section.title"
              class="py-5 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  :name="section.icon"
                  class="size-5 text-primary"
                />

                <h2 class="text-lg font-bold text-highlighted">
                  {{ section.title }}
                </h2>
              </div>

              <p class="mt-2 text-sm leading-7 text-muted sm:text-base">
                {{ section.text }}
              </p>

              <ul
                v-if="section.items.length"
                class="mt-3 space-y-2 text-sm leading-6 text-muted"
              >
                <li
                  v-for="item in section.items"
                  :key="item"
                  class="flex gap-2"
                >
                  <span class="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />

                  <span>{{ item.replace('%%address%%', COMPANY_ADDRESS) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </UCard>
      </section>

      <section class="mt-5 sm:mt-6">
        <UAlert
          color="success"
          variant="soft"
          icon="i-simple-icons-whatsapp"
          :title="t('privacy.contact.title')"
          :description="t('privacy.contact.text')"
        >
          <template #actions>
            <UButton
              :to="whatsappHref"
              target="_blank"
              color="success"
              variant="solid"
              size="sm"
            >
              {{ t('privacy.contact.button') }}
            </UButton>
          </template>
        </UAlert>
      </section>
    </UPageBody>
  </UPage>
</template>
