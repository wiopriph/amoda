export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],

  devtools: {
    enabled: process.env.NODE_ENV !== 'production',
  },

  features: {
    inlineStyles: true,
  },

  i18n: {
    baseUrl: 'https://amoda.ao',
    defaultLocale: 'pt',
    detectBrowserLanguage: false,
    locales: [
      {
        code: 'pt',
        language: 'pt-AO',
        name: 'Português',
      },
      {
        code: 'en',
        language: 'en',
        name: 'English',
      },
    ],
    strategy: 'prefix_except_default',
  },

  modules: [
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/supabase',
    '@nuxtjs/sitemap',
  ],

  nitro: {
    routeRules: {
      // Cache-Control для NuxtImg
      '/_ipx/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      },
    },
  },

  runtimeConfig: {
    supabase: {
      serviceKey: process.env.NUXT_SUPABASE_SERVICE_KEY,
    },
    public: {
      gtmId: '',
      gtmEnabled: false,

      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
      },
    },
  },

  sitemap: {
    cacheMaxAgeSeconds: 86400,
    exclude: ['/admin/**', '/auth', '/cart', '/checkout', '/order/**'],
    sitemapName: 'sitemap.xml',

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

    xsl: false,
  },

  supabase: {
    redirect: false,
  },

  ui: {
    colorMode: false,
  },
});
