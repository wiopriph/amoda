<script setup lang="ts">
import { CONTACT_EMAIL, CONTACT_PHONE, COMPANY_ADDRESS } from '~/constants/contacts';


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
      "intro": "Precisa de ajuda com um pedido, ponto de levantamento ou devolução? Fale connosco.",
      "cards": {
        "email": { "title": "Email", "desc": "O canal mais rápido para suporte." },
        "whatsapp": { "title": "WhatsApp", "desc": "Mensagens rápidas sobre pedidos e levantamentos." },
        "address": { "title": "Endereço", "desc": "Informação legal da empresa." }
      },
      "links": {
        "pickup": "Ver pontos de levantamento",
        "returns": "Política de devoluções"
      },
      "meta": {
        "title": "Contactos | Amoda",
        "description": "Contacte a Amoda: email, WhatsApp e informações legais."
      }
    }
  },
  "en": {
    "contacts": {
      "title": "Contacts",
      "intro": "Need help with an order, pickup point, or returns? Contact us.",
      "cards": {
        "email": { "title": "Email", "desc": "The fastest support channel." },
        "whatsapp": { "title": "WhatsApp", "desc": "Quick messages about orders and pickup." },
        "address": { "title": "Address", "desc": "Company legal information." }
      },
      "links": {
        "pickup": "See pickup points",
        "returns": "Return policy"
      },
      "meta": {
        "title": "Contacts | Amoda",
        "description": "Contact Amoda: email, WhatsApp and legal information."
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
