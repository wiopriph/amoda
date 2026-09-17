<script setup lang="ts">
import { formatPrice } from '~/utils/formatPrice';
import type { BlogCategoryPreview } from '#shared/types/blog';


// ::category-cta{path="/category/vestidos-longos"} — карточка категории в статье блога
const props = defineProps<{
  path: string
}>();

const slug = computed(() => String(props.path || '').replace(/\/+$/, '')
  .split('/')
  .pop() || '');

// Блок не должен ломать статью: при ошибке/пустой категории просто не рендерится
const { data: preview } = await useFetch<BlogCategoryPreview>('/api/blog/category-preview', {
  key: `blog-category-cta-${slug.value}`,
  query: { slug, limit: 4 },
});

const isVisible = computed(() => Boolean(preview.value?.items?.length));

const previewImages = computed(() =>
  (preview.value?.items || [])
    .map(item => ({ slug: item.slug, image: item.image, title: item.title }))
    .filter(item => item.image)
    .slice(0, 4),
);

const priceRangeLabel = computed(() => {
  const { priceMin, priceMax } = preview.value || {};

  if (!priceMin) {
    return null;
  }

  if (!priceMax || priceMax === priceMin) {
    return formatPrice(priceMin);
  }

  return `${formatPrice(priceMin)} – ${formatPrice(priceMax)}`;
});
</script>

<template>
  <div
    v-if="isVisible"
    class="not-prose my-8 overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-4 shadow-sm sm:p-6"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">
          Categoria
        </p>

        <h3 class="mt-1 text-lg font-black tracking-tight text-highlighted sm:text-xl">
          {{ preview!.category.name }}
        </h3>

        <p
          v-if="priceRangeLabel"
          class="mt-1 text-sm text-muted"
        >
          {{ priceRangeLabel }}
        </p>
      </div>

      <UButton
        :to="`/category/${preview!.category.slug}`"
        color="primary"
        size="lg"
        trailingIcon="i-lucide-arrow-right"
        class="shrink-0 self-start rounded-full sm:self-center"
      >
        Ver todos
      </UButton>
    </div>

    <div
      v-if="previewImages.length"
      class="mt-4 grid grid-cols-4 gap-2 sm:gap-3"
    >
      <NuxtLink
        v-for="previewImage in previewImages"
        :key="previewImage.slug"
        :to="{ name: 'product-slug', params: { slug: previewImage.slug } }"
        class="group block overflow-hidden rounded-xl bg-gray-50"
      >
        <NuxtImg
          :src="previewImage.image!"
          :alt="previewImage.title"
          loading="lazy"
          class="aspect-[4/5] w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </NuxtLink>
    </div>
  </div>
</template>
