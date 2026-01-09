<script setup lang="ts">
import { CONTACT_EMAIL, COMPANY_ADDRESS } from '~/constants/contacts';


definePageMeta({
  name: 'terms-of-use',
});

const { t } = useI18n();

useHead(() => ({
  title: t('meta.title'),
  meta: [{ name: 'robots', content: 'index, follow' }],
}));
</script>

<i18n lang="json">
{
  "en": {
    "meta": {
      "title": "Terms of Use | Amoda"
    },
    "page": {
      "title": "Terms of Use",
      "subtitle": "Rules for using the Amoda platform",
      "effectiveDateLabel": "Effective Date:",
      "effectiveDateValue": "09/01/2026"
    },
    "sections": {
      "general": {
        "title": "1. General",
        "p1": "These Terms of Use (the “Terms”) govern your use of the Amoda website (the “Platform”).",
        "p2": "By using the Platform, including browsing products, adding items to cart, and placing an order, you agree to these Terms. If you do not agree, you must stop using the Platform."
      },
      "platform": {
        "title": "2. Platform functionality",
        "p1": "Amoda provides an online product catalog that allows you to:",
        "items": {
          "browse": "Browse products by categories and view product pages",
          "cart": "Add products to your cart",
          "checkout": "Place an order via checkout without creating an account",
          "pickup": "Select a pickup point (if available)"
        },
        "note": "The Platform does not provide user registration or personal accounts."
      },
      "order": {
        "title": "3. Placing an order",
        "p1": "To place an order, you add items to your cart and proceed to checkout where you provide the following information:",
        "p2": "You confirm that the information you provide is accurate and up to date, and that you use your own contact details.",
        "items": {
          "name": "Name",
          "phone": "Phone number",
          "email": "Email address",
          "pickup": "Pickup point selection (if available)",
          "truthful": "Provide accurate and current information",
          "ownContact": "Use your own phone number and email address"
        },
        "note": "Amoda is not responsible for inability to fulfill an order due to incorrect contact information."
      },
      "orderStatus": {
        "title": "4. Order status and acceptance",
        "p1": "Placing an order on the Platform indicates your intention to purchase, but may not constitute an automatically accepted contract.",
        "p2": "Amoda may:",
        "items": {
          "confirm": "Contact you to confirm the order",
          "decline": "Decline or cancel an order due to technical errors, lack of availability, or other reasonable reasons"
        }
      },
      "prices": {
        "title": "5. Product information and prices",
        "p1": "We aim to keep product information and prices accurate and up to date.",
        "p2": "If an error occurs (including price or availability), Amoda may:",
        "items": {
          "correct": "Correct the information",
          "cancel": "Cancel the order and notify you"
        }
      },
      "paymentPickup": {
        "title": "6. Payment and pickup",
        "p1": "Payment and pickup options (including pickup points) are shown during checkout and may depend on your location and availability.",
        "note": "Specific terms shown at checkout form part of the order process."
      },
      "restrictions": {
        "title": "7. Acceptable use",
        "p1": "You agree to use the Platform lawfully and not to disrupt or misuse it. In particular, you must not:",
        "items": {
          "legal": "Use the Platform for unlawful purposes",
          "noAbuse": "Abuse or attempt to bypass security measures",
          "noAccess": "Attempt unauthorized access to systems or data",
          "noFraud": "Use the Platform for fraudulent activities",
          "noInterference": "Interfere with the Platform’s operation (including via automated tools) without permission"
        }
      },
      "ip": {
        "title": "8. Intellectual property",
        "p1": "All content on the Platform (including text, images, logos, and design) is owned by Amoda or used under lawful rights.",
        "p2": "You may not copy, distribute, or otherwise use Platform materials without prior written permission, except where permitted by law."
      },
      "liability": {
        "title": "9. Limitation of liability",
        "p1": "The Platform is provided on an “as is” basis. Amoda is not liable for:",
        "items": {
          "downtime": "Temporary unavailability of the Platform",
          "errors": "Technical issues or errors",
          "losses": "Losses arising from use or inability to use the Platform"
        }
      },
      "privacy": {
        "title": "10. Privacy",
        "p1": "Personal data processing is described in our",
        "privacyLinkText": "Privacy Policy",
        "privacyUrl": "/privacy-policy"
      },
      "thirdParty": {
        "title": "11. Third-party links",
        "p1": "The Platform may contain links to third-party websites. Amoda is not responsible for their content or privacy practices."
      },
      "changes": {
        "title": "12. Changes to these Terms",
        "p1": "Amoda may update these Terms at any time by publishing an updated version on the Platform.",
        "p2": "Continued use of the Platform after updates means you accept the updated Terms."
      },
      "contacts": {
        "title": "13. Contact information",
        "emailLabel": "Email: ",
        "addressLabel": "Address: "
      }
    }
  },
  "pt": {
    "meta": {
      "title": "Termos de Uso | Amoda"
    },
    "page": {
      "title": "Termos de Uso",
      "subtitle": "Regras de utilização da plataforma Amoda",
      "effectiveDateLabel": "Data de entrada em vigor:",
      "effectiveDateValue": "09/01/2026"
    },
    "sections": {
      "general": {
        "title": "1. Disposições gerais",
        "p1": "Estes Termos de Uso (os “Termos”) regulam a utilização do website Amoda (a “Plataforma”).",
        "p2": "Ao utilizar a Plataforma — incluindo navegar pelos produtos, adicionar itens ao carrinho e efetuar um pedido — você concorda com estes Termos. Se não concordar, deve parar de utilizar a Plataforma."
      },
      "platform": {
        "title": "2. Funcionalidades da Plataforma",
        "p1": "A Amoda disponibiliza um catálogo online que permite:",
        "items": {
          "browse": "Navegar por categorias e visualizar páginas de produtos",
          "cart": "Adicionar produtos ao carrinho",
          "checkout": "Efetuar um pedido via checkout sem criar conta",
          "pickup": "Selecionar um ponto de levantamento (se disponível)"
        },
        "note": "A Plataforma não oferece registo de utilizadores nem contas pessoais."
      },
      "order": {
        "title": "3. Efetuar um pedido",
        "p1": "Para efetuar um pedido, você adiciona itens ao carrinho e segue para o checkout, onde fornece as seguintes informações:",
        "p2": "Você confirma que as informações fornecidas são corretas e atualizadas e que utiliza os seus próprios contactos.",
        "items": {
          "name": "Nome",
          "phone": "Número de telefone",
          "email": "Endereço de email",
          "pickup": "Seleção do ponto de levantamento (se disponível)",
          "truthful": "Fornecer informações corretas e atualizadas",
          "ownContact": "Utilizar o seu próprio número de telefone e email"
        },
        "note": "A Amoda não se responsabiliza pela impossibilidade de cumprir um pedido devido a contactos incorretos."
      },
      "orderStatus": {
        "title": "4. Estado e aceitação do pedido",
        "p1": "Ao efetuar um pedido na Plataforma, você manifesta a intenção de compra, mas isso pode não constituir automaticamente um contrato aceite.",
        "p2": "A Amoda poderá:",
        "items": {
          "confirm": "Contactar você para confirmar o pedido",
          "decline": "Recusar ou cancelar um pedido por erro técnico, indisponibilidade do produto ou outros motivos razoáveis"
        }
      },
      "prices": {
        "title": "5. Informações e preços dos produtos",
        "p1": "Procuramos manter as informações e os preços corretos e atualizados.",
        "p2": "Se ocorrer algum erro (incluindo preço ou disponibilidade), a Amoda poderá:",
        "items": {
          "correct": "Corrigir as informações",
          "cancel": "Cancelar o pedido e notificar você"
        }
      },
      "paymentPickup": {
        "title": "6. Pagamento e levantamento",
        "p1": "As opções de pagamento e levantamento (incluindo pontos de levantamento) são apresentadas no checkout e podem depender da localização e disponibilidade.",
        "note": "Os termos específicos exibidos no checkout fazem parte do processo do pedido."
      },
      "restrictions": {
        "title": "7. Utilização aceitável",
        "p1": "Você concorda em utilizar a Plataforma de forma legal e a não interromper ou abusar do serviço. Em particular, você não deve:",
        "items": {
          "legal": "Utilizar a Plataforma para fins ilegais",
          "noAbuse": "Abusar ou tentar contornar medidas de segurança",
          "noAccess": "Tentar obter acesso não autorizado a sistemas ou dados",
          "noFraud": "Utilizar a Plataforma para atividades fraudulentas",
          "noInterference": "Interferir no funcionamento da Plataforma (incluindo via ferramentas automatizadas) sem permissão"
        }
      },
      "ip": {
        "title": "8. Propriedade intelectual",
        "p1": "Todo o conteúdo da Plataforma (incluindo textos, imagens, logótipos e design) pertence à Amoda ou é utilizado com direitos legais.",
        "p2": "Você não pode copiar, distribuir ou utilizar materiais da Plataforma sem autorização prévia por escrito, salvo quando permitido por lei."
      },
      "liability": {
        "title": "9. Limitação de responsabilidade",
        "p1": "A Plataforma é fornecida “tal como está”. A Amoda não se responsabiliza por:",
        "items": {
          "downtime": "Indisponibilidade temporária da Plataforma",
          "errors": "Falhas técnicas ou erros",
          "losses": "Perdas resultantes da utilização ou da impossibilidade de utilização da Plataforma"
        }
      },
      "privacy": {
        "title": "10. Privacidade",
        "p1": "O tratamento de dados pessoais é descrito na nossa",
        "privacyLinkText": "Política de Privacidade",
        "privacyUrl": "/privacy-policy"
      },
      "thirdParty": {
        "title": "11. Links de terceiros",
        "p1": "A Plataforma pode conter links para websites de terceiros. A Amoda não se responsabiliza pelo conteúdo nem pelas práticas de privacidade desses websites."
      },
      "changes": {
        "title": "12. Alterações a estes Termos",
        "p1": "A Amoda pode atualizar estes Termos a qualquer momento, publicando uma versão atualizada na Plataforma.",
        "p2": "A continuação do uso da Plataforma após as alterações significa que você aceita os Termos atualizados."
      },
      "contacts": {
        "title": "13. Contactos",
        "emailLabel": "Email: ",
        "addressLabel": "Endereço: "
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('page.title')"
      :description="t('page.subtitle')"
    />

    <UPageBody class="max-w-3xl mx-auto">
      <div class="space-y-6">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('page.effectiveDateLabel') }} <strong>{{ t('page.effectiveDateValue') }}</strong>
        </p>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.general.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.general.p1') }}
            </p>

            <p>
              {{ t('sections.general.p2') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.platform.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.platform.p1') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.platform.items.browse') }}
              </li>

              <li>
                {{ t('sections.platform.items.cart') }}
              </li>

              <li>
                {{ t('sections.platform.items.checkout') }}
              </li>

              <li>
                {{ t('sections.platform.items.pickup') }}
              </li>
            </ul>

            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('sections.platform.note') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.order.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.order.p1') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.order.items.name') }}
              </li>

              <li>
                {{ t('sections.order.items.phone') }}
              </li>

              <li>
                {{ t('sections.order.items.email') }}
              </li>

              <li>
                {{ t('sections.order.items.pickup') }}
              </li>
            </ul>

            <p>
              {{ t('sections.order.p2') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.order.items.truthful') }}
              </li>

              <li>
                {{ t('sections.order.items.ownContact') }}
              </li>
            </ul>

            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('sections.order.note') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.orderStatus.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.orderStatus.p1') }}
            </p>

            <p>
              {{ t('sections.orderStatus.p2') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.orderStatus.items.confirm') }}
              </li>

              <li>
                {{ t('sections.orderStatus.items.decline') }}
              </li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.prices.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.prices.p1') }}
            </p>

            <p>
              {{ t('sections.prices.p2') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.prices.items.correct') }}
              </li>

              <li>
                {{ t('sections.prices.items.cancel') }}
              </li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.paymentPickup.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.paymentPickup.p1') }}
            </p>

            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('sections.paymentPickup.note') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.restrictions.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.restrictions.p1') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.restrictions.items.legal') }}
              </li>

              <li>
                {{ t('sections.restrictions.items.noAbuse') }}
              </li>

              <li>
                {{ t('sections.restrictions.items.noAccess') }}
              </li>

              <li>
                {{ t('sections.restrictions.items.noFraud') }}
              </li>

              <li>
                {{ t('sections.restrictions.items.noInterference') }}
              </li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.ip.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.ip.p1') }}
            </p>

            <p>
              {{ t('sections.ip.p2') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.liability.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.liability.p1') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.liability.items.downtime') }}
              </li>

              <li>
                {{ t('sections.liability.items.errors') }}
              </li>

              <li>
                {{ t('sections.liability.items.losses') }}
              </li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.privacy.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.privacy.p1') }}
              <NuxtLink
                class="underline underline-offset-4"
                :to="t('sections.privacy.privacyUrl')"
              >
                {{ t('sections.privacy.privacyLinkText') }}
              </NuxtLink>.
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.thirdParty.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.thirdParty.p1') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.changes.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.changes.p1') }}
            </p>

            <p>
              {{ t('sections.changes.p2') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.contacts.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <ul class="list-disc pl-5 space-y-1">
              <li>
                <strong>{{ t('sections.contacts.emailLabel') }}</strong>

                <a
                  class="underline underline-offset-4"
                  :href="`mailto:${CONTACT_EMAIL}`"
                >{{ CONTACT_EMAIL }}</a>
              </li>

              <li>
                <strong>{{ t('sections.contacts.addressLabel') }}</strong>
                {{ COMPANY_ADDRESS }}
              </li>
            </ul>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>
