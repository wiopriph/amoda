<script setup lang="ts">
import { getProductBadgeColor, getProductBadgeLabel } from '~/utils/productBadges';
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { formatPrice } from '~/utils/formatPrice';
import { makeGa4Item } from '~/utils/ga4';
import { CURRENCY } from '~/constants/currency';


definePageMeta({ name: 'product-slug' });

const fallbackImage = '/placeholder.webp';

const route = useRoute();
const { data: productResponse, error: productError } = await useFetch('/api/catalog/item', {
  query: { slug: route.params.slug },
  watch: [() => route.fullPath],
});

if (productError.value || !productResponse.value) {
  throw createError({ statusCode: 404 });
}

const product = computed(() => productResponse.value?.product);
const productName = computed(() => product.value?.title || '');

const breadcrumbs = computed(() =>
  (productResponse.value?.breadcrumbs || []).map((crumb: any) => ({
    label: crumb.label,
    to: crumb.to,
  })),
);

const recommendedProducts = computed(() => productResponse.value?.recommendations || []);

const variants = computed(() => product.value?.variants || []);

const selectedVariantId = ref<number | null>(null);
const selectedSizeId = ref<number | null>(null);

const activeVariant = computed(
  () => variants.value.find(variant => variant.id === selectedVariantId.value) || variants.value[0] || null,
);

watch(
  product,
  (loadedProduct) => {
    if (!loadedProduct?.variants?.length) return;

    selectedVariantId.value = loadedProduct.variants[0].id;
    selectedSizeId.value = loadedProduct.variants[0].sizes?.[0]?.id ?? null;
  },
  { immediate: true },
);

watch(selectedVariantId, () => {
  selectedSizeId.value = activeVariant.value?.sizes?.[0]?.id ?? null;
});

const selectedVariantLabel = computed(() => activeVariant.value?.color || '—');

const variantOptions = computed(() =>
  variants.value.map((variant: any) => ({
    id: variant.id,
    url: variant.images?.[0]?.url || product.value?.images?.[0]?.url || fallbackImage,
    label: variant.color || '—',
  })),
);

const galleryImages = computed(() => {
  const variantImages = activeVariant.value?.images || [];
  const productImages = product.value?.images || [];
  const images = variantImages.length ? variantImages : productImages;

  return [...images].sort((firstImage: any, secondImage: any) => (firstImage.sort ?? 0) - (secondImage.sort ?? 0));
});

const hasGalleryImages = computed(() => galleryImages.value.length > 0);


const carouselRef = useTemplateRef('carousel');
const activeImageIndex = ref(0);

const carouselSlides = computed(() => galleryImages.value.map((image: any, imageIndex: number) => ({
  url: image.url,
  alt: `${productName.value} - foto ${imageIndex + 1}`,
  index: imageIndex,
})));

watch(
  carouselSlides,
  () => {
    activeImageIndex.value = 0;
    carouselRef.value?.emblaApi?.scrollTo(0);
  },
  { flush: 'post' },
);

function showPreviousImage() {
  activeImageIndex.value = Math.max(0, activeImageIndex.value - 1);
}

function showNextImage() {
  activeImageIndex.value = Math.min(carouselSlides.value.length - 1, activeImageIndex.value + 1);
}

function setActiveImage(index: number) {
  activeImageIndex.value = index;
}

function selectImage(index: number) {
  activeImageIndex.value = index;
  carouselRef.value?.emblaApi?.scrollTo(index);
}


const unitPrice = computed(() => activeVariant.value?.price ?? product.value?.price ?? 0);

const formattedPrice = computed(() => formatPrice(unitPrice.value));


const {
  add: addToCart,
  getQty,
  increment,
  decrement,
  isEmpty: isEmptyCart,
} = useCart();

const buildCartItemKey = (productId: number, variantId: number, sizeId: number) => `p${productId}-v${variantId}-s${sizeId}`;

const selectedSkuQuantity = computed(() => {
  const currentProduct = product.value;
  const selectedVariant = activeVariant.value;
  const selectedSize = selectedSizeId.value;

  if (!currentProduct?.id || !selectedVariant?.id || !selectedSize) return 0;

  return getQty(currentProduct.id, selectedVariant.id, selectedSize);
});

const selectedSkuKey = computed(() => {
  const currentProduct = product.value;
  const selectedVariant = activeVariant.value;
  const selectedSize = selectedSizeId.value;

  if (!currentProduct?.id || !selectedVariant?.id || !selectedSize) {
    return '';
  }

  return buildCartItemKey(currentProduct.id, selectedVariant.id, selectedSize);
});

const mobilePriceLabel = computed(() => selectedSkuQuantity.value > 0 ? 'Subtotal da seleção' : 'Preço');

const formattedMobilePrice = computed(() => {
  const quantity = selectedSkuQuantity.value || 1;

  return formatPrice(unitPrice.value * quantity);
});

const sizeOptions = computed(() =>
  (activeVariant.value?.sizes || []).map((size: any) => {
    const currentProduct = product.value;
    const selectedVariant = activeVariant.value;
    const inCartQty = currentProduct?.id && selectedVariant?.id ? getQty(currentProduct.id, selectedVariant.id, size.id) : 0;
    const stock = Number(size.stock ?? 0);

    return {
      id: size.id,
      label: size.size,
      stock,
      isLowStock: stock > 0 && stock <= 2,
      inCartQty,
    };
  }),
);

const lowStockText = (stock: number) => stock === 1 ? 'Só resta 1' : `Só restam ${stock}`;

const purchaseFlowSteps = [
  {
    title: 'Escolha em segundos',
    description: 'Selecione o tamanho sem pagar agora.',
  },
  {
    title: 'Experimente no ponto',
    description: 'Veja ao vivo e experimente com calma.',
  },
  {
    title: 'Decida na hora',
    description: 'Leve só o que gostar.',
  },
];

const selectedSizeOption = computed(() =>
  sizeOptions.value.find((sizeOption) => sizeOption.id === selectedSizeId.value) || null,
);

const isCartDrawerOpen = ref(false);

const cartTo = { name: 'cart' } as const;

const openCartDrawer = () => {
  isCartDrawerOpen.value = true;
};

const closeCartDrawer = () => {
  isCartDrawerOpen.value = false;
};

const addProductToCart = () => {
  const currentProduct = product.value;
  const selectedVariant = activeVariant.value;
  const selectedSize = selectedVariant?.sizes?.find((size: any) => size.id === selectedSizeId.value);

  if (!currentProduct || !selectedVariant || !selectedSize) return;

  addToCart(currentProduct, selectedVariant, selectedSize, 1);
  openCartDrawer();
};


const { trackViewItem, trackSelectItem } = useAnalyticsEvent();

watch(
  () => [product.value?.id, activeVariant.value?.id, selectedSizeId.value] as const,
  ([productId, variantId, sizeId]) => {
    if (!import.meta.client) {
      return;
    }

    const currentProduct = product.value;
    const selectedVariant = activeVariant.value;

    if (!productId || !variantId || !currentProduct || !selectedVariant) {
      return;
    }

    if (!sizeId) {
      return;
    }

    const selectedSize = selectedSizeOption.value;

    if (!selectedSize) {
      return;
    }

    trackViewItem({
      items: [
        makeGa4Item({
          productId: currentProduct.id,
          name: currentProduct.title,
          brand: currentProduct.brand_name,
          price: selectedVariant.price ?? 0,
          quantity: 1,
          variantId: selectedVariant.id,
          sizeId: selectedSize.id,
          variantLabel: selectedVariant.color ?? undefined,
          sizeLabel: selectedSize.label ?? String(selectedSize.id),
          categoryName: currentProduct.primary_category_id ? String(currentProduct.primary_category_id) : undefined,
        }),
      ],
    });
  },
  { immediate: true },
);

const trackRecommendationSelect = (recommendedProduct: any) => {
  const recommendationVariant = recommendedProduct?.variants?.[0] ?? null;
  const recommendationSize = recommendationVariant?.sizes?.[0] ?? null;

  if (!recommendationVariant?.id || !recommendationSize?.id) {
    return;
  }

  trackSelectItem({
    listId: 'recommendations',
    listName: 'Recommendations',
    items: [
      makeGa4Item({
        productId: recommendedProduct.id,
        name: recommendedProduct.title,
        brand: recommendedProduct.brand_name,
        price: recommendationVariant.price ?? recommendedProduct.price ?? 0,
        quantity: 1,
        variantId: recommendationVariant.id,
        sizeId: recommendationSize.id,
        variantLabel: recommendationVariant.color ?? undefined,
        sizeLabel: recommendationSize.size ?? String(recommendationSize.id),
        categoryName: recommendedProduct.primary_category_id ? String(recommendedProduct.primary_category_id) : undefined,
      }),
    ],
  });
};


const router = useRouter();
const requestUrl = useRequestURL();

const productUrl = computed(() => {
  const path = router.resolve({ name: 'product-slug', params: { slug: product.value?.slug } }).fullPath || '/';

  return new URL(path, requestUrl.origin).href;
});

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => `Olá! Tenho uma pergunta sobre este produto: ${productUrl.value}`);


const title = computed(() => `${product.value?.title || ''} | Escolha sem pagar`);
const description = computed(() => product.value?.description || `Escolha ${productName.value} na Amoda em Luanda. Selecione o tamanho, confirme no WhatsApp, experimente primeiro e pague só se gostar.`);
const seoImage = computed(() => galleryImages.value?.[0]?.url || fallbackImage);

const productSchema = computed(() => ({
  '@context': 'https://schema.org/',
  '@type': 'Product',
  name: product.value?.title,
  image: galleryImages.value.map((image: any) => image.url),
  description: product.value?.description || '',
  sku: product.value?.variants?.[0]?.id || product.value?.id,
  brand: { '@type': 'Brand', name: product.value?.brand_name || '' },
  offers: {
    '@type': 'Offer',
    url: productUrl.value,
    priceCurrency: CURRENCY,
    price: activeVariant.value?.price ?? product.value?.price ?? 0,
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
  },
}));

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.value.map((breadcrumbItem: any, breadcrumbIndex: number) => ({
    '@type': 'ListItem',
    position: breadcrumbIndex + 1,
    name: breadcrumbItem.label,
    item: new URL(router.resolve(breadcrumbItem.to).fullPath, requestUrl.origin).href,
  })),
}));

useHead(() => ({
  title: title.value,
  meta: [
    { name: 'description', content: description.value },
    { property: 'og:title', content: title.value },
    { property: 'og:description', content: description.value },
    { property: 'og:image', content: seoImage.value },
    { property: 'twitter:title', content: title.value },
    { property: 'twitter:description', content: description.value },
    { property: 'twitter:image', content: seoImage.value },
  ],
  link: [{ rel: 'canonical', href: productUrl.value }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(productSchema.value) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema.value) },
  ],
}));
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-6xl pb-32 sm:px-6 sm:pb-0 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-3">
        <section class="flex-1 w-full">
          <div class="relative overflow-hidden rounded-3xl bg-gray-50">
            <UCarousel
              v-if="hasGalleryImages"
              v-slot="{ item: slide }"
              ref="carousel"
              :items="carouselSlides"
              :prev="{ onClick: showPreviousImage }"
              :next="{ onClick: showNextImage }"
              :ui="{
                container: 'flex w-full ms-0',
                item: 'basis-full shrink-0 ps-0'
              }"
              fade
              loop
              class="w-full overflow-hidden"
              @select="setActiveImage"
            >
              <div class="aspect-[4/5] w-full overflow-hidden bg-gray-50">
                <NuxtImg
                  :src="slide.url"
                  :alt="slide.alt"
                  class="h-full w-full object-cover"
                />
              </div>
            </UCarousel>

            <div
              v-else
              class="aspect-[4/5] w-full overflow-hidden bg-gray-50"
            >
              <NuxtImg
                :alt="`${productName} - imagem`"
                :src="fallbackImage"
                class="h-full w-full object-cover"
              />
            </div>

            <div
              v-if="hasGalleryImages && carouselSlides.length > 1"
              class="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm"
            >
              {{ activeImageIndex + 1 }} / {{ carouselSlides.length }}
            </div>
          </div>

          <div
            v-if="hasGalleryImages && carouselSlides.length > 1"
            class="mt-3 hidden gap-2 overflow-x-auto md:flex"
          >
            <button
              v-for="(thumbnail, thumbnailIndex) in carouselSlides"
              :key="thumbnail.index"
              :class="activeImageIndex === thumbnailIndex
                ? 'border-primary opacity-100 ring-1 ring-primary'
                : 'border-gray-200 opacity-50 hover:opacity-100'"
              type="button"
              class="size-14 flex-none overflow-hidden rounded-xl border transition"
              @click="selectImage(thumbnailIndex)"
            >
              <NuxtImg
                :src="thumbnail.url"
                :alt="thumbnail.alt"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          </div>
        </section>

        <section class="flex flex-col gap-5 px-2">
          <div>
            <UBreadcrumb
              :items="breadcrumbs"
              :ui="{
                root: 'mb-4',
                list: 'flex items-center gap-1 min-w-0',
                item: 'shrink-0 last:flex-1 last:min-w-0',
                link: 'text-xs md:text-sm hover:text-primary aria-[current=page]:pointer-events-none',
                linkLabel: 'block whitespace-nowrap overflow-hidden text-ellipsis truncate aria-[current=page]:font-medium',
                separator: 'mx-1 text-gray-400'
              }"
              class="hidden md:block"
            />

            <h1
              class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl"
              v-text="product?.title"
            />

            <p
              v-if="product?.brand_name"
              class="mt-2 text-sm text-muted"
              v-text="product?.brand_name"
            />

            <div
              class="mt-4 text-3xl font-black text-primary"
              v-text="formattedPrice"
            />
          </div>

          <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-toned">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-wallet"
                class="size-4 text-primary"
              />

              <span>Sem pagamento online</span>
            </div>

            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-shirt"
                class="size-4 text-primary"
              />

              <span>Experimente primeiro</span>
            </div>

            <div class="flex items-center gap-2">
              <UIcon
                name="i-simple-icons-whatsapp"
                class="size-4 text-primary"
              />

              <span>Decida na hora</span>
            </div>
          </div>

          <UCard>
            <div>
              <div
                v-if="variantOptions.length > 1"
                class="mb-3"
              >
                <div class="mb-2 flex items-center justify-between gap-3">
                  <div class="text-sm font-semibold text-highlighted">
                    Cor
                  </div>

                  <div
                    class="text-sm text-muted"
                    v-text="selectedVariantLabel"
                  />
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="variantOption in variantOptions"
                    :key="variantOption.id"
                    :class="selectedVariantId === variantOption.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-gray-200 hover:border-primary/50'"
                    type="button"
                    class="relative size-14 overflow-hidden rounded-2xl border transition"
                    @click="selectedVariantId = variantOption.id"
                  >
                    <NuxtImg
                      :src="variantOption.url"
                      :alt="`${productName} - cor ${variantOption.label}`"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                </div>
              </div>

              <div v-if="sizeOptions.length">
                <div class="mb-2 text-sm font-semibold text-highlighted">
                  Tamanho
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="sizeOption in sizeOptions"
                    :key="sizeOption.id"
                    :class="selectedSizeId === sizeOption.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white hover:border-primary/50'"
                    type="button"
                    class="inline-flex min-w-12 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
                    @click="selectedSizeId = sizeOption.id"
                  >
                    {{ sizeOption.label }}

                    <UBadge
                      v-if="sizeOption.inCartQty > 0"
                      :label="String(sizeOption.inCartQty)"
                      size="xs"
                      variant="solid"
                    />
                  </button>
                </div>

                <p
                  v-if="selectedSizeOption?.isLowStock"
                  class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-600"
                >
                  <UIcon
                    name="i-lucide-flame"
                    class="size-3.5"
                  />

                  {{ lowStockText(selectedSizeOption.stock) }}
                </p>

                <p
                  v-if="!selectedSizeId"
                  class="mt-2 text-sm text-red-600"
                >
                  Escolha um tamanho
                </p>
              </div>

              <div class="hidden space-y-3 sm:block mt-3">
                <div
                  v-if="selectedSkuQuantity > 0"
                  class="space-y-3"
                >
                  <div class="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                    <UButton
                      :disabled="!selectedSkuKey"
                      variant="outline"
                      @click="decrement(selectedSkuKey)"
                    >
                      −
                    </UButton>

                    <div class="flex-1 text-center">
                      <div class="text-xs text-muted">
                        Selecionado
                      </div>

                      <div
                        class="text-xl font-bold text-highlighted"
                        v-text="selectedSkuQuantity"
                      />
                    </div>

                    <UButton
                      :disabled="!selectedSkuKey"
                      variant="outline"
                      @click="increment(selectedSkuKey)"
                    >
                      +
                    </UButton>
                  </div>

                  <UButton
                    :to="cartTo"
                    size="xl"
                    color="primary"
                    class="w-full justify-center"
                  >
                    Ver selecionados
                  </UButton>
                </div>

                <UButton
                  v-else
                  :disabled="!selectedSizeId"
                  size="xl"
                  color="primary"
                  class="w-full justify-center"
                  @click="addProductToCart"
                >
                  {{ selectedSizeId ? "Escolher" : "Escolha um tamanho" }}
                </UButton>
              </div>
            </div>
          </UCard>

          <UCard v-if="product?.description">
            <h2 class="text-base font-bold text-highlighted">
              Descrição
            </h2>

            <p
              class="mt-3 text-sm leading-7 text-toned"
              v-text="product.description"
            />
          </UCard>

          <UCard class="border-primary/20 bg-primary/5">
            <h2 class="text-base font-bold text-highlighted">
              Como funciona
            </h2>

            <div class="mt-4 space-y-3">
              <div
                v-for="(purchaseStep, stepIndex) in purchaseFlowSteps"
                :key="purchaseStep.title"
                class="flex gap-3"
              >
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                  v-text="stepIndex + 1"
                />

                <div>
                  <div
                    class="text-sm font-semibold text-highlighted"
                    v-text="purchaseStep.title"
                  />

                  <div
                    class="text-sm leading-6 text-muted"
                    v-text="purchaseStep.description"
                  />
                </div>
              </div>
            </div>
          </UCard>

          <UCard v-if="false">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-base font-bold text-highlighted">
                  Pontos para experimentar
                </h2>

                <p class="mt-1 text-sm text-muted">
                  Escolha online e experimente no ponto mais conveniente.
                </p>
              </div>

              <div class="grid gap-2 sm:flex">
                <UButton
                  :to="{ name: 'pickup-points' }"
                  variant="outline"
                  size="xl"
                  icon="i-lucide-map-pin"
                  class="justify-center"
                >
                  <span class="sm:hidden">Ver pontos</span>
                </UButton>

                <UButton
                  :to="whatsappHref"
                  size="xl"
                  target="_blank"
                  icon="i-simple-icons-whatsapp"
                  class="justify-center"
                >
                  <span class="sm:hidden">Falar no WhatsApp</span>
                </UButton>
              </div>
            </div>
          </UCard>
        </section>
      </div>

      <section
        v-if="recommendedProducts.length"
        class="mt-10"
      >
        <h2 class="text-2xl font-black tracking-tight text-highlighted">
          Você também pode gostar
        </h2>

        <UBlogPosts
          class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4"
        >
          <UBlogPost
            v-for="recommendedProduct in recommendedProducts"
            :key="recommendedProduct.id"
            :title="recommendedProduct.title"
            :description="formatPrice(recommendedProduct.price)"
            :image="recommendedProduct.images?.[0]?.url || fallbackImage"
            :to="{ name: 'product-slug', params: { slug: recommendedProduct.slug } }"
            :ui="{
              root: 'group overflow-hidden border border-gray-100 rounded-2xl hover:shadow-md transition',
              header: 'aspect-[4/5] overflow-hidden bg-gray-50',
              image: 'h-full w-full object-cover transition duration-300 group-hover:scale-105',
              body: 'p-3',
              title: 'text-sm font-semibold text-highlighted line-clamp-2 min-h-[40px]',
              description: 'mt-2 text-sm font-bold text-primary'
            }"
            variant="outline"
            @click="trackRecommendationSelect(recommendedProduct)"
          >
            <template #badge>
              <div
                v-if="recommendedProduct.badges?.length"
                class="absolute left-2 top-2 flex flex-wrap gap-1"
              >
                <UBadge
                  v-for="badge in recommendedProduct.badges"
                  :key="badge"
                  :color="getProductBadgeColor(badge)"
                  variant="solid"
                >
                  {{ getProductBadgeLabel(badge) }}
                </UBadge>
              </div>
            </template>
          </UBlogPost>
        </UBlogPosts>
      </section>

      <UDrawer
        v-model:open="isCartDrawerOpen"
        :ui="{
          container: 'mx-auto max-w-6xl gap-3 sm:px-6 lg:px-8',
          body: 'p-0'
        }"
        title=" "
      >
        <span class="hidden" />

        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">
                Selecionado
              </div>

              <div
                class="text-xs text-muted"
                v-text="`${selectedSkuQuantity} item(s) selecionado(s)`"
              />
            </div>

            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              @click="closeCartDrawer"
            />
          </div>
        </template>

        <template #body>
          <div>
            <div class="flex gap-3">
              <div class="size-16 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                <NuxtImg
                  :src="galleryImages[0]?.url || fallbackImage"
                  :alt="productName"
                  class="h-full w-full object-cover"
                />
              </div>

              <div class="min-w-0 flex-1">
                <div
                  class="line-clamp-2 text-sm font-semibold"
                  v-text="productName"
                />

                <div
                  class="mt-1 text-sm font-bold text-primary"
                  v-text="formattedPrice"
                />
              </div>
            </div>

            <div class="mt-4 grid gap-2">
              <UButton
                :to="cartTo"
                size="xl"
                color="primary"
                class="w-full justify-center"
                @click="closeCartDrawer"
              >
                Ver selecionados
              </UButton>

              <UButton
                size="xl"
                color="neutral"
                variant="outline"
                class="w-full justify-center"
                @click="closeCartDrawer"
              >
                Continuar
              </UButton>
            </div>
          </div>
        </template>
      </UDrawer>

      <div class="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:hidden">
        <div class="mx-auto max-w-(--ui-container) px-1">
          <div class="mb-2 flex items-center justify-between gap-3">
            <div class="text-xs font-medium text-muted">
              {{ mobilePriceLabel }}
            </div>

            <div
              class="text-xl font-black text-primary"
              v-text="formattedMobilePrice"
            />
          </div>

          <div class="flex items-center gap-2">
            <UButton
              v-if="false"
              :to="whatsappHref"
              size="xl"
              color="success"
              icon="i-simple-icons-whatsapp"
              class="shrink-0"
            />

            <template v-if="selectedSkuQuantity > 0">
              <UButton
                :disabled="!selectedSkuKey"
                size="xl"
                variant="outline"
                @click="decrement(selectedSkuKey)"
              >
                −
              </UButton>

              <div
                class="min-w-0 flex-1 text-center text-base font-bold"
                v-text="selectedSkuQuantity"
              />

              <UButton
                :disabled="!selectedSkuKey"
                size="xl"
                variant="outline"
                @click="increment(selectedSkuKey)"
              >
                +
              </UButton>

              <UButton
                :to="cartTo"
                size="xl"
                color="primary"
              >
                Ver selecionados
              </UButton>
            </template>

            <template v-else>
              <UButton
                :disabled="!selectedSizeId"
                size="xl"
                color="primary"
                class="flex-1 justify-center"
                @click="addProductToCart"
              >
                {{ selectedSizeId ? "Escolher" : "Tamanho" }}
              </UButton>

              <UButton
                v-if="!isEmptyCart"
                :to="cartTo"
                size="xl"
                variant="outline"
              >
                Ver selecionados
              </UButton>
            </template>
          </div>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
