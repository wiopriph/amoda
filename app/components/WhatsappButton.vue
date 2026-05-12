<script setup lang="ts">
type WhatsappButtonProps = {
  to: string
  ariaLabel?: string
};

withDefaults(defineProps<WhatsappButtonProps>(), {
  ariaLabel: 'WhatsApp support',
});
</script>

<template>
  <UButton
    :to="to"
    :aria-label="ariaLabel"
    :ui="{ leadingIcon: 'size-7' }"
    :class="[
      'fixed bottom-4 right-4 z-50',
      'size-14 justify-center rounded-full',
      'bg-[#25D366] text-white',
      'shadow-lg transition',
      'hover:scale-105 hover:bg-[#1ebe5d] hover:shadow-xl',
    ]"
    target="_blank"
    icon="i-simple-icons-whatsapp"
  />
</template>
