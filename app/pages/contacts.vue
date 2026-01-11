<script setup lang="ts">
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  COMPANY_ADDRESS,
  FACEBOOK_LINK,
} from '~/constants/contacts';


definePageMeta({ name: 'contacts' });

const { t } = useI18n();
const localeRoute = useLocaleRoute();

useHead(() => ({
  title: t('contacts.meta.title'),
  meta: [
    { name: 'description', content: t('contacts.meta.description') },
    { property: 'og:title', content: t('contacts.meta.title') },
    { property: 'og:description', content: t('contacts.meta.description') },
  ],
}));

const waLink = computed(() => {
  const digits = String(CONTACT_PHONE).replace(/[^\d]/g, '');

  return `https://wa.me/${digits}`;
});
</script>

<i18n lang="json">
{
  "pt": {
    "contacts": {
      "title": "Contactos",
      "intro": "Precisa de ajuda com uma reserva, ponto de experimentação ou trocas? Fale connosco.",
      "cards": {
        "email": {
          "title": "Email",
          "desc": "Para questões gerais e informação oficial."
        },
        "whatsapp": {
          "title": "WhatsApp",
          "desc": "Forma mais rápida para confirmar reservas e pontos de experimentação."
        },
        "facebook": {
          "title": "Facebook",
          "desc": "Novidades, coleções e contacto direto por mensagem."
        },
        "address": {
          "title": "Endereço",
          "desc": "Informação legal da empresa."
        }
      },
      "links": {
        "pickup": "Ver pontos para experimentar",
        "returns": "Política de trocas e devoluções"
      },
      "meta": {
        "title": "Contactos | Amoda",
        "description": "Contacte a Amoda: WhatsApp e Facebook para reservas e confirmação, email para informação oficial."
      }
    }
  },
  "en": {
    "contacts": {
      "title": "Contacts",
      "intro": "Need help with a reservation, try-on point, or exchanges? Contact us.",
      "cards": {
        "email": {
          "title": "Email",
          "desc": "For general inquiries and official information."
        },
        "whatsapp": {
          "title": "WhatsApp",
          "desc": "Fastest way to confirm reservations and try-on points."
        },
        "facebook": {
          "title": "Facebook",
          "desc": "Updates, collections, and direct messages."
        },
        "address": {
          "title": "Address",
          "desc": "Company legal information."
        }
      },
      "links": {
        "pickup": "See try-on points",
        "returns": "Exchange & return policy"
      },
      "meta": {
        "title": "Contacts | Amoda",
        "description": "Contact Amoda: WhatsApp and Facebook for reservations and confirmation, email for official information."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('contacts.title')"
      :description="t('contacts.intro')"
    />

    <UPageBody class="max-w-3xl mx-auto">
      <div class="space-y-4">
        <UCard>
          <template #header>
            <div class="font-semibold">
              {{ t('contacts.cards.email.title') }}
            </div>

            <div class="text-sm text-gray-600">
              {{ t('contacts.cards.email.desc') }}
            </div>
          </template>

          <a
            class="text-primary underline underline-offset-4"
            :href="`mailto:${CONTACT_EMAIL}`"
          >
            {{ CONTACT_EMAIL }}
          </a>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-semibold">
              {{ t('contacts.cards.whatsapp.title') }}
            </div>

            <div class="text-sm text-gray-600">
              {{ t('contacts.cards.whatsapp.desc') }}
            </div>
          </template>

          <a
            class="text-primary underline underline-offset-4"
            :href="waLink"
            target="_blank"
            rel="noreferrer"
          >
            +{{ CONTACT_PHONE }}
          </a>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-semibold">
              {{ t('contacts.cards.facebook.title') }}
            </div>

            <div class="text-sm text-gray-600">
              {{ t('contacts.cards.facebook.desc') }}
            </div>
          </template>

          <a
            class="text-primary underline underline-offset-4"
            :href="FACEBOOK_LINK"
            target="_blank"
            rel="noreferrer"
          >
            facebook.com/amoda.ao
          </a>
        </UCard>

        <UCard>
          <template #header>
            <div class="font-semibold">
              {{ t('contacts.cards.address.title') }}
            </div>

            <div class="text-sm text-gray-600">
              {{ t('contacts.cards.address.desc') }}
            </div>
          </template>

          <p class="text-sm text-gray-700 leading-7">
            {{ COMPANY_ADDRESS }}
          </p>
        </UCard>

        <UCard>
          <div class="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div class="text-sm text-gray-700">
              {{ t('contacts.intro') }}
            </div>

            <div class="flex gap-2 flex-wrap">
              <UButton
                :to="localeRoute({ name: 'pickup-points' })"
                variant="soft"
                icon="i-lucide-map-pin"
              >
                {{ t('contacts.links.pickup') }}
              </UButton>

              <UButton
                :to="localeRoute({ name: 'return-policy' })"
                variant="soft"
                icon="i-lucide-rotate-ccw"
              >
                {{ t('contacts.links.returns') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>
