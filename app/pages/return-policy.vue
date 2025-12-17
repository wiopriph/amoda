<script setup lang="ts">
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
      "title": "Política de Devoluções e Reembolsos",
      "intro": "Na Amoda, queremos que compres com confiança. Esta página explica como funcionam devoluções e reembolsos quando a entrega é feita em pontos de recolha/showrooms (sem entrega ao domicílio).",
      "sections": {
        "try": {
          "title": "1) Experimentar antes de decidir (no ponto de recolha)",
          "text": "Podes inspecionar e experimentar o artigo no ponto de recolha/showroom antes de confirmar a compra. Se não servir ou não corresponder às expectativas, podes recusar no momento. Neste caso, não há cobrança pelo artigo recusado."
        },
        "after": {
          "title": "2) Devoluções após a compra",
          "text": "Se já confirmaste a compra e levantaste o pedido, podes solicitar devolução dentro de 7 dias após o levantamento, desde que o artigo esteja sem uso, em condições originais, com etiquetas, embalagem e acessórios."
        },
        "nonReturnable": {
          "title": "3) Artigos não elegíveis para devolução",
          "text": "Não aceitamos devolução de: roupa interior e produtos de higiene pessoal, artigos marcados como “Final Sale”, e artigos usados, danificados ou alterados."
        },
        "refunds": {
          "title": "4) Reembolsos",
          "text": "Após aprovação e verificação do artigo devolvido, o reembolso será feito pelo mesmo método de pagamento. Prazo típico: 5–10 dias úteis após a aprovação. Taxas de serviço/entrega (se existirem) não são reembolsáveis."
        },
        "how": {
          "title": "5) Como solicitar uma devolução",
          "text": "Para iniciar uma devolução, contacta o nosso suporte e indica o número do pedido. Vamos orientar-te com os próximos passos e confirmar o ponto de recolha/showroom para entrega do artigo."
        },
        "wrong": {
          "title": "6) Artigo errado ou danificado",
          "text": "Se recebeste um artigo errado ou danificado, contacta-nos dentro de 24 horas após o levantamento e envia fotos. Vamos resolver o mais rápido possível."
        },
        "contact": {
          "title": "Contacto"
        }
      },
      "meta": {
        "title": "Política de Devoluções | Amoda",
        "description": "Regras de devolução e reembolso para pedidos levantados em pontos de recolha/showrooms (sem entrega ao domicílio)."
      }
    }
  },
  "en": {
    "returnPolicy": {
      "title": "Return & Refund Policy",
      "intro": "At Amoda, we want you to shop with confidence. This page explains how returns and refunds work when orders are collected at pickup points/showrooms (no home delivery).",
      "sections": {
        "try": {
          "title": "1) Try before you decide (at pickup)",
          "text": "You can inspect and try on the item at the pickup point/showroom before confirming the purchase. If it doesn’t fit or isn’t what you expected, you can refuse it on the spot. In this case, you won’t be charged for the refused item."
        },
        "after": {
          "title": "2) Returns after purchase",
          "text": "If you already confirmed the purchase and collected the order, you can request a return within 7 days after pickup, as long as the item is unused, in original condition, with tags, packaging, and all accessories."
        },
        "nonReturnable": {
          "title": "3) Non-returnable items",
          "text": "We do not accept returns for: underwear and personal hygiene items, items marked “Final Sale”, and items that are used, damaged, or altered."
        },
        "refunds": {
          "title": "4) Refunds",
          "text": "After approval and inspection of the returned item, the refund will be issued to the original payment method. Typical processing time: 5–10 business days after approval. Any service/delivery fees (if applicable) are non-refundable."
        },
        "how": {
          "title": "5) How to request a return",
          "text": "To start a return, contact our support and provide your order number. We’ll guide you through the next steps and confirm the pickup point/showroom where you should bring the item."
        },
        "wrong": {
          "title": "6) Wrong or damaged item",
          "text": "If you received the wrong or a damaged item, contact us within 24 hours after pickup and send photos. We’ll fix it as fast as possible."
        },
        "contact": {
          "title": "Contact"
        }
      },
      "meta": {
        "title": "Return Policy | Amoda",
        "description": "Return and refund rules for orders collected at pickup points/showrooms (no home delivery)."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader :title="t('returnPolicy.title')" />

    <UPageBody>
      <div class="space-y-6">
        <p class="text-sm opacity-80">
          {{ t('returnPolicy.intro') }}
        </p>

        <UCard>
          <template #header>
            <div class="font-medium">
              {{ t('returnPolicy.sections.try.title') }}
            </div>
          </template>

          <p class="text-sm opacity-90">
            {{ t('returnPolicy.sections.try.text') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-medium">
              {{ t('returnPolicy.sections.after.title') }}
            </div>
          </template>

          <p class="text-sm opacity-90">
            {{ t('returnPolicy.sections.after.text') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-medium">
              {{ t('returnPolicy.sections.nonReturnable.title') }}
            </div>
          </template>

          <p class="text-sm opacity-90">
            {{ t('returnPolicy.sections.nonReturnable.text') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-medium">
              {{ t('returnPolicy.sections.refunds.title') }}
            </div>
          </template>

          <p class="text-sm opacity-90">
            {{ t('returnPolicy.sections.refunds.text') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-medium">
              {{ t('returnPolicy.sections.how.title') }}
            </div>
          </template>

          <p class="text-sm opacity-90">
            {{ t('returnPolicy.sections.how.text') }}
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-medium">
              {{ t('returnPolicy.sections.wrong.title') }}
            </div>
          </template>

          <p class="text-sm opacity-90">
            {{ t('returnPolicy.sections.wrong.text') }}
          </p>
        </UCard>

        <UAlert
          :title="t('returnPolicy.sections.contact.title')"
          icon="i-lucide-mail"
          variant="soft"
        >
          <template #description>
            <a href="mailto:support@amoda.market">support@ambo.market</a>
          </template>
        </UAlert>
      </div>
    </UPageBody>
  </UPage>
</template>
