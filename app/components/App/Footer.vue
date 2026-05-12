<script setup lang="ts">
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
</script>

<template>
  <footer class="border-t border-gray-100 bg-white">
    <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav class="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm sm:gap-x-6">
        <NuxtLink
          v-for="footerLink in footerLinks"
          :key="footerLink.label"
          :to="footerLink.to"
          class="text-muted transition hover:text-primary"
        >
          {{ footerLink.label }}
        </NuxtLink>
      </nav>

      <div class="mt-6 flex flex-col items-center gap-3 border-t pt-4 sm:flex-row sm:justify-between">
        <p class="text-center text-xs text-muted sm:text-left">
          © {{ currentYear }} Amoda. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>
