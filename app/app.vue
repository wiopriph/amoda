<script setup lang="ts">
import {
  COMPANY_ADDRESS_MAP_LINK,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  FACEBOOK_LINK,
  INSTAGRAM_LINK,
  TIKTOK_LINK,
} from '~/constants/contacts';


useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ClothingStore',
        name: 'Amoda',
        url: 'https://amoda.ao',
        logo: 'https://amoda.ao/logo.webp',
        image: 'https://amoda.ao/logo.webp',
        telephone: `+${CONTACT_PHONE}`,
        email: CONTACT_EMAIL,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Av. Murtala Mohammed (ao lado do hotel Ilhamar)',
          addressLocality: 'Luanda',
          addressCountry: 'AO',
        },
        hasMap: COMPANY_ADDRESS_MAP_LINK,
        priceRange: '$$',
        currenciesAccepted: 'AOA',
        paymentAccepted: 'Cash, Mobile Payment',
        sameAs: [INSTAGRAM_LINK, FACEBOOK_LINK, TIKTOK_LINK],
      }),
    },
  ],
});
</script>

<template>
  <NuxtLayout />
</template>
