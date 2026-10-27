import type { H3Event } from 'h3';
import { queryCollection } from '@nuxt/content/server';
import { serverSupabaseClient } from '#supabase/server';


const SITE_URL = 'https://amoda.ao';

type CategoryRow = {
  name: string;
  slug: string;
  'parent_id': number | null;
};

type ArticleRow = {
  path: string;
  title: string;
  description: string;
};

const intro = `# Amoda

> Loja online de roupa feminina em Luanda, Angola. Escolhes as peças no site, recebes sem pagamento antecipado, experimentas com calma e pagas só o que gostares - em dinheiro ou TPA, na entrega. Se não gostares, devolves sem custo.

- Idioma do site: português (pt-AO). Preços em kwanzas (AOA).
- Não há pagamento online: o pedido é confirmado por telefone ou WhatsApp e pago na entrega.
- Entrega em Luanda no horário combinado ou levantamento no showroom; envio para as províncias.
- Cada produto tem página própria em ${SITE_URL}/product/<slug> com fotos, tamanhos, cores e preço.

## Páginas principais

- [Catálogo completo](${SITE_URL}/products): todos os produtos, com filtros por categoria, tamanho, cor e preço
- [Pesquisa](${SITE_URL}/search?q=vestido): pesquisa por nome do produto
- [Entregas](${SITE_URL}/delivery): zonas, prazos e custo de entrega
- [Pontos de levantamento](${SITE_URL}/pickup-points): showroom e pontos onde levantar o pedido
- [Trocas e devoluções](${SITE_URL}/return-policy): como funciona a prova antes de pagar e a devolução
- [Contactos](${SITE_URL}/contacts): telefone, WhatsApp, e-mail, morada e horário
- [Blog](${SITE_URL}/blog): guias de tamanhos, cuidados com a roupa e dicas de compra em Angola
`;

const policies = `## Políticas

- [Termos de uso](${SITE_URL}/terms-of-use)
- [Política de privacidade](${SITE_URL}/privacy-policy)

## Optional

- [Sitemap](${SITE_URL}/sitemap_index.xml): índice de sitemaps com todas as páginas, categorias, produtos e artigos
`;

async function categoriesSection(event: H3Event) {
  const db = await serverSupabaseClient(event);

  const { data, error } = await db
    .from('categories')
    .select('name, slug, parent_id')
    .eq('active', true)
    .order('id', { ascending: true });

  if (error || !data?.length) {
    return '';
  }

  // В llms.txt идут только подкатегории: корневая "Roupas" дублирует /products
  const lines = (data as CategoryRow[])
    .filter(category => category.parent_id)
    .map(category => `- [${category.name}](${SITE_URL}/category/${category.slug})`);

  return lines.length ? `## Categorias\n\n${lines.join('\n')}\n` : '';
}

async function blogSection(event: H3Event) {
  const articles = await queryCollection(event, 'blog')
    .where('draft', '=', false)
    .select('path', 'title', 'description')
    .order('publishedAt', 'DESC')
    .all() as ArticleRow[];

  if (!articles.length) {
    return '';
  }

  const lines = articles.map(article => `- [${article.title}](${SITE_URL}${article.path}): ${article.description}`);

  return `## Artigos do blog\n\n${lines.join('\n')}\n`;
}

export default defineEventHandler(async (event) => {
  // Динамические секции не должны ронять файл: без них llms.txt всё равно валиден
  const [categories, blog] = await Promise.all([
    categoriesSection(event).catch(() => ''),
    blogSection(event).catch(() => ''),
  ]);

  setHeader(event, 'Content-Type', 'text/markdown; charset=utf-8');
  setHeader(event, 'Cache-Control', 'public, max-age=3600');

  return [intro, categories, blog, policies].filter(Boolean).join('\n');
});
