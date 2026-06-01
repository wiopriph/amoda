<script setup lang="ts">
import { INSTAGRAM_LINK, TIKTOK_LINK } from '~/constants/contacts';


const currentYear = new Date().getFullYear();

const footerLinks = [
  {
    label: 'Como comprar',
    to: { name: 'delivery' },
  },
  {
    label: 'Pontos de levantamento',
    to: { name: 'pickup-points' },
  },
  {
    label: 'Devoluções',
    to: { name: 'return-policy' },
  },
  {
    label: 'Privacidade',
    to: { name: 'privacy-policy' },
  },
  {
    label: 'Termos',
    to: { name: 'terms-of-use' },
  },
  {
    label: 'Contactos',
    to: { name: 'contacts' },
  },
] as const;

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => 'Olá! Quero falar com a Amoda.');

const socialLinks = computed(() => [
  {
    label: 'TikTok',
    icon: 'i-simple-icons-tiktok',
    to: TIKTOK_LINK,
  },
  {
    label: 'Instagram',
    icon: 'i-simple-icons-instagram',
    to: INSTAGRAM_LINK,
  },
  {
    label: 'WhatsApp',
    icon: 'i-simple-icons-whatsapp',
    to: whatsappHref.value,
  },
]);
</script>

<template>
  <footer class="border-t border-gray-100 bg-white">
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <NuxtLink
            :to="{ name: 'index' }"
            aria-label="Amoda"
            class="inline-flex transition hover:opacity-70"
          >
            <NuxtImg
              src="/logo.svg"
              alt="Amoda"
              class="h-8 w-auto"
            />
          </NuxtLink>

          <nav class="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm sm:gap-x-6">
            <NuxtLink
              v-for="footerLink in footerLinks"
              :key="footerLink.label"
              :to="footerLink.to"
              class="text-muted transition hover:text-primary"
            >
              {{ footerLink.label }}
            </NuxtLink>
          </nav>
        </div>

        <div class="md:text-right">
          <h2 class="text-sm font-bold text-highlighted">
            Redes sociais
          </h2>

          <div class="mt-3 flex items-center gap-2 md:justify-end">
            <UButton
              v-for="socialLink in socialLinks"
              :key="socialLink.label"
              :to="socialLink.to"
              :aria-label="socialLink.label"
              :icon="socialLink.icon"
              color="neutral"
              variant="outline"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
              class="size-10 justify-center rounded-xl text-toned hover:border-primary/40 hover:text-primary"
            />
          </div>
        </div>
      </div>

      <div class="mt-8 border-t border-gray-100 pt-4">
        <p class="text-xs text-muted">
          © {{ currentYear }} Amoda. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
