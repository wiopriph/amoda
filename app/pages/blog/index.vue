<script setup lang="ts">
import { BLOG_OG_IMAGE, BLOG_PER_PAGE } from '~/constants/blog';


definePageMeta({ name: 'blog' });

const route = useRoute();
const router = useRouter();
const requestUrl = useRequestURL();

const page = computed(() => Math.max(1, Number(route.query.page || 1)));

// Драфты видны только в dev — в prod их нет ни в списке, ни в счётчике
const showDrafts = import.meta.dev;

const { data: blogIndex } = await useAsyncData(
  'blog-index',
  async () => {
    let listQuery = queryCollection('blog');
    let countQuery = queryCollection('blog');

    if (!showDrafts) {
      listQuery = listQuery.where('draft', '=', false);
      countQuery = countQuery.where('draft', '=', false);
    }

    const [articles, total] = await Promise.all([
      listQuery
        .order('publishedAt', 'DESC')
        .select('path', 'title', 'description', 'cover', 'draft')
        .skip((page.value - 1) * BLOG_PER_PAGE)
        .limit(BLOG_PER_PAGE)
        .all(),
      countQuery.count(),
    ]);

    return { articles, total };
  },
  { watch: [page] },
);

const articles = computed(() => blogIndex.value?.articles || []);
const totalArticles = computed(() => blogIndex.value?.total || 0);
const pageCount = computed(() => Math.max(1, Math.ceil(totalArticles.value / BLOG_PER_PAGE)));

if (page.value > 1 && page.value > pageCount.value) {
  throw createError({ statusCode: 404 });
}

const getPaginationTo = (pageNumber: number) => ({
  query: pageNumber === 1 ? {} : { page: pageNumber },
});

const title = 'Blog de moda feminina em Luanda | Amoda';
const description = 'Guias de moda da Amoda: o que vestir em Luanda, como combinar peças e escolher o look certo. Escolha online, experimente primeiro e pague só o que gostar.';

const canonicalUrl = computed(() => {
  const path = router.resolve({
    name: 'blog',
    query: page.value > 1 ? { page: page.value } : {},
  }).fullPath;

  return new URL(path, requestUrl.origin).href;
});

const ogImage = new URL(BLOG_OG_IMAGE, 'https://amoda.ao').href;

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Página inicial', item: 'https://amoda.ao/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://amoda.ao/blog' },
  ],
};

useHead(() => ({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: ogImage },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema) },
  ],
}));
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto mt-4 max-w-6xl space-y-6 sm:mt-8 sm:px-6 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-4 shadow-sm sm:p-8">
        <nav
          aria-label="Breadcrumb"
          class="flex items-center gap-1 text-xs text-dimmed sm:text-sm"
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

          <span
            aria-current="page"
            class="font-semibold text-highlighted"
          >
            Blog
          </span>
        </nav>

        <h1 class="mt-3 text-2xl font-black tracking-tight text-highlighted sm:mt-4 sm:text-5xl">
          Blog da Amoda
        </h1>

        <p class="mt-2 text-sm leading-6 text-muted sm:mt-4 sm:text-lg sm:leading-7">
          {{ description }}
        </p>
      </section>

      <UEmpty
        v-if="!articles.length"
        class="mt-6"
        icon="i-lucide-newspaper"
        title="Ainda não há artigos."
        description="Os primeiros guias de moda estão a caminho. Volte em breve!"
      />

      <section
        v-else
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="article in articles"
          :key="article.path"
          class="relative h-full"
        >
          <BlogArticleCard :article="article" />

          <UBadge
            v-if="article.draft"
            color="warning"
            variant="solid"
            size="sm"
            class="absolute right-3 top-3 rounded-full"
          >
            Rascunho
          </UBadge>
        </article>
      </section>

      <div
        v-if="pageCount > 1"
        class="flex justify-center pt-2"
      >
        <UPagination
          :page="page"
          :itemsPerPage="BLOG_PER_PAGE"
          :total="totalArticles"
          :to="getPaginationTo"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
