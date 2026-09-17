<script setup lang="ts">
import { BLOG_AUTHOR, BLOG_OG_IMAGE } from '~/constants/blog';


definePageMeta({ name: 'blog-slug' });

const route = useRoute();
const requestUrl = useRequestURL();

const articleSlug = computed(() => String(route.params.slug || ''));
const articlePath = computed(() => `/blog/${articleSlug.value}`);

// Драфты видны только в dev — в prod отдаём 404
const showDrafts = import.meta.dev;

const { data: article } = await useAsyncData(
  `blog-article-${articleSlug.value}`,
  () => queryCollection('blog').path(articlePath.value)
    .first(),
);

if (!article.value || (!showDrafts && article.value.draft)) {
  throw createError({ statusCode: 404 });
}

// Связанные статьи: related из frontmatter, при пустом — свежие статьи того же cluster
const { data: relatedArticles } = await useAsyncData(
  `blog-related-${articleSlug.value}`,
  async () => {
    const relatedPaths = (article.value!.related || [])
      .map(relatedSlug => `/blog/${String(relatedSlug).replace(/^\/?(blog\/)?/, '')}`);

    let relatedQuery = queryCollection('blog')
      .where('path', '<>', articlePath.value);

    if (!showDrafts) {
      relatedQuery = relatedQuery.where('draft', '=', false);
    }

    if (relatedPaths.length) {
      relatedQuery = relatedQuery.where('path', 'IN', relatedPaths);
    } else {
      relatedQuery = relatedQuery.where('cluster', '=', article.value!.cluster);
    }

    return relatedQuery
      .order('publishedAt', 'DESC')
      .select('path', 'title', 'description', 'cover')
      .limit(3)
      .all();
  },
);

// Имена категорий магазина для блока перелинковки (fallback — из slug)
type StoreCategory = {
  slug: string
  name: string
};

const { data: storeCategories } = await useFetch<StoreCategory[]>('/api/categories/list', {
  key: 'blog-store-categories',
});

const slugToLabel = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/^\p{L}/u, char => char.toUpperCase());

const categoryLinks = computed(() =>
  (article.value?.categories || []).map((categoryPath) => {
    const slug = String(categoryPath).replace(/\/+$/, '')
      .split('/')
      .pop() || '';
    const match = (storeCategories.value || []).find(category => category.slug === slug);

    return {
      to: `/category/${slug}`,
      label: match?.name || slugToLabel(slug),
    };
  }),
);

// TOC только по H2
const tocLinks = computed(() =>
  (article.value?.body?.toc?.links || []).filter(link => link.depth === 2),
);

const faqEntries = computed(() => article.value?.faq || []);

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => `Olá! Li o artigo «${article.value?.title}» no blog da Amoda e preciso de ajuda.`);

// --- SEO ---

const title = computed(() => `${article.value!.title} | Amoda`);
const description = computed(() => article.value!.description || '');
const canonicalUrl = computed(() => new URL(articlePath.value, 'https://amoda.ao').href);
const ogImage = new URL(BLOG_OG_IMAGE, 'https://amoda.ao').href;

const articleSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.value!.title,
  description: description.value,
  mainEntityOfPage: canonicalUrl.value,
  image: ogImage,
  datePublished: new Date(article.value!.publishedAt).toISOString(),
  dateModified: new Date(article.value!.updatedAt).toISOString(),
  author: {
    '@type': 'Person',
    name: BLOG_AUTHOR.name,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Amoda',
    url: 'https://amoda.ao',
    logo: {
      '@type': 'ImageObject',
      url: 'https://amoda.ao/logo.webp',
    },
  },
}));

const faqSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqEntries.value.map(faqEntry => ({
    '@type': 'Question',
    name: faqEntry.q,
    acceptedAnswer: { '@type': 'Answer', text: faqEntry.a },
  })),
}));

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Página inicial', item: 'https://amoda.ao/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://amoda.ao/blog' },
    { '@type': 'ListItem', position: 3, name: article.value!.title, item: canonicalUrl.value },
  ],
}));

useHead(() => ({
  title: title.value,
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
    { property: 'og:image', content: ogImage },
    { property: 'article:published_time', content: new Date(article.value!.publishedAt).toISOString() },
    { property: 'article:modified_time', content: new Date(article.value!.updatedAt).toISOString() },
    { property: 'article:author', content: BLOG_AUTHOR.name },
    { name: 'twitter:title', content: title.value },
    { name: 'twitter:description', content: description.value },
    { name: 'twitter:image', content: ogImage },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(articleSchema.value) },
    ...(faqEntries.value.length ?
      [{ type: 'application/ld+json', innerHTML: JSON.stringify(faqSchema.value) }] :
      []),
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema.value) },
  ],
}));

const faqAccordionItems = computed(() =>
  faqEntries.value.map(faqEntry => ({
    label: faqEntry.q,
    content: faqEntry.a,
  })),
);
</script>

<template>
  <UPage v-if="article">
    <UPageBody class="mx-auto mt-4 max-w-6xl sm:mt-8 sm:px-6 lg:px-8">
      <header class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-4 shadow-sm sm:p-8">
        <nav
          aria-label="Breadcrumb"
          class="-mx-1 flex items-center gap-1 overflow-x-auto whitespace-nowrap px-1 text-xs text-dimmed [-ms-overflow-style:none] [scrollbar-width:none] sm:text-sm [&::-webkit-scrollbar]:hidden"
        >
          <NuxtLink
            :to="{ name: 'index' }"
            class="transition hover:text-primary"
          >
            Página inicial
          </NuxtLink>

          <UIcon
            name="i-lucide-chevron-right"
            class="size-3.5 shrink-0 text-gray-300"
          />

          <NuxtLink
            :to="{ name: 'blog' }"
            class="transition hover:text-primary"
          >
            Blog
          </NuxtLink>

          <UIcon
            name="i-lucide-chevron-right"
            class="size-3.5 shrink-0 text-gray-300"
          />

          <span
            aria-current="page"
            class="truncate font-semibold text-highlighted"
          >
            {{ article.title }}
          </span>
        </nav>

        <UBadge
          v-if="article.draft"
          color="warning"
          variant="solid"
          size="sm"
          class="mt-3 rounded-full sm:mt-4"
        >
          Rascunho
        </UBadge>

        <h1 class="mt-2 text-2xl font-black tracking-tight text-highlighted sm:mt-3 sm:text-4xl">
          {{ article.title }}
        </h1>
      </header>

      <div class="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div class="min-w-0">
          <!-- TOC на мобиле: сворачиваемый блок над статьёй -->
          <UCollapsible
            v-if="tocLinks.length"
            class="mb-6 rounded-2xl border border-gray-100 bg-gray-50 lg:hidden"
          >
            <UButton
              label="Neste artigo"
              color="neutral"
              variant="ghost"
              trailingIcon="i-lucide-chevron-down"
              block
              class="justify-between px-4 py-3 font-semibold"
            />

            <template #content>
              <ul class="space-y-2 px-4 pb-4 text-sm">
                <li
                  v-for="tocLink in tocLinks"
                  :key="tocLink.id"
                >
                  <a
                    :href="`#${tocLink.id}`"
                    class="text-muted transition hover:text-primary"
                  >
                    {{ tocLink.text }}
                  </a>
                </li>
              </ul>
            </template>
          </UCollapsible>

          <ContentRenderer
            :value="article"
            class="prose prose-pink max-w-none"
          />

          <!-- Perguntas frequentes -->
          <section
            v-if="faqAccordionItems.length"
            class="mt-10"
          >
            <h2 class="text-xl font-black tracking-tight text-highlighted sm:text-2xl">
              Perguntas frequentes
            </h2>

            <UAccordion
              :items="faqAccordionItems"
              class="mt-4"
            />
          </section>

          <!-- Перелинковка на категории магазина -->
          <section
            v-if="categoryLinks.length"
            class="mt-10 rounded-2xl border border-pink-100 bg-pink-50/50 p-5"
          >
            <h2 class="text-base font-extrabold text-highlighted">
              Ver na loja
            </h2>

            <div class="mt-3 flex flex-wrap gap-2">
              <UButton
                v-for="categoryLink in categoryLinks"
                :key="categoryLink.to"
                :to="categoryLink.to"
                color="primary"
                variant="soft"
                size="sm"
                trailingIcon="i-lucide-arrow-right"
                class="rounded-full"
              >
                {{ categoryLink.label }}
              </UButton>
            </div>
          </section>

          <!-- Автор -->
          <section class="mt-10 flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <UAvatar
              :src="BLOG_AUTHOR.photo"
              :alt="BLOG_AUTHOR.name"
              size="3xl"
            />

            <div>
              <p class="font-extrabold text-highlighted">
                {{ BLOG_AUTHOR.name }}
              </p>

              <p class="text-sm text-muted">
                {{ BLOG_AUTHOR.role }}
              </p>
            </div>
          </section>

          <!-- Artigos relacionados -->
          <section
            v-if="relatedArticles?.length"
            class="mt-10"
          >
            <h2 class="text-xl font-black tracking-tight text-highlighted sm:text-2xl">
              Artigos relacionados
            </h2>

            <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <BlogArticleCard
                v-for="relatedArticle in relatedArticles"
                :key="relatedArticle.path"
                :article="relatedArticle"
              />
            </div>
          </section>
        </div>

        <!-- TOC на десктопе: sticky-сайдбар -->
        <aside
          v-if="tocLinks.length"
          class="sticky top-(--app-header-offset) hidden max-h-[calc(100vh-var(--app-header-offset)-2rem)] overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-5 lg:block"
        >
          <p class="text-sm font-extrabold uppercase tracking-wide text-highlighted">
            Neste artigo
          </p>

          <ul class="mt-3 space-y-2 text-sm">
            <li
              v-for="tocLink in tocLinks"
              :key="tocLink.id"
            >
              <a
                :href="`#${tocLink.id}`"
                class="block text-muted transition hover:text-primary"
              >
                {{ tocLink.text }}
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </UPageBody>

    <WhatsappButton
      :to="whatsappHref"
      aria-label="Falar com a Amoda no WhatsApp"
    />
  </UPage>
</template>
