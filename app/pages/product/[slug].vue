<script setup lang="ts">
definePageMeta({ name: 'product-slug' });

const { t } = useI18n();
const route = useRoute();
const requestURL = useRequestURL();

const { data, error } = await useFetch('/api/catalog/item', {
  query: { slug: route.params.slug },
  watch: [() => route.fullPath],
});

if (error.value || !data.value) {
  throw createError({ statusCode: 404 });
}

const product = computed(() => data.value?.product);

const localeRoute = useLocaleRoute();
const breadcrumbsUi = computed(() =>
  (data.value?.breadcrumbs || []).map(b => ({
    label: b.label,
    to: localeRoute(b.to),
  })),
);

const selectedVariantId = ref<number | null>(null);
const selectedSizeId = ref<number | null>(null);
const variants = computed(() => product.value?.variants || []);
const variantOptions = computed(() => variants.value.map(variant => ({ id: variant.id, label: variant.color || '—' })));
const currentVariant = computed(() => variants.value.find(variant => variant.id === selectedVariantId.value) || variants.value[0] || null);
const sizeOptions = computed(() => (currentVariant.value?.sizes || []).map(size => ({ id: size.id, label: size.size })));

watch(product, (p) => {
  if (!p?.variants?.length) {
    return;
  }

  selectedVariantId.value = p.variants[0].id;
  selectedSizeId.value = p.variants[0].sizes?.[0]?.id ?? null;
}, { immediate: true });

watch(selectedVariantId, () => {
  selectedSizeId.value = currentVariant.value?.sizes?.[0]?.id ?? null;
});

const galleryImages = computed(() => {
  const vImgs = currentVariant.value?.images || [];
  const pImgs = product.value?.images || [];

  return [...(vImgs.length ? vImgs : pImgs)].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
});

const hasImages = computed(() => (galleryImages.value?.length || 0) > 0);
const activeImageIndex = ref(0);
const setActiveImage = (i: number) => (activeImageIndex.value = i);
const currentPriceAOA = computed(() => new Intl.NumberFormat('pt-AO').format(currentVariant.value?.price ?? product.value?.price ?? 0));

// ===== Cart =====
const { add: addToCart } = useCart();

const addCurrentToCart = () => {
  const p = product.value;
  const v = currentVariant.value;
  const size = v?.sizes?.find(s => s.id === selectedSizeId.value);

  if (!p || !v || !size) {
    return;
  }

  addToCart(p, v, size, 1);
};


const variantThumbs = computed(() =>
  variants.value.map(v => ({
    id: v.id,
    url: v.images?.[0]?.url || product.value?.images?.[0]?.url || '/placeholder.png',
    label: v.color || '—',
  })),
);


// ===== SEO =====
const seoTitle = computed(() => `${product.value?.title || ''} - Amoda`);
const seoDescription = computed(() => product.value?.description || t('product.meta.description'));
const seoImage = computed(() => galleryImages.value?.[0]?.url || '/placeholder.png');

const productUrl = computed(() => {
  const localized = localeRoute({
    name: 'product-slug',
    params: { slug: product.value?.slug },
  });
  const path = localized?.fullPath || '/';

  return new URL(path, requestURL.origin).href;
});

const breadcrumbJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbsUi.value.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: new URL(item.to?.fullPath, requestURL.origin).href,
  })),
}));

const productJsonLd = computed(() => ({
  '@context': 'https://schema.org/',
  '@type': 'Product',
  name: product.value?.title,
  image: galleryImages.value.map(i => i.url),
  description: product.value?.description || '',
  sku: product.value?.variants?.[0]?.id || product.value?.id,
  brand: { '@type': 'Brand', name: product.value?.brand_name || '' },
  offers: {
    '@type': 'Offer',
    url: productUrl.value,
    priceCurrency: 'AOA',
    price: product.value?.variants?.[0]?.price || 0,
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
  },
}));

useHead(() => ({
  title: seoTitle.value,
  meta: [
    { name: 'description', content: seoDescription.value },
    { property: 'og:title', content: seoTitle.value },
    { property: 'og:description', content: seoDescription.value },
    { property: 'og:image', content: seoImage.value },
    { property: 'twitter:title', content: seoTitle.value },
    { property: 'twitter:description', content: seoDescription.value },
    { property: 'twitter:image', content: seoImage.value },
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(productJsonLd.value) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbJsonLd.value) },
  ],
}));
</script>

<i18n lang="json">
{
  "en": {
    "product": {
      "price": "Price",
      "size": "Size",
      "color": "Color",
      "add": "Add to cart",
      "description": "Description",
      "brand": "Brand",
      "meta": {
        "description": "Shop at Amoda. Wide selection, easy ordering and fast delivery."
      }
    }
  },
  "pt": {
    "product": {
      "price": "Preço",
      "size": "Tamanho",
      "color": "Cor",
      "add": "Adicionar ao carrinho",
      "description": "Descrição",
      "brand": "Marca",
      "meta": {
        "description": "Compre na Amoda. Grande variedade, encomenda fácil e entrega rápida."
      }
    }
  }
}
</i18n>


<template>
  <UPage>
    <UPageHeader
      :title="product?.title"
      :ui="{
        root: 'py-3',
        title: 'text-xl md:text-2xl',
      }"
    >
      <template #headline>
        <UBreadcrumb
          :items="breadcrumbsUi"
          :ui="{
            root: 'mb-4 hidden md:block',
            list: 'flex items-center gap-1 min-w-0',
            item: 'shrink-0 last:flex-1 last:min-w-0',
            link: 'text-xs md:text-sm hover:text-primary-600 aria-[current=page]:pointer-events-none',
            linkLabel: 'block whitespace-nowrap overflow-hidden text-ellipsis truncate aria-[current=page]:font-medium',
            separator: 'mx-1 text-gray-400'
          }"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Галерея -->
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Миниатюры -->
          <div
            class="order-2 lg:order-1
                   w-full lg:w-20 shrink-0
                   flex lg:flex-col gap-2
                   overflow-x-auto lg:overflow-visible
                   pb-2 lg:pb-0"
          >
            <template v-if="hasImages">
              <button
                v-for="(img, i) in galleryImages"
                :key="i"
                type="button"
                class="relative overflow-hidden rounded-md border transition
                       w-16 h-16 flex-none"
                :class="i === activeImageIndex ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-gray-400'"
                @click="setActiveImage(i)"
              >
                <NuxtImg
                  :src="img.url"
                  class="w-full h-full object-cover"
                />
              </button>
            </template>

            <template v-else>
              <div
                v-for="i in 4"
                :key="i"
                class="w-16 h-16 flex-none bg-gray-100 rounded-md border border-gray-200"
              />
            </template>
          </div>

          <!-- Главное фото -->
          <div class="flex-1 order-1 lg:order-2">
            <div
              class="relative w-full aspect-[4/5] overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center"
            >
              <NuxtImg
                :src="galleryImages[activeImageIndex]?.url || '/placeholder.png'"
                class="object-contain max-h-full max-w-full"
              />
            </div>
          </div>
        </div>

        <!-- Инфо -->
        <div class="flex flex-col gap-6">
          <!-- Цена -->
          <div>
            <div class="text-xs uppercase text-gray-500">
              {{ t('product.price') }}
            </div>

            <div class="text-3xl font-bold text-primary">
              {{ currentPriceAOA }} AOA
            </div>
          </div>

          <div v-if="variantThumbs.length">
            <div class="text-sm font-medium mb-2">
              {{ t('product.color') }}
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in variantThumbs"
                :key="opt.id"
                type="button"
                class="relative overflow-hidden rounded-md border transition w-12 h-12 md:w-14 md:h-14"
                :class="selectedVariantId === opt.id
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-gray-200 hover:border-gray-400'"
                :aria-pressed="selectedVariantId === opt.id"
                :title="opt.label"
                @click="selectedVariantId = opt.id"
              >
                <NuxtImg
                  :src="opt.url"
                  alt=""
                  class="w-full h-full object-cover"
                />

                <span class="sr-only">{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <!-- Размер -->
          <div v-if="sizeOptions.length">
            <div class="text-sm font-medium mb-2">
              {{ t('product.size') }}
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="s in sizeOptions"
                :key="s.id"
                :label="s.label"
                size="lg"
                class="cursor-pointer"
                :variant="selectedSizeId === s.id ? 'solid' : 'outline'"
                @click="selectedSizeId = s.id"
              />
            </div>
          </div>

          <UButton
            size="xl"
            color="primary"
            class="w-full uppercase justify-center"
            :disabled="!selectedSizeId"
            @click="addCurrentToCart"
          >
            {{ t('product.add') }}
          </UButton>

          <div>
            <h2 class="text-lg font-semibold mb-2">
              {{ t('product.description') }}
            </h2>

            <p class="text-sm text-gray-700 leading-relaxed">
              {{ product?.description || '—' }}
            </p>
          </div>

          <div>
            <h2 class="text-lg font-semibold mb-2">
              {{ t('product.brand') }}
            </h2>

            <p class="text-sm font-medium">
              {{ product?.brand_name || '—' }}
            </p>
          </div>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
