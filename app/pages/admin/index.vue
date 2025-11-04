<script setup lang="ts">
definePageMeta({ name: 'admin', layout: 'admin', middleware: 'admin' });
</script>

<template>
  <UPage>
    <UPageHeader
      title="Admin Dashboard"
      description="Manage brands, categories and products"
    />

    <UPageBody>
      <UCard>
        Welcome to the admin panel.
      </UCard>
    </UPageBody>
  </UPage>
</template>
