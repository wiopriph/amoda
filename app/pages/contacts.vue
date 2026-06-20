<script setup lang="ts">
import {
  COMPANY_ADDRESS,
  COMPANY_ADDRESS_MAP_LINK,
  CONTACT_EMAIL,
  FACEBOOK_LINK,
  TIKTOK_LINK,
} from '~/constants/contacts';


definePageMeta({ name: 'contacts' });

const title = 'Contactos da Amoda | WhatsApp, escolhas e pontos em Luanda';
const description = 'Fale com a Amoda pelo WhatsApp para escolhas, tamanhos e pontos de experimentação em Luanda. Veja também TikTok, Facebook, email e endereço.';

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ],
  link: [
    { rel: 'canonical', href: 'https://amoda.ao/contacts' },
  ],
}));

const { makeWhatsappHref } = useWhatsappLink();
const waLink = makeWhatsappHref(() => 'Olá! Preciso de ajuda com uma escolha na Amoda.');
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8"
      >
        <UBadge
          color="primary"
          variant="soft"
          class="mb-4"
        >
          Atendimento rápido
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          Como podemos ajudar?
        </h1>

        <p class="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Fale connosco para confirmar escolhas, tirar dúvidas ou encontrar o ponto de experimentação mais próximo.
        </p>

        <div class="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <UButton
            :to="{ name: 'pickup-points' }"
            size="xl"
            color="primary"
            variant="soft"
            icon="i-lucide-map-pin"
          >
            Ver pontos
          </UButton>
        </div>
      </section>

      <section class="mt-5 grid gap-4 sm:mt-6 md:grid-cols-2">
        <UCard class="border-green-200 bg-green-50/60">
          <div class="flex h-full flex-col gap-4">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-simple-icons-whatsapp"
                class="size-4 text-green-600"
              />

              <h2 class="text-lg font-bold text-highlighted">
                WhatsApp
              </h2>
            </div>

            <p class="text-sm text-muted">
              Melhor opção para confirmar escolhas, tamanhos e pontos de experimentação.
            </p>

            <UButton
              :to="waLink"
              target="_blank"
              color="success"
              size="lg"
              class="mt-auto w-full justify-center sm:w-fit"
            >
              Abrir WhatsApp
            </UButton>
          </div>
        </UCard>

        <UCard class="border-pink-200 bg-pink-50/60">
          <div class="flex h-full flex-col gap-4">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-simple-icons-tiktok"
                class="size-4 text-pink-600"
              />

              <h2 class="text-lg font-bold text-highlighted">
                TikTok
              </h2>
            </div>

            <p class="text-sm text-muted">
              Veja looks, novidades e inspirações da Amoda.
            </p>

            <UButton
              :to="TIKTOK_LINK"
              target="_blank"
              color="primary"
              size="lg"
              class="mt-auto w-full justify-center sm:w-fit"
            >
              Seguir no TikTok
            </UButton>
          </div>
        </UCard>

        <UCard class="border-blue-200 bg-blue-50/60">
          <div class="flex h-full flex-col gap-4">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-simple-icons-facebook"
                class="size-4 text-blue-600"
              />

              <h2 class="text-lg font-bold text-highlighted">
                Facebook
              </h2>
            </div>

            <p class="text-sm text-muted">
              Novidades, coleções e mensagens diretas.
            </p>

            <UButton
              :to="FACEBOOK_LINK"
              target="_blank"
              color="info"
              size="lg"
              class="mt-auto w-full justify-center sm:w-fit"
            >
              Abrir Facebook
            </UButton>
          </div>
        </UCard>

        <UCard>
          <div class="flex h-full flex-col gap-4">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-mail"
                class="size-4 text-gray-600"
              />

              <h2 class="text-lg font-bold text-highlighted">
                Email
              </h2>
            </div>

            <p class="text-sm text-muted">
              Para questões gerais e informação oficial.
            </p>

            <UButton
              :to="`mailto:${CONTACT_EMAIL}`"
              color="neutral"
              variant="soft"
              size="lg"
              class="mt-auto w-full justify-center sm:w-fit"
            >
              Enviar email
            </UButton>
          </div>
        </UCard>
      </section>

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
                  Endereço
                </h2>
              </div>

              <p class="text-sm text-muted">
                Informação legal da empresa.
              </p>

              <p
                class="mt-3 text-sm leading-7 text-toned"
                v-text="COMPANY_ADDRESS"
              />
            </div>

            <UButton
              :to="COMPANY_ADDRESS_MAP_LINK"
              target="_blank"
              color="primary"
              variant="solid"
              size="lg"
              class="w-full justify-center sm:w-auto"
            >
              Abrir no Google Maps
            </UButton>
          </div>
        </UCard>
      </section>
    </UPageBody>
  </UPage>
</template>
