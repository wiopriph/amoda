<script setup lang="ts">
type Props = {
  to: string
  ariaLabel?: string
};

withDefaults(defineProps<Props>(), {
  ariaLabel: 'WhatsApp support',
});
</script>

<template>
  <UButton
    :to="to"
    target="_blank"
    :aria-label="ariaLabel"
    icon="i-simple-icons-whatsapp"
    class="
      fixed bottom-4 right-4 z-50
      size-14 justify-center rounded-full
      bg-[#25D366] text-white
      shadow-lg transition
      hover:scale-105 hover:bg-[#1ebe5d] hover:shadow-xl
    "
    :ui="{
      leadingIcon: 'size-7'
    }"
  />
</template>
