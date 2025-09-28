<script setup lang="ts">
definePageMeta({ name: 'product-slug' });

const { t } = useI18n();
const currentRoute = useRoute();
const localeRoute = useLocaleRoute();
const requestURL = useRequestURL();

// ===== ДАННЫЕ ТОВАРА =====
const { data, error } = await useFetch('/api/catalog/item', {
  query: { slug: currentRoute.params.slug },
});

if (error.value || !data.value) {
  throw createError({ statusCode: 404 });
}

const product = computed(() => data.value?.product);
const breadcrumbItems = computed(() =>
  (data.value?.breadcrumbs || []).map((breadcrumb: any) => ({
    label: breadcrumb.label,
    to: localeRoute(breadcrumb.to),
  })),
);

// ===== SEO (всё реактивно) =====
const seoTitle = computed(() => `${product.value?.title || ''} - Amoda`);
const seoDescription = computed(
  () => product.value?.description || t('product.meta.description'),
);
const seoImage = computed(() => product.value?.images?.[0]?.url || '');

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
  itemListElement: breadcrumbItems.value.map((item, index) => ({
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
  image: (product.value?.images || []).map((img: any) => img.url),
  description: product.value?.description || '',
  sku: product.value?.variants?.[0]?.sku || product.value?.id,
  brand: { '@type': 'Brand', name: product.value?.brand_name || '' },
  offers: {
    '@type': 'Offer',
    url: productUrl.value,
    priceCurrency: 'AOA',
    price: (product.value?.variants?.[0]?.price ?? product.value?.price ?? 0) / 100,
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
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(productJsonLd.value),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbJsonLd.value),
    },
  ],
}));

// ===== ГАЛЕРЕЯ =====
const galleryImages = computed(() => product.value?.images || []);
const activeImageIndex = ref(0);

watch(galleryImages, () => {
  activeImageIndex.value = 0;
});

const setActiveImage = (index: number) => {
  activeImageIndex.value = index;
};

// ===== ВАРИАНТЫ =====
const selectedSize = ref<string | null>(null);
const selectedColor = ref<string | null>(null);

const availableSizes = computed(() => {
  const uniqueSizes = new Set<string>();

  product.value?.variants?.forEach((variant: any) => variant.size && uniqueSizes.add(variant.size));

  return [...uniqueSizes];
});

const availableColors = computed(() => {
  const uniqueColors = new Set<string>()

  ;(product.value?.variants || [])
    .filter((variant: any) => !selectedSize.value || variant.size === selectedSize.value)
    .forEach((variant: any) => variant.color && uniqueColors.add(variant.color));

  return [...uniqueColors];
});

const selectedVariant = computed(() => {
  const variants: any[] = product.value?.variants || [];

  if (!variants.length) {
    return null;
  }

  let filtered = variants;

  if (selectedSize.value) {
    filtered = filtered.filter(v => v.size === selectedSize.value);
  }

  if (selectedColor.value) {
    filtered = filtered.filter(v => v.color === selectedColor.value);
  }

  return filtered[0] || variants[0];
});

watch(product, (newProduct) => {
  if (!newProduct?.variants?.length) {
    return;
  }

  selectedSize.value = newProduct.variants[0]?.size ?? null;

  const firstForChosenSize = newProduct.variants.find(
    (variant: any) => !selectedSize.value || variant.size === selectedSize.value,
  );

  selectedColor.value = firstForChosenSize?.color ?? null;
}, { immediate: true });

// ===== КОРЗИНА =====
const { add: addToCartComposable, count: cartItemsCount } = useCart();

const addCurrentVariantToCart = () => {
  if (!product.value || !selectedVariant.value) {
    return;
  }

  addToCartComposable(product.value, selectedVariant.value, 1);
};
</script>

<i18n lang="json">
{
  "en": {
    "product": {
      "price": "Price",
      "size": "Size",
      "color": "Color",
      "add": "Add to cart",
      "sku": "SKU",
      "description": "Description",
      "brand": "About the brand",
      "meta": {
        "description": "Shop at Amoda. Wide selection, easy ordering and fast delivery."
      }
    }
  },
  "pt-AO": {
    "product": {
      "price": "Preço",
      "size": "Tamanho",
      "color": "Cor",
      "add": "Adicionar ao carrinho",
      "sku": "Código",
      "description": "Descrição",
      "brand": "Sobre a marca",
      "meta": {
        "description": "Compre na Amoda. Grande variedade, encomenda fácil e entrega rápida."
      }
    }
  }
}
</i18n>

<template>
  <section
    v-if="product"
    class="container mx-auto px-3 py-4 md:py-6"
  >
    <!-- Хлебные крошки (скрыты на мобилке) -->
    <UBreadcrumb
      :items="breadcrumbItems"
      class="mb-3 md:mb-4 hidden md:block"
    />

    <div class="grid md:grid-cols-12 gap-6">
      <!-- Левая колонка: галерея -->
      <div class="md:col-span-7">
        <div class="mb-4">
          <!-- Вьюпорт -->
          <div class="relative h-[280px] md:h-[480px] flex items-center justify-center overflow-hidden rounded">
            <!-- Размытый фон -->
            <div
              v-if="galleryImages[activeImageIndex]"
              class="absolute inset-0 bg-center bg-cover blur-xl scale-110"
              :style="{ backgroundImage: `url(${galleryImages[activeImageIndex].url})` }"
            />
            <!-- Главное изображение -->
            <NuxtImg
              :key="galleryImages[activeImageIndex]?.url"
              :src="galleryImages[activeImageIndex]?.url"
              class="relative z-10 max-h-full max-w-full object-contain"
            />
          </div>

          <!-- Миниатюры -->
          <div class="mt-3 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            <button
              v-for="(image, index) in galleryImages"
              :key="index"
              type="button"
              class="relative overflow-hidden focus:outline-none"
              :class="index === activeImageIndex ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'"
              @click="setActiveImage(index)"
            >
              <NuxtImg
                :src="image.url"
                class="w-full aspect-square object-cover"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Правая колонка: инфо и действия -->
      <aside class="md:col-span-5 space-y-4">
        <h1 class="text-2xl font-semibold">
          {{ product.title }}
        </h1>

        <p class="text-gray-500">
          {{ product.brand_name }}
        </p>

        <div>
          <div class="text-xs uppercase text-gray-500">
            {{ t('product.price') }}
          </div>

          <div class="text-2xl font-bold">
            {{ ((selectedVariant?.price ?? 0) / 100).toFixed(2) }} AOA
          </div>
        </div>

        <!-- Размер -->
        <div v-if="availableSizes.length">
          <div class="text-sm mb-1">
            {{ t('product.size') }}
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="size in availableSizes"
              :key="size"
              size="xs"
              :variant="selectedSize === size ? 'solid' : 'outline'"
              @click="selectedSize = size; selectedColor = null"
            >
              {{ size }}
            </UButton>
          </div>
        </div>

        <!-- Цвет -->
        <div v-if="availableColors.length">
          <div class="text-sm mb-1">
            {{ t('product.color') }}
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="color in availableColors"
              :key="color"
              size="xs"
              :variant="selectedColor === color ? 'solid' : 'outline'"
              @click="selectedColor = color"
            >
              {{ color }}
            </UButton>
          </div>
        </div>

        <UButton
          :disabled="!selectedVariant"
          size="lg"
          class="w-full"
          @click="addCurrentVariantToCart"
        >
          {{ t('product.add') }} ({{ cartItemsCount }})
        </UButton>

        <div
          v-if="selectedVariant?.sku"
          class="text-xs text-gray-500"
        >
          {{ t('product.sku') }}: {{ selectedVariant.sku }}
        </div>

        <!-- Описание -->
        <div class="mt-6">
          <h2 class="text-lg font-semibold mb-2">
            {{ t('product.description') }}
          </h2>

          <p
            v-if="product.description"
            class="text-sm"
          >
            {{ product.description }}
          </p>

          <p
            v-else
            class="text-sm text-gray-500"
          >
            —
          </p>
        </div>

        <!-- Бренд -->
        <div class="mt-4">
          <h2 class="text-lg font-semibold mb-2">
            {{ t('product.brand') }}
          </h2>

          <p class="text-sm">
            <span class="font-medium">{{ product.brand_name || '—' }}</span>
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>
