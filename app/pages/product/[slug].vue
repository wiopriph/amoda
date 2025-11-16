<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';


definePageMeta({ name: 'product-slug' });

/* === Imports & Setup === */
const { t } = useI18n();
const route = useRoute();
const requestURL = useRequestURL();
const localeRoute = useLocaleRoute();
const { trackViewItem, trackSelectItem } = useAnalyticsEvent();

const { data: productResponse, error: productError } = await useFetch('/api/catalog/item', {
  query: { slug: route.params.slug },
  watch: [() => route.fullPath],
});

if (productError.value || !productResponse.value) {
  throw createError({ statusCode: 404 });
}

const productData = computed(() => productResponse.value?.product);
const breadcrumbs = computed(() =>
  (productResponse.value?.breadcrumbs || []).map(crumb => ({
    label: crumb.label,
    to: localeRoute(crumb.to),
  })),
);

const recItems = computed(() => productResponse.value?.recommendations || []);

const productVariants = computed(() => productData.value?.variants || []);
const variantOptions = computed(() =>
  productVariants.value.map(variant => ({
    id: variant.id,
    url: variant.images?.[0]?.url || productData.value?.images?.[0]?.url || '/placeholder.png',
    label: variant.color || '—',
  })),
);

const selectedVariantId = ref<number | null>(null);
const selectedSizeId = ref<number | null>(null);

const currentVariant = computed(
  () => productVariants.value.find(variant => variant.id === selectedVariantId.value) || productVariants.value[0] || null,
);

const selectedVariantLabel = computed(() => currentVariant.value?.color || '—');

const sizeOptions = computed(() =>
  (currentVariant.value?.sizes || []).map(size => ({
    id: size.id,
    label: size.size,
  })),
);

watch(
  productData,
  product => {
    if (!product?.variants?.length) return;

    selectedVariantId.value = product.variants[0].id;
    selectedSizeId.value = product.variants[0].sizes?.[0]?.id ?? null;
  },
  { immediate: true },
);

watch(selectedVariantId, () => {
  selectedSizeId.value = currentVariant.value?.sizes?.[0]?.id ?? null;
});

const galleryImages = computed(() => {
  const variantImages = currentVariant.value?.images || [];
  const productImages = productData.value?.images || [];

  return [...(variantImages.length ? variantImages : productImages)].sort(
    (a, b) => (a.sort ?? 0) - (b.sort ?? 0),
  );
});

const hasGalleryImages = computed(() => (galleryImages.value?.length || 0) > 0);
const activeImageIndex = ref(0);
const setActiveImage = (index: number) => (activeImageIndex.value = index);

const formattedPriceAOA = computed(
  () => `${new Intl.NumberFormat('pt-AO').format(currentVariant.value?.price ?? productData.value?.price ?? 0)} AOA`,
);

const { add: addToCart } = useCart();

const addProductToCart = () => {
  const product = productData.value;
  const variant = currentVariant.value;
  const selectedSize = variant?.sizes?.find(size => size.id === selectedSizeId.value);

  if (!product || !variant || !selectedSize) {
    return;
  }

  addToCart(product, variant, selectedSize, 1);
};


watch(
  () => productData.value?.id,
  (id) => {
    if (!import.meta.client) {
      return;
    }

    if (!id || !productData.value) {
      return;
    }

    trackViewItem({
      itemId: productData.value.id,
      itemName: productData.value?.title || '',
      price: currentVariant.value?.price ?? 0,
      categoryId: productData.value.primary_category_id,
    });
  },
  { immediate: true },
);

const sendSelectProductEvent = (product: any) => {
  trackSelectItem({
    itemId: product.id,
    itemName: product.title,
    price: product.price,
    categoryId: product.primary_category_id,
  });
};

const seoTitle = computed(() => `${productData.value?.title || ''} | ${t('product.meta.titleSuffix')}`);
const seoDescription = computed(() => productData.value?.description || t('product.meta.description'));
const seoImage = computed(() => galleryImages.value?.[0]?.url || '/placeholder.png');

const productFullUrl = computed(() => {
  const localized = localeRoute({
    name: 'product-slug',
    params: { slug: productData.value?.slug },
  });
  const path = localized?.fullPath || '/';

  return new URL(path, requestURL.origin).href;
});

const productSchema = computed(() => ({
  '@context': 'https://schema.org/',
  '@type': 'Product',
  name: productData.value?.title,
  image: galleryImages.value.map(img => img.url),
  description: productData.value?.description || '',
  sku: productData.value?.variants?.[0]?.id || productData.value?.id,
  brand: { '@type': 'Brand', name: productData.value?.brand_name || '' },
  offers: {
    '@type': 'Offer',
    url: productFullUrl.value,
    priceCurrency: 'AOA',
    price: productData.value?.variants?.[0]?.price || 0,
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
  },
}));

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.value.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: new URL(item.to?.fullPath, requestURL.origin).href,
  })),
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
    { type: 'application/ld+json', innerHTML: JSON.stringify(productSchema.value) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema.value) },
  ],
}));
</script>

<i18n lang="json">
{
  "pt": {
    "product": {
      "price": "Preço",
      "size": "Tamanho",
      "color": "Cor",
      "add": "Adicionar ao carrinho",
      "description": "Descrição",
      "brand": "Marca",
      "meta": {
        "titleSuffix": "Amoda Angola — Moda online com entrega gratuita",
        "description": "Compre roupas, sapatos e acessórios na Amoda. Moda feminina, masculina e infantil com entrega gratuita em Luanda. Pague apenas após experimentar."
      },
      "seo": {
        "h1": "Compre {title} online em Angola — entrega gratuita e compra segura"
      },
      "reco": {
        "title": "Talvez você também goste",
        "cta": "Ver produto"
      }
    }
  },
  "en": {
    "product": {
      "price": "Price",
      "size": "Size",
      "color": "Color",
      "add": "Add to cart",
      "description": "Description",
      "brand": "Brand",
      "meta": {
        "titleSuffix": "Amoda Angola — Online fashion with free delivery",
        "description": "Shop clothes, shoes and accessories at Amoda. Fashion for women, men and kids with free delivery in Luanda. Pay only after trying on."
      },
      "seo": {
        "h1": "Buy {title} online in Angola — free delivery and safe shopping"
      },
      "reco": {
        "title": "You may also like",
        "cta": "View product"
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('product.seo.h1', { title: productData?.title })"
      :ui="{ root: 'py-3', title: 'text-lg md:text-xl font-semibold' }"
    >
      <template #headline>
        <UBreadcrumb
          :items="breadcrumbs"
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
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="order-2 lg:order-1 w-full lg:w-20 flex lg:flex-col gap-2 overflow-x-auto pb-2">
            <template v-if="hasGalleryImages">
              <button
                v-for="(image, index) in galleryImages"
                :key="index"
                type="button"
                class="relative overflow-hidden rounded-md border transition w-16 h-16 flex-none"
                :class="index === activeImageIndex ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-gray-400'"
                @click="setActiveImage(index)"
              >
                <NuxtImg
                  :src="image.url"
                  class="w-full h-full object-cover"
                />
              </button>
            </template>

            <template v-else>
              <div
                v-for="i in 4"
                :key="i"
                class="w-16 h-16 bg-gray-100 rounded-md border border-gray-200"
              />
            </template>
          </div>

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

        <div class="flex flex-col gap-6">
          <div>
            <div class="text-xs uppercase text-gray-500">
              {{ t('product.price') }}
            </div>

            <div class="text-3xl font-bold text-primary">
              {{ formattedPriceAOA }}
            </div>
          </div>

          <div v-if="variantOptions.length">
            <div class="text-sm font-medium mb-2 flex items-center gap-2">
              <span>{{ t('product.color') }}:</span>

              <span class="text-gray-600">{{ selectedVariantLabel }}</span>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="variantOption in variantOptions"
                :key="variantOption.id"
                type="button"
                class="relative overflow-hidden rounded-md border transition w-12 h-12 md:w-14 md:h-14"
                :class="selectedVariantId === variantOption.id ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-gray-400'"
                @click="selectedVariantId = variantOption.id"
              >
                <NuxtImg
                  :src="variantOption.url"
                  alt=""
                  class="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          <div v-if="sizeOptions.length">
            <div class="text-sm font-medium mb-2">
              {{ t('product.size') }}
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="sizeOption in sizeOptions"
                :key="sizeOption.id"
                :label="sizeOption.label"
                size="lg"
                class="cursor-pointer"
                :variant="selectedSizeId === sizeOption.id ? 'solid' : 'outline'"
                @click="selectedSizeId = sizeOption.id"
              />
            </div>
          </div>

          <UButton
            size="xl"
            color="primary"
            class="w-full uppercase justify-center"
            :disabled="!selectedSizeId"
            @click="addProductToCart"
          >
            {{ t('product.add') }}
          </UButton>

          <div>
            <h2 class="text-lg font-semibold mb-2">
              {{ t('product.description') }}
            </h2>

            <p class="text-sm text-gray-700 leading-relaxed">
              {{ productData?.description || '—' }}
            </p>
          </div>

          <div>
            <h2 class="text-lg font-semibold mb-2">
              {{ t('product.brand') }}
            </h2>

            <p class="text-sm font-medium">
              {{ productData?.brand_name || '—' }}
            </p>
          </div>
        </div>
      </div>

      <UPageSection
        v-if="recItems.length"
        :title="t('product.reco.title')"
        :ui="{
          title: 'text-md font-semibold'
        }"
        class="mt-10"
      >
        <UBlogPosts class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <UBlogPost
            v-for="item in recItems"
            :key="item.id"
            :title="item.title"
            :description="`${new Intl.NumberFormat('pt-AO').format(item.price)} AOA`"
            :image="item.images?.[0]?.url || '/placeholder.png'"
            :to="localeRoute({ name: 'product-slug', params: { slug: item.slug } })"
            :ui="{
              header: 'aspect-[4/5] object-cover',
              body: 'sm:p-3',
              title: 'line-clamp-2 overflow-hidden'
            }"
            variant="outline"
            @click="sendSelectProductEvent(item)"
          />
        </UBlogPosts>
      </UPageSection>
    </UPageBody>
  </UPage>
</template>
