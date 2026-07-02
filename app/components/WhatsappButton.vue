<script setup lang="ts">
type WhatsappButtonProps = {
  to: string
  ariaLabel?: string
  // Lifts the button above a fixed bottom CTA bar on mobile
  raised?: boolean
};

withDefaults(defineProps<WhatsappButtonProps>(), {
  ariaLabel: 'WhatsApp support',
  raised: false,
});
</script>

<template>
  <UButton
    :to="to"
    :aria-label="ariaLabel"
    :ui="{ leadingIcon: 'size-7' }"
    :class="[
      'fixed right-4 z-50',
      raised ? 'bottom-32 sm:bottom-4' : 'bottom-4',
      'size-14 justify-center rounded-full',
      'bg-[#25D366] text-white',
      'shadow-lg transition',
      'hover:scale-105 hover:bg-[#1ebe5d] hover:shadow-xl',
    ]"
    target="_blank"
    icon="i-simple-icons-whatsapp"
  />
</template>
