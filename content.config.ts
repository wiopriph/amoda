import { defineCollection, defineContentConfig, z } from '@nuxt/content';


export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        // title и description даёт базовая схема type: 'page'
        cluster: z.enum(['A', 'B', 'C', 'D', 'E', 'F']),
        targetQuery: z.string(),
        publishedAt: z.date(),
        updatedAt: z.date(),
        // Обложка для карточки статьи (и /blog, и «Artigos relacionados»);
        // пусто — берётся заглушка из app/constants/blog.ts
        cover: z.string().default(''),
        author: z.string().default('manuel'),
        // Пути категорий магазина, например /category/vestidos-longos
        categories: z.array(z.string()).default([]),
        // Slugs связанных статей; пусто — подбираются по cluster
        related: z.array(z.string()).default([]),
        faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
        // Драфты видны только в dev: в prod — 404 и нет в sitemap
        draft: z.boolean().default(false),
      }),
    }),
  },
});
