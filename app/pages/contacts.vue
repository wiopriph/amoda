<script setup lang="ts">
import {
  CONTACT_EMAIL,
  COMPANY_ADDRESS,
  COMPANY_ADDRESS_MAP_LINK,
  FACEBOOK_LINK,
  TIKTOK_LINK,
} from '~/constants/contacts';


definePageMeta({ name: 'contacts' });

const { t } = useI18n();
const localeRoute = useLocaleRoute();
const { makeWhatsappHref } = useWhatsappLink();

useHead(() => ({
  title: t('contacts.meta.title'),
  meta: [
    { name: 'description', content: t('contacts.meta.description') },
    { property: 'og:title', content: t('contacts.meta.title') },
    { property: 'og:description', content: t('contacts.meta.description') },
  ],
}));

const waLink = makeWhatsappHref(() => t('contacts.whatsappMessage'));

const emailLink = computed(() => `mailto:${CONTACT_EMAIL}`);
</script>

<i18n lang="json">
{
  "pt": {
    "contacts": {
      "title": "Como podemos ajudar?",
      "intro": "Fale connosco para confirmar reservas, tirar dúvidas ou encontrar o ponto de experimentação mais próximo.",
      "whatsappMessage": "Olá! Preciso de ajuda com uma reserva na Amoda.",
      "hero": {
        "badge": "Atendimento rápido",
        "secondary": "Ver pontos"
      },
      "cards": {
        "whatsapp": {
          "title": "WhatsApp",
          "desc": "Melhor opção para confirmar reservas, tamanhos e pontos de experimentação.",
          "cta": "Abrir WhatsApp"
        },
        "tiktok": {
          "title": "TikTok",
          "desc": "Veja looks, novidades e inspirações da Amoda.",
          "cta": "Seguir no TikTok"
        },
        "facebook": {
          "title": "Facebook",
          "desc": "Novidades, coleções e mensagens diretas.",
          "cta": "Abrir Facebook"
        },
        "email": {
          "title": "Email",
          "desc": "Para questões gerais e informação oficial.",
          "cta": "Enviar email"
        },
        "address": {
          "title": "Endereço",
          "desc": "Informação legal da empresa.",
          "mapCta": "Abrir no Google Maps"
        }
      },
      "links": {
        "pickup": "Pontos para experimentar",
        "returns": "Trocas e devoluções"
      },
      "meta": {
        "title": "Contactos da Amoda {'|'} WhatsApp, reservas e pontos em Luanda",
        "description": "Fale com a Amoda pelo WhatsApp para reservas, tamanhos e pontos de experimentação em Luanda. Veja também TikTok, Facebook, email e endereço."
      }
    }
  },
  "en": {
    "contacts": {
      "title": "How can we help?",
      "intro": "Contact us to confirm reservations, ask questions, or find the nearest try-on point.",
      "whatsappMessage": "Hello! I need help with a reservation at Amoda.",
      "hero": {
        "badge": "Fast support",
        "secondary": "See points"
      },
      "cards": {
        "whatsapp": {
          "title": "WhatsApp",
          "desc": "Best option to confirm reservations, sizes and try-on points.",
          "cta": "Open WhatsApp"
        },
        "tiktok": {
          "title": "TikTok",
          "desc": "See looks, new arrivals and Amoda inspiration.",
          "cta": "Open TikTok"
        },
        "facebook": {
          "title": "Facebook",
          "desc": "Updates, collections and direct messages.",
          "cta": "Open Facebook"
        },
        "email": {
          "title": "Email",
          "desc": "For general inquiries and official information.",
          "cta": "Send email"
        },
        "address": {
          "title": "Address",
          "desc": "Company legal information.",
          "mapCta": "Open in Google Maps"
        }
      },
      "links": {
        "pickup": "Try-on points",
        "returns": "Exchange & return policy"
      },
      "meta": {
        "title": "Amoda contacts {'|'} WhatsApp, reservations and Luanda points",
        "description": "Contact Amoda on WhatsApp for reservations, sizes and try-on points in Luanda. Find TikTok, Facebook, email and address details too."
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl sm:px-6 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          {{ t('contacts.hero.badge') }}
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          {{ t('contacts.title') }}
        </h1>

        <p class="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          {{ t('contacts.intro') }}
        </p>

        <div class="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <UButton
            size="xl"
            color="primary"
            variant="soft"
            icon="i-lucide-map-pin"
            :to="localeRoute({ name: 'pickup-points' })"
          >
            {{ t('contacts.hero.secondary') }}
          </UButton>
        </div>
      </section>

      <!-- CONTACTS -->
      <section class="mt-5 grid gap-4 sm:mt-6 md:grid-cols-2">
        <!-- WhatsApp -->
        <UCard class="border-green-200 bg-green-50/60">
          <div class="flex h-full flex-col gap-4">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-simple-icons-whatsapp"
                class="size-4 text-green-600"
              />

              <h2 class="text-lg font-bold text-highlighted">
                {{ t('contacts.cards.whatsapp.title') }}
              </h2>
            </div>

            <p class="text-sm text-muted">
              {{ t('contacts.cards.whatsapp.desc') }}
            </p>

            <UButton
              :to="waLink"
              target="_blank"
              color="success"
              size="lg"
              class="mt-auto w-full justify-center sm:w-fit"
            >
              {{ t('contacts.cards.whatsapp.cta') }}
            </UButton>
          </div>
        </UCard>

        <!-- TikTok -->
        <UCard class="border-pink-200 bg-pink-50/60">
          <div class="flex h-full flex-col gap-4">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-simple-icons-tiktok"
                class="size-4 text-pink-600"
              />

              <h2 class="text-lg font-bold text-highlighted">
                {{ t('contacts.cards.tiktok.title') }}
              </h2>
            </div>

            <p class="text-sm text-muted">
              {{ t('contacts.cards.tiktok.desc') }}
            </p>

            <UButton
              :to="TIKTOK_LINK"
              target="_blank"
              color="primary"
              size="lg"
              class="mt-auto w-full justify-center sm:w-fit"
            >
              {{ t('contacts.cards.tiktok.cta') }}
            </UButton>
          </div>
        </UCard>

        <!-- Facebook -->
        <UCard>
          <div class="flex h-full flex-col gap-4">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-simple-icons-facebook"
                class="size-4 text-blue-600"
              />

              <h2 class="text-lg font-bold text-highlighted">
                {{ t('contacts.cards.facebook.title') }}
              </h2>
            </div>

            <p class="text-sm text-muted">
              {{ t('contacts.cards.facebook.desc') }}
            </p>

            <UButton
              :to="FACEBOOK_LINK"
              target="_blank"
              color="neutral"
              variant="soft"
              size="lg"
              class="mt-auto w-full justify-center sm:w-fit"
            >
              {{ t('contacts.cards.facebook.cta') }}
            </UButton>
          </div>
        </UCard>

        <!-- Email -->
        <UCard>
          <div class="flex h-full flex-col gap-4">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-mail"
                class="size-4 text-gray-600"
              />

              <h2 class="text-lg font-bold text-highlighted">
                {{ t('contacts.cards.email.title') }}
              </h2>
            </div>

            <p class="text-sm text-muted">
              {{ t('contacts.cards.email.desc') }}
            </p>

            <UButton
              :to="emailLink"
              color="neutral"
              variant="soft"
              size="lg"
              class="mt-auto w-full justify-center sm:w-fit"
            >
              {{ t('contacts.cards.email.cta') }}
            </UButton>
          </div>
        </UCard>
      </section>

      <!-- ADDRESS -->
      <section class="mt-5 sm:mt-6">
        <UCard>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-map-pin"
                  class="size-4 text-primary"
                />

                <h2 class="text-lg font-bold text-highlighted">
                  {{ t('contacts.cards.address.title') }}
                </h2>
              </div>

              <p class="text-sm text-muted">
                {{ t('contacts.cards.address.desc') }}
              </p>

              <p class="mt-3 text-sm leading-7 text-toned">
                {{ COMPANY_ADDRESS }}
              </p>
            </div>

            <UButton
              :to="COMPANY_ADDRESS_MAP_LINK"
              target="_blank"
              color="primary"
              variant="solid"
              size="lg"
              class="w-full justify-center sm:w-auto"
            >
              {{ t('contacts.cards.address.mapCta') }}
            </UButton>
          </div>
        </UCard>
      </section>
    </UPageBody>
  </UPage>
</template>
