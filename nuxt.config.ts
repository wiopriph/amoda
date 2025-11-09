export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],

  devtools: { enabled: true },

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
    '@nuxtjs/sitemap',
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

  sitemap: {
    xsl: false,
    cacheMaxAgeSeconds: 86400,
    sitemapName: 'sitemap.xml',

    exclude: ['/admin/**', '/auth', '/cart', '/checkout', '/order/**'],

    sitemaps: {
      pages: {
        includeAppSources: true,
        include: ['/', '/contacts', '/delivery'],
      },

      categories: {
        includeAppSources: false,
        sources: ['/sitemap/categories'],
      },

      products: {
        includeAppSources: false,
        sources: ['/sitemap/products'],
      },
    },
  },

  supabase: {
    redirect: false,
  },

  ui: {
    colorMode: false,
  },
});
