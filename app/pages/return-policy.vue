<script setup lang="ts">
import { CONTACT_EMAIL } from '~/constants/contacts';


definePageMeta({ name: 'return-policy' });

const { t } = useI18n();

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
      "title": "Trocas e Devoluções",
      "intro": "Na Amoda, você reserva online e experimenta no ponto. Se não servir ou não gostar, basta não levar — sem pagamento.",
      "sections": {
        "try": {
          "title": "1) Experimente no ponto (antes de pagar)",
          "text": "No ponto de levantamento, você pode inspecionar e experimentar. Se não servir ou não for como esperava, pode recusar na hora. Nesse caso, você não paga por esse artigo."
        },
        "after": {
          "title": "2) Troca/devolução após levar",
          "text": "Se você levou o artigo e depois quiser trocar/devolver, pode solicitar em até 7 dias após o levantamento, desde que esteja sem uso, em condição original, com etiquetas, embalagem e acessórios."
        },
        "nonReturnable": {
          "title": "3) Artigos não elegíveis",
          "text": "Não aceitamos devolução de: roupa interior e itens de higiene pessoal, artigos marcados como “Final Sale”, e artigos usados, danificados ou alterados."
        },
        "refunds": {
          "title": "4) Reembolso (quando aplicável)",
          "text": "Se a devolução for aprovada, o valor pago pelo artigo devolvido será reembolsado conforme o método utilizado no ponto. Prazo típico: 5–10 dias úteis após a aprovação. Taxas de serviço (se existirem) não são reembolsáveis."
        },
        "how": {
          "title": "5) Como solicitar",
          "text": "Para iniciar uma troca/devolução, contacte-nos e informe o número do pedido. Vamos orientar os próximos passos e confirmar o ponto onde deve entregar o artigo."
        },
        "wrong": {
          "title": "6) Artigo errado ou com defeito",
          "text": "Se recebeu um artigo errado ou com defeito, contacte-nos dentro de 24 horas após o levantamento e envie fotos. Vamos resolver o mais rápido possível."
        },
        "contact": {
          "title": "Contacto"
        }
      },
      "meta": {
        "title": "Trocas e Devoluções | Amoda",
        "description": "Regras de troca e devolução para pedidos levantados em pontos: experimente no ponto e pague apenas pelo que levar."
      }
    }
  },
  "en": {
    "returnPolicy": {
      "title": "Exchanges & Returns",
      "intro": "At Amoda, you reserve online and try on at pickup. If it doesn’t fit or you don’t like it, simply don’t take it — no payment.",
      "sections": {
        "try": {
          "title": "1) Try on at pickup (before paying)",
          "text": "At the pickup point, you can inspect and try on items. If it doesn’t fit or isn’t what you expected, you can refuse it on the spot. In that case, you won’t pay for that item."
        },
        "after": {
          "title": "2) Exchange/return after you take it",
          "text": "If you took the item and later want to exchange/return it, you can request it within 7 days after pickup, as long as it’s unused, in original condition, with tags, packaging, and all accessories."
        },
        "nonReturnable": {
          "title": "3) Non-eligible items",
          "text": "We do not accept returns for: underwear and personal hygiene items, items marked “Final Sale”, and items that are used, damaged, or altered."
        },
        "refunds": {
          "title": "4) Refunds (when applicable)",
          "text": "If a return is approved, the amount paid for the returned item will be refunded via the same method used at pickup. Typical processing time: 5–10 business days after approval. Any service fees (if applicable) are non-refundable."
        },
        "how": {
          "title": "5) How to request",
          "text": "To start an exchange/return, contact us and provide your order number. We’ll guide you through the next steps and confirm where to bring the item."
        },
        "wrong": {
          "title": "6) Wrong or defective item",
          "text": "If you received the wrong or a defective item, contact us within 24 hours after pickup and send photos. We’ll fix it as fast as possible."
        },
        "contact": {
          "title": "Contact"
        }
      },
      "meta": {
        "title": "Exchanges & Returns | Amoda",
        "description": "Exchange and return rules for pickup orders: try on at pickup and pay only for what you keep."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('returnPolicy.title')"
      :description="t('returnPolicy.intro')"
    />

    <UPageBody class="max-w-3xl mx-auto">
      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('returnPolicy.sections.try.title') }}
            </h2>
          </template>

          <p class="leading-7">
            {{ t('returnPolicy.sections.try.text') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('returnPolicy.sections.after.title') }}
            </h2>
          </template>

          <p class="leading-7">
            {{ t('returnPolicy.sections.after.text') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('returnPolicy.sections.nonReturnable.title') }}
            </h2>
          </template>

          <p class="leading-7">
            {{ t('returnPolicy.sections.nonReturnable.text') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('returnPolicy.sections.refunds.title') }}
            </h2>
          </template>

          <p class="leading-7">
            {{ t('returnPolicy.sections.refunds.text') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('returnPolicy.sections.how.title') }}
            </h2>
          </template>

          <p class="leading-7">
            {{ t('returnPolicy.sections.how.text') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('returnPolicy.sections.wrong.title') }}
            </h2>
          </template>

          <p class="leading-7">
            {{ t('returnPolicy.sections.wrong.text') }}
          </p>
        </UCard>

        <UAlert
          :title="t('returnPolicy.sections.contact.title')"
          icon="i-lucide-mail"
          variant="soft"
        >
          <template #description>
            <a
              class="underline underline-offset-4"
              :href="`mailto:${CONTACT_EMAIL}`"
            >{{ CONTACT_EMAIL }}</a>
          </template>
        </UAlert>
      </div>
    </UPageBody>
  </UPage>
</template>
