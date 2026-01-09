<script setup lang="ts">
import { CONTACT_EMAIL, COMPANY_ADDRESS } from '~/constants/contacts';


definePageMeta({
  name: 'privacy-policy',
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
      "title": "Privacy Policy | Amoda"
    },
    "page": {
      "title": "Privacy Policy",
      "subtitle": "How Amoda collects and uses your personal data",
      "effectiveDateLabel": "Effective Date:",
      "effectiveDateValue": "09/01/2026"
    },
    "sections": {
      "general": {
        "title": "1. General",
        "p1": "This Privacy Policy explains what personal data Amoda collects and processes when you use our website (the “Platform”), and for what purposes.",
        "p2": "Amoda respects your privacy and processes only the data necessary to place an order and contact you about it.",
        "p3": "By using the Platform, you agree to this Privacy Policy."
      },
      "whoWeAre": {
        "title": "2. Who we are",
        "p1": "Amoda is the owner and operator of the Platform.",
        "addressLabel": "Address: ",
        "emailLabel": "Email: "
      },
      "dataWeCollect": {
        "title": "3. Personal data we collect",
        "p1": "The Platform does not require user registration.",
        "p2": "We collect personal data only during checkout in order to process your order:",
        "items": {
          "name": "Name",
          "phone": "Phone number",
          "email": "Email address"
        }
      },
      "howWeUse": {
        "title": "4. How we use your personal data",
        "p1": "We use your personal data only for the following purposes:",
        "items": {
          "order": "To process and fulfill your order",
          "contact": "To contact you about your order",
          "support": "To provide customer support",
          "legal": "To comply with applicable legal requirements when necessary"
        }
      },
      "legalBasis": {
        "title": "5. Legal basis",
        "items": {
          "contract": "Contractual necessity (to place and fulfill your order)",
          "consent": "Your consent when you voluntarily provide your data during checkout",
          "law": "Compliance with legal obligations where applicable"
        }
      },
      "sharing": {
        "title": "6. Sharing of personal data",
        "p1": "We may share personal data only in limited cases:",
        "p2": "In all cases, we share only the minimum data required for the specific purpose.",
        "items": {
          "law": "When required by law",
          "delivery": "When necessary to fulfill an order (for example, with delivery providers if applicable)"
        }
      },
      "storage": {
        "title": "7. Data retention",
        "p1": "We store personal data for as long as necessary to fulfill your order.",
        "p2": "We may retain data longer if required by applicable law. After that, data is deleted or anonymized."
      },
      "security": {
        "title": "8. Data security",
        "p1": "We apply reasonable technical and organizational measures to protect personal data from loss, unauthorized access, alteration, or disclosure.",
        "p2": "Access to personal data is limited to those who need it to operate the Platform and fulfill orders."
      },
      "rights": {
        "title": "9. Your rights",
        "p1": "You may have the right to:",
        "p2": "To exercise your rights, contact us at",
        "items": {
          "access": "Request information about the personal data we hold about you",
          "correct": "Request correction of inaccurate data",
          "delete": "Request deletion of your data (where applicable)",
          "withdraw": "Withdraw your consent (where processing is based on consent)"
        }
      },
      "minors": {
        "title": "10. Minors",
        "p1": "The Platform is not intended for minors.",
        "p2": "If you believe we have received personal data from a minor, please contact us and we will take steps to delete it."
      },
      "thirdPartyLinks": {
        "title": "11. Third-party links",
        "p1": "The Platform may contain links to third-party websites. We are not responsible for their content or privacy practices."
      },
      "changes": {
        "title": "12. Changes to this Privacy Policy",
        "p1": "We may update this Privacy Policy from time to time.",
        "p2": "The updated version becomes effective when published on the Platform."
      }
    }
  },
  "pt": {
    "meta": {
      "title": "Política de Privacidade | Amoda"
    },
    "page": {
      "title": "Política de Privacidade",
      "subtitle": "Como a Amoda recolhe e utiliza os seus dados pessoais",
      "effectiveDateLabel": "Data de entrada em vigor:",
      "effectiveDateValue": "09/01/2026"
    },
    "sections": {
      "general": {
        "title": "1. Disposições gerais",
        "p1": "Esta Política de Privacidade explica quais dados pessoais a Amoda recolhe e trata quando você utiliza o nosso website (a “Plataforma”) e para quais finalidades.",
        "p2": "A Amoda respeita a sua privacidade e trata apenas os dados necessários para realizar um pedido e entrar em contacto consigo sobre esse pedido.",
        "p3": "Ao utilizar a Plataforma, você concorda com esta Política de Privacidade."
      },
      "whoWeAre": {
        "title": "2. Quem somos",
        "p1": "A Amoda é a proprietária e operadora da Plataforma.",
        "addressLabel": "Endereço: ",
        "emailLabel": "Email: "
      },
      "dataWeCollect": {
        "title": "3. Dados pessoais que recolhemos",
        "p1": "A Plataforma não exige registo de utilizadores.",
        "p2": "Recolhemos dados pessoais apenas no momento do checkout para processar o seu pedido:",
        "items": {
          "name": "Nome",
          "phone": "Número de telefone",
          "email": "Endereço de email"
        }
      },
      "howWeUse": {
        "title": "4. Como utilizamos os seus dados pessoais",
        "p1": "Utilizamos os seus dados pessoais apenas para as seguintes finalidades:",
        "items": {
          "order": "Processar e cumprir o seu pedido",
          "contact": "Entrar em contacto consigo sobre o seu pedido",
          "support": "Prestar apoio ao cliente",
          "legal": "Cumprir requisitos legais aplicáveis quando necessário"
        }
      },
      "legalBasis": {
        "title": "5. Bases legais",
        "items": {
          "contract": "Necessidade contratual (para efetuar e cumprir o seu pedido)",
          "consent": "O seu consentimento quando fornece voluntariamente os dados no checkout",
          "law": "Cumprimento de obrigações legais quando aplicável"
        }
      },
      "sharing": {
        "title": "6. Partilha de dados pessoais",
        "p1": "Podemos partilhar dados pessoais apenas em casos limitados:",
        "p2": "Em todos os casos, partilhamos apenas os dados mínimos necessários para a finalidade específica.",
        "items": {
          "law": "Quando exigido por lei",
          "delivery": "Quando necessário para cumprir um pedido (por exemplo, com prestadores de entrega, se aplicável)"
        }
      },
      "storage": {
        "title": "7. Retenção de dados",
        "p1": "Guardamos os dados pessoais pelo tempo necessário para cumprir o seu pedido.",
        "p2": "Podemos reter dados por mais tempo se exigido por lei aplicável. Depois disso, os dados são eliminados ou anonimizados."
      },
      "security": {
        "title": "8. Segurança dos dados",
        "p1": "Aplicamos medidas técnicas e organizacionais razoáveis para proteger os dados pessoais contra perda, acesso não autorizado, alteração ou divulgação.",
        "p2": "O acesso aos dados pessoais é limitado a quem necessita deles para operar a Plataforma e cumprir pedidos."
      },
      "rights": {
        "title": "9. Os seus direitos",
        "p1": "Você pode ter o direito de:",
        "p2": "Para exercer os seus direitos, contacte-nos em",
        "items": {
          "access": "Solicitar informações sobre os dados pessoais que mantemos sobre você",
          "correct": "Solicitar a correção de dados incorretos",
          "delete": "Solicitar a eliminação dos seus dados (quando aplicável)",
          "withdraw": "Retirar o seu consentimento (quando o tratamento se baseia no consentimento)"
        }
      },
      "minors": {
        "title": "10. Menores",
        "p1": "A Plataforma não se destina a menores.",
        "p2": "Se você acredita que recebemos dados pessoais de um menor, por favor contacte-nos e tomaremos medidas para os eliminar."
      },
      "thirdPartyLinks": {
        "title": "11. Links de terceiros",
        "p1": "A Plataforma pode conter links para websites de terceiros. Não nos responsabilizamos pelo conteúdo nem pelas práticas de privacidade desses websites."
      },
      "changes": {
        "title": "12. Alterações a esta Política de Privacidade",
        "p1": "Podemos atualizar esta Política de Privacidade periodicamente.",
        "p2": "A versão atualizada entra em vigor quando publicada na Plataforma."
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

            <p>
              {{ t('sections.general.p3') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.whoWeAre.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.whoWeAre.p1') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                <strong>{{ t('sections.whoWeAre.addressLabel') }}</strong>
                {{ COMPANY_ADDRESS }}
              </li>

              <li>
                <strong>{{ t('sections.whoWeAre.emailLabel') }}</strong>

                <a
                  class="underline underline-offset-4"
                  :href="`mailto:${CONTACT_EMAIL}`"
                >{{ CONTACT_EMAIL }}</a>
              </li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.dataWeCollect.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.dataWeCollect.p1') }}
            </p>

            <p>
              {{ t('sections.dataWeCollect.p2') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.dataWeCollect.items.name') }}
              </li>

              <li>
                {{ t('sections.dataWeCollect.items.phone') }}
              </li>

              <li>
                {{ t('sections.dataWeCollect.items.email') }}
              </li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.howWeUse.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.howWeUse.p1') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.howWeUse.items.order') }}
              </li>

              <li>
                {{ t('sections.howWeUse.items.contact') }}
              </li>

              <li>
                {{ t('sections.howWeUse.items.support') }}
              </li>

              <li>
                {{ t('sections.howWeUse.items.legal') }}
              </li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.legalBasis.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.legalBasis.items.contract') }}
              </li>

              <li>
                {{ t('sections.legalBasis.items.consent') }}
              </li>

              <li>
                {{ t('sections.legalBasis.items.law') }}
              </li>
            </ul>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.sharing.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.sharing.p1') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.sharing.items.law') }}
              </li>

              <li>
                {{ t('sections.sharing.items.delivery') }}
              </li>
            </ul>

            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('sections.sharing.p2') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.storage.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.storage.p1') }}
            </p>

            <p>
              {{ t('sections.storage.p2') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.security.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.security.p1') }}
            </p>

            <p>
              {{ t('sections.security.p2') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.rights.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.rights.p1') }}
            </p>

            <ul class="list-disc pl-5 space-y-1">
              <li>
                {{ t('sections.rights.items.access') }}
              </li>

              <li>
                {{ t('sections.rights.items.correct') }}
              </li>

              <li>
                {{ t('sections.rights.items.delete') }}
              </li>

              <li>
                {{ t('sections.rights.items.withdraw') }}
              </li>
            </ul>

            <p>
              {{ t('sections.rights.p2') }}
              <a
                class="underline underline-offset-4"
                :href="`mailto:${CONTACT_EMAIL}`"
              >{{ CONTACT_EMAIL }}</a>.
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.minors.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.minors.p1') }}
            </p>

            <p>
              {{ t('sections.minors.p2') }}
            </p>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold">
              {{ t('sections.thirdPartyLinks.title') }}
            </h2>
          </template>

          <div class="space-y-3 leading-7">
            <p>
              {{ t('sections.thirdPartyLinks.p1') }}
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
      </div>
    </UPageBody>
  </UPage>
</template>
