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
      // Organization/WebSite/ClothingStore связаны через @id:
      // Organization даёт логотип в выдаче, SearchAction — sitelinks searchbox
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://amoda.ao/#organization',
            name: 'Amoda',
            url: 'https://amoda.ao',
            logo: {
              '@type': 'ImageObject',
              url: 'https://amoda.ao/logo.webp',
            },
            sameAs: [INSTAGRAM_LINK, FACEBOOK_LINK, TIKTOK_LINK],
          },
          {
            '@type': 'WebSite',
            '@id': 'https://amoda.ao/#website',
            name: 'Amoda',
            url: 'https://amoda.ao',
            publisher: { '@id': 'https://amoda.ao/#organization' },
            inLanguage: 'pt-AO',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://amoda.ao/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'ClothingStore',
            '@id': 'https://amoda.ao/#store',
            name: 'Amoda',
            url: 'https://amoda.ao',
            image: 'https://amoda.ao/logo.webp',
            parentOrganization: { '@id': 'https://amoda.ao/#organization' },
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
          },
        ],
      }),
    },
  ],
});
</script>

<template>
  <NuxtLayout />
</template>
