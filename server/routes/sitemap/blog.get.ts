import { defineSitemapEventHandler } from '#imports';
import { queryCollection } from '@nuxt/content/server';


export default defineSitemapEventHandler(async (event) => {
  const articles = await queryCollection(event, 'blog')
    .where('draft', '=', false)
    .select('path', 'updatedAt', 'publishedAt')
    .all();

  return articles.map((article) => {
    const lastmod = article.updatedAt || article.publishedAt;

    return {
      loc: article.path,
      lastmod: lastmod ? new Date(lastmod).toISOString() : undefined,
      changefreq: 'monthly' as const,
      priority: 0.5,
    };
  });
});
