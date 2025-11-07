export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

  ui: {
    colorMode: false,
  },

  i18n: {
    locales: [
      {
        code: 'pt',
        language: 'pt-AO',
        name: 'Português',
        flag: '🇦🇴',
      },
      {
        code: 'en',
        language: 'en',
        name: 'English',
        flag: '🇬🇧',
      },
    ],
    baseUrl: 'https://moda.ao',
    defaultLocale: 'pt',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
  },

  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/supabase',
  ],

  runtimeConfig: {
    supabase: {
      serviceKey: process.env.NUXT_SUPABASE_SERVICE_KEY,
    },
    public: {
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
      },
    },
  },

  supabase: {
    redirect: false,
  },
});
