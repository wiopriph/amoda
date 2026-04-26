<script setup lang="ts">
import { CONTACT_PHONE } from '~/constants/contacts';


definePageMeta({ name: 'terms-of-use' });

const { t, tm, rt } = useI18n();

const whatsappHref = computed(() => {
  const text = encodeURIComponent('Olá! Tenho uma dúvida sobre os termos de uso da Amoda.');

  return `https://wa.me/${CONTACT_PHONE}?text=${text}`;
});

const highlights = computed(() =>
  (tm('terms.highlights.items') as any[]).map((item) => ({
    icon: rt(item.icon),
    title: rt(item.title),
  })),
);

const sections = computed(() =>
  (tm('terms.sections') as any[]).map((s) => ({
    icon: rt(s.icon),
    title: rt(s.title),
    text: rt(s.text),
    items: s.items ? Object.values(s.items).map((i: any) => rt(i)) : [],
  })),
);

useHead(() => ({
  title: t('terms.meta.title'),
}));
</script>

<i18n lang="json">
{
  "pt": {
    "terms": {
      "title": "Termos de Uso",
      "subtitle": "Regras simples para usar a Amoda",
      "badge": "Sem complicação",
      "main": {
        "title": "Resumo rápido",
        "text": "Você usa a Amoda para escolher roupas, reservar sem pagar e experimentar antes de decidir. Nós usamos seus dados apenas para processar o pedido e falar com você."
      },
      "highlights": {
        "items": [
          { "icon": "i-lucide-shirt", "title": "Escolher e reservar online" },
          { "icon": "i-lucide-wallet", "title": "Sem pagamento antecipado" },
          { "icon": "i-simple-icons-whatsapp", "title": "Confirmamos via WhatsApp" }
        ]
      },
      "sections": [
        {
          "icon": "i-lucide-shopping-cart",
          "title": "Como funciona",
          "text": "Você pode navegar, escolher produtos e fazer uma reserva sem criar conta.",
          "items": {
            "1": "Adicionar produtos ao carrinho",
            "2": "Fazer pedido sem pagar",
            "3": "Escolher ponto de levantamento"
          }
        },
        {
          "icon": "i-lucide-user",
          "title": "Seu compromisso",
          "text": "Você deve fornecer dados corretos para que possamos processar o pedido.",
          "items": {
            "1": "Nome e telefone válidos",
            "2": "Usar seus próprios dados",
            "3": "Responder quando contactarmos"
          }
        },
        {
          "icon": "i-lucide-alert-circle",
          "title": "Pedidos",
          "text": "Um pedido é uma intenção de compra. Podemos confirmar ou cancelar se houver problemas.",
          "items": {
            "1": "Confirmamos via WhatsApp",
            "2": "Podemos cancelar por erro ou indisponibilidade"
          }
        },
        {
          "icon": "i-lucide-tag",
          "title": "Preços",
          "text": "Tentamos manter tudo correto, mas podemos corrigir erros se acontecerem.",
          "items": {
            "1": "Atualização de preços",
            "2": "Cancelamento em caso de erro"
          }
        },
        {
          "icon": "i-lucide-shield",
          "title": "Uso da plataforma",
          "text": "Use a Amoda de forma normal e legal.",
          "items": {
            "1": "Não usar para fraude",
            "2": "Não tentar hackear",
            "3": "Não abusar do sistema"
          }
        }
      ],
      "contact": {
        "title": "Dúvidas?",
        "text": "Fale connosco no WhatsApp se algo não estiver claro.",
        "button": "Falar no WhatsApp"
      },
      "meta": {
        "title": "Termos de Uso | Amoda"
      }
    }
  },
  "en": {
    "terms": {
      "title": "Terms of Use",
      "subtitle": "Simple rules for using Amoda",
      "badge": "No complexity",
      "main": {
        "title": "Quick summary",
        "text": "You use Amoda to choose clothes, reserve without paying, and try before deciding. We only use your data to process your request and contact you."
      },
      "highlights": {
        "items": [
          { "icon": "i-lucide-shirt", "title": "Browse and reserve online" },
          { "icon": "i-lucide-wallet", "title": "No upfront payment" },
          { "icon": "i-simple-icons-whatsapp", "title": "We confirm via WhatsApp" }
        ]
      },
      "sections": [
        {
          "icon": "i-lucide-shopping-cart",
          "title": "How it works",
          "text": "You can browse, choose products, and place a reservation without creating an account.",
          "items": {
            "1": "Add items to cart",
            "2": "Place order without payment",
            "3": "Choose pickup point"
          }
        },
        {
          "icon": "i-lucide-user",
          "title": "Your responsibility",
          "text": "You must provide accurate information so we can process your order.",
          "items": {
            "1": "Valid name and phone",
            "2": "Use your own contact",
            "3": "Be reachable"
          }
        },
        {
          "icon": "i-lucide-alert-circle",
          "title": "Orders",
          "text": "An order is an intention. We may confirm or cancel if needed.",
          "items": {
            "1": "We confirm via WhatsApp",
            "2": "We may cancel if unavailable"
          }
        },
        {
          "icon": "i-lucide-tag",
          "title": "Prices",
          "text": "We try to keep everything correct but may fix errors.",
          "items": {
            "1": "Price updates",
            "2": "Order cancellation if needed"
          }
        },
        {
          "icon": "i-lucide-shield",
          "title": "Platform use",
          "text": "Use Amoda normally and legally.",
          "items": {
            "1": "No fraud",
            "2": "No hacking",
            "3": "No abuse"
          }
        }
      ],
      "contact": {
        "title": "Questions?",
        "text": "Message us on WhatsApp if anything is unclear.",
        "button": "Chat on WhatsApp"
      },
      "meta": {
        "title": "Terms of Use | Amoda"
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <!-- HERO -->
      <section class="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-6 sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          {{ t('terms.badge') }}
        </UBadge>

        <h1 class="text-3xl font-black sm:text-5xl">
          {{ t('terms.title') }}
        </h1>

        <p class="mt-3 text-muted">
          {{ t('terms.subtitle') }}
        </p>

        <div class="mt-5 flex flex-wrap gap-4 text-sm">
          <div
            v-for="item in highlights"
            :key="item.title"
            class="flex items-center gap-2"
          >
            <UIcon
              :name="item.icon"
              class="size-4 text-primary"
            />
            {{ item.title }}
          </div>
        </div>
      </section>

      <!-- MAIN -->
      <section class="mt-6">
        <UCard class="border-primary/20 bg-primary/5">
          <h2 class="text-xl font-black">
            {{ t('terms.main.title') }}
          </h2>

          <p class="mt-3 text-muted">
            {{ t('terms.main.text') }}
          </p>
        </UCard>
      </section>

      <!-- SECTIONS -->
      <section class="mt-6 space-y-4">
        <UCard
          v-for="s in sections"
          :key="s.title"
        >
          <div class="flex items-center gap-2">
            <UIcon
              :name="s.icon"
              class="size-5 text-primary"
            />

            <h2 class="font-bold">
              {{ s.title }}
            </h2>
          </div>

          <p class="mt-2 text-muted">
            {{ s.text }}
          </p>

          <ul
            v-if="s.items.length"
            class="mt-3 space-y-2 text-sm text-muted"
          >
            <li
              v-for="item in s.items"
              :key="item"
              class="flex gap-2"
            >
              <span class="mt-2 size-1.5 rounded-full bg-primary" />
              {{ item }}
            </li>
          </ul>
        </UCard>
      </section>

      <!-- CTA -->
      <section class="mt-6">
        <UAlert
          color="success"
          variant="soft"
          icon="i-simple-icons-whatsapp"
          :title="t('terms.contact.title')"
          :description="t('terms.contact.text')"
        >
          <template #actions>
            <UButton
              :to="whatsappHref"
              target="_blank"
              color="success"
            >
              {{ t('terms.contact.button') }}
            </UButton>
          </template>
        </UAlert>
      </section>
    </UPageBody>
  </UPage>
</template>
