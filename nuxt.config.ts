const image = 'https://amoda.ao/logo.webp';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: {
        lang: 'pt-AO',
      },

      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon-new.ico' },

        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon-64x64.png' },
        { rel: 'icon', type: 'image/png', sizes: '128x128', href: '/favicon-128x128.png' },
        { rel: 'icon', type: 'image/png', sizes: '256x256', href: '/favicon-256x256.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/favicon-512x512.png' },

        { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-touch-icon-57x57.png' },
        { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-touch-icon-114x114.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-touch-icon-120x120.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],

      meta: [
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Amoda' },
        { property: 'og:locale', content: 'pt_AO' },
        { property: 'og:image', content: image },
        { property: 'og:image:secure_url', content: image },
        { property: 'og:image:width', content: '2048' },
        { property: 'og:image:height', content: '2048' },
        { property: 'og:image:type', content: 'image/webp' },
        { property: 'og:image:alt', content: 'Amoda - moda feminina em Luanda' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: image },
        { name: 'twitter:image:alt', content: 'Amoda - moda feminina em Luanda' },
        { name: 'application-name', content: 'Amoda' },
        { name: 'apple-mobile-web-app-title', content: 'Amoda' },
        { name: 'theme-color', content: '#f6339a' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  devtools: {
    enabled: process.env.NODE_ENV !== 'production',
  },

  features: {
    inlineStyles: true,
  },

  modules: [
    '@nuxt/image',
    '@nuxt/ui',
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
    moyskladToken: process.env.MOYSKLAD_TOKEN,
    supabase: {
      serviceKey: process.env.NUXT_SUPABASE_SERVICE_KEY,
    },
    public: {
      gtmId: '',
      gtmEnabled: false,

      clarityId: '',

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
        include: ['/', '/delivery', '/pickup-points', '/return-policy', '/privacy-policy', '/terms-of-use', '/contacts'],
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

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },
});
