<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { useOffices } from '~/composables/useOffices';
import { CONTACT_PHONE } from '~/constants/contacts';
import { makeGa4Item } from '~/utils/ga4';


definePageMeta({ name: 'product-slug' });

const { t, tm, rt } = useI18n();
const route = useRoute();
const requestURL = useRequestURL();
const localeRoute = useLocaleRoute();

const { trackViewItem, trackSelectItem } = useAnalyticsEvent();

// ===== PRODUCT FETCH =====
const { data: productResponse, error: productError } = await useFetch('/api/catalog/item', {
  query: { slug: route.params.slug },
  watch: [() => route.fullPath],
});

if (productError.value || !productResponse.value) {
  throw createError({ statusCode: 404 });
}

const productData = computed(() => productResponse.value?.product);
const productTitle = computed(() => productData.value?.title || '');

const breadcrumbs = computed(() =>
  (productResponse.value?.breadcrumbs || []).map((crumb: any) => ({
    label: crumb.label,
    to: localeRoute(crumb.to),
  })),
);

const recItems = computed(() => productResponse.value?.recommendations || []);

// ===== VARIANTS / SIZES =====
const productVariants = computed(() => productData.value?.variants || []);

const selectedVariantId = ref<number | null>(null);
const selectedSizeId = ref<number | null>(null);

const currentVariant = computed(
  () => productVariants.value.find(v => v.id === selectedVariantId.value) || productVariants.value[0] || null,
);

watch(
  productData,
  (product) => {
    if (!product?.variants?.length) return;

    selectedVariantId.value = product.variants[0].id;
    selectedSizeId.value = product.variants[0].sizes?.[0]?.id ?? null;
  },
  { immediate: true },
);

watch(selectedVariantId, () => {
  selectedSizeId.value = currentVariant.value?.sizes?.[0]?.id ?? null;
});

const selectedVariantLabel = computed(() => currentVariant.value?.color || '—');

const variantOptions = computed(() =>
  productVariants.value.map((variant: any) => ({
    id: variant.id,
    url: variant.images?.[0]?.url || productData.value?.images?.[0]?.url || '/placeholder.webp',
    label: variant.color || '—',
  })),
);

// ===== local cart key (same format as useCart) =====
const makeKey = (productId: number, variantId: number, sizeId: number) => `p${productId}-v${variantId}-s${sizeId}`;

// ===== GALLERY =====
const galleryImages = computed(() => {
  const variantImages = currentVariant.value?.images || [];
  const productImages = productData.value?.images || [];

  return [...(variantImages.length ? variantImages : productImages)].sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0));
});

const hasGalleryImages = computed(() => (galleryImages.value?.length || 0) > 0);

// ===== CAROUSEL (Nuxt UI) =====
const carousel = useTemplateRef('carousel');
const activeIndex = ref(0);

const carouselItems = computed(() => {
  const imgs = galleryImages.value || [];

  return imgs.map((img: any, idx: number) => ({
    url: img.url,
    alt: t('product.seo.thumbAlt', { title: productTitle.value, index: idx + 1 }),
    idx,
  }));
});

watch(
  carouselItems,
  () => {
    activeIndex.value = 0;
    carousel.value?.emblaApi?.scrollTo(0);
  },
  { flush: 'post' },
);

function onClickPrev() {
  activeIndex.value = Math.max(0, activeIndex.value - 1);
}

function onClickNext() {
  activeIndex.value = Math.min(carouselItems.value.length - 1, activeIndex.value + 1);
}

function onSelect(index: number) {
  activeIndex.value = index;
}

function select(index: number) {
  activeIndex.value = index;
  carousel.value?.emblaApi?.scrollTo(index);
}

// ===== PRICE =====
const formattedPriceAOA = computed(() => {
  const price = currentVariant.value?.price ?? productData.value?.price ?? 0;

  return `${new Intl.NumberFormat('pt-AO').format(price)} AOA`;
});

// ===== CART =====
const { add: addToCart, getQty, increment, decrement, isEmpty: isEmptyCart } = useCart();

const canAdd = computed(() => !!selectedSizeId.value);

const currentSkuQty = computed(() => {
  const p = productData.value;
  const v = currentVariant.value;
  const sid = selectedSizeId.value;

  if (!p?.id || !v?.id || !sid) return 0;

  return getQty(p.id, v.id, sid);
});

const currentSkuKey = computed(() => {
  const p = productData.value;
  const v = currentVariant.value;
  const sid = selectedSizeId.value;

  if (!p?.id || !v?.id || !sid) return '';

  return makeKey(p.id, v.id, sid);
});

// size options с “в корзине”
const sizeOptions = computed(() =>
  (currentVariant.value?.sizes || []).map((size: any) => {
    const p = productData.value;
    const v = currentVariant.value;
    const inCartQty = p?.id && v?.id ? getQty(p.id, v.id, size.id) : 0;

    return {
      id: size.id,
      label: size.size,
      inCartQty,
    };
  }),
);

// ===== MINI CART (Drawer) =====
const cartDrawerOpen = ref(false);

const cartPageTo = computed(() => localeRoute({ name: 'cart' }));

const openCartDrawer = () => {
  cartDrawerOpen.value = true;
};

const closeCartDrawer = () => {
  cartDrawerOpen.value = false;
};

const addProductToCart = () => {
  const product = productData.value;
  const variant = currentVariant.value;
  const selectedSize = variant?.sizes?.find((s: any) => s.id === selectedSizeId.value);

  if (!product || !variant || !selectedSize) return;

  addToCart(product, variant, selectedSize, 1);
  openCartDrawer();
};

// ===== ANALYTICS (GA4 ecommerce) =====
const selectedSizeObj = computed(() =>
  currentVariant.value?.sizes?.find((s: any) => s.id === selectedSizeId.value) || null,
);

watch(
  () => [productData.value?.id, currentVariant.value?.id, selectedSizeId.value] as const,
  ([pid, vid, sid]) => {
    if (!import.meta.client) {
      return;
    }

    const product = productData.value;
    const variant = currentVariant.value;

    if (!pid || !product || !variant) {
      return;
    }

    // size обязателен, но на первом рендере может быть null — не шлём пока не выберется
    if (!sid) {
      return;
    }

    const size = selectedSizeObj.value;

    if (!size) {
      return;
    }

    trackViewItem({
      items: [
        makeGa4Item({
          productId: product.id,
          name: product.title,
          brand: product.brand_name,
          price: variant.price ?? 0,
          quantity: 1,
          variantId: variant.id,
          sizeId: size.id,
          variantLabel: variant.color ?? undefined,
          sizeLabel: size.size ?? String(size.id),
          categoryName: product.primary_category_id ? String(product.primary_category_id) : undefined,
        }),
      ],
    });
  },
  { immediate: true },
);

const sendSelectProductEvent = (product: any) => {
  const v = product?.variants?.[0] ?? null;
  const s = v?.sizes?.[0] ?? null;

  if (!v?.id || !s?.id) {
    return;
  }

  trackSelectItem({
    listId: 'recommendations',
    listName: 'Recommendations',
    items: [
      makeGa4Item({
        productId: product.id,
        name: product.title,
        brand: product.brand_name,
        price: v.price ?? product.price ?? 0,
        quantity: 1,
        variantId: v.id,
        sizeId: s.id,
        variantLabel: v.color ?? undefined,
        sizeLabel: s.size ?? String(s.id),
        categoryName: product.primary_category_id ? String(product.primary_category_id) : undefined,
      }),
    ],
  });
};

// ===== WHATSAPP =====
const productFullUrl = computed(() => {
  const localized = localeRoute({ name: 'product-slug', params: { slug: productData.value?.slug } });
  const path = localized?.fullPath || '/';

  return new URL(path, requestURL.origin).href;
});

const whatsappHref = computed(() => {
  const text = encodeURIComponent(
    `Olá! Tenho uma dúvida sobre este produto:\n${productTitle.value}\n${productFullUrl.value}`,
  );

  return `https://wa.me/${CONTACT_PHONE}?text=${text}`;
});

// ===== OFFICES (PICKUP POINTS) =====
const { offices, pending: officesPending, load: loadOffices } = useOffices();

onMounted(() => {
  loadOffices();
});

const topOffices = computed(() => (offices.value || []).slice(0, 3));
const officesPageTo = computed(() => localeRoute({ name: 'pickup-points' }));

// ===== SEO =====
const seoTitle = computed(() => `${productData.value?.title || ''} | ${t('product.meta.titleSuffix')}`);
const seoDescription = computed(() => productData.value?.description || t('product.meta.description'));
const seoImage = computed(() => galleryImages.value?.[0]?.url || '/placeholder.webp');

const productSchema = computed(() => ({
  '@context': 'https://schema.org/',
  '@type': 'Product',
  name: productData.value?.title,
  image: galleryImages.value.map((img: any) => img.url),
  description: productData.value?.description || '',
  sku: productData.value?.variants?.[0]?.id || productData.value?.id,
  brand: { '@type': 'Brand', name: productData.value?.brand_name || '' },
  offers: {
    '@type': 'Offer',
    url: productFullUrl.value,
    priceCurrency: 'AOA',
    price: currentVariant.value?.price ?? productData.value?.price ?? 0,
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
  },
}));

const breadcrumbSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.value.map((item: any, index: number) => ({
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
  link: [{ rel: 'canonical', href: productFullUrl.value }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(productSchema.value) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema.value) },
  ],
}));
</script>

<i18n lang="json">
{
  "pt": {
    "offices": {
      "title": "Pontos para experimentar"
    },
    "product": {
      "price": "Preço",
      "size": "Tamanho",
      "color": "Cor",
      "add": "Adicionar",
      "description": "Descrição",
      "brand": "Marca",
      "meta": {
        "titleSuffix": "Amoda Angola",
        "description": "Reserve grátis na Amoda: escolha o tamanho, confirme no WhatsApp e venha experimentar no ponto. Sem pagamento online."
      },
      "ui": {
        "chooseSize": "Escolha um tamanho para reservar",
        "howReceiveTitle": "Como funciona",
        "pickupCta": "Ver todos os pontos",
        "supportCta": "Perguntar no WhatsApp",
        "ctaNote": "Reserva grátis • Prova no ponto • Você decide na hora",
        "addToCart": "Reservar para experimentar",
        "addToCartShort": "Reservar",
        "inCart": "Reservado",
        "inCartShort": "reservado {qty}",
        "checkout": "Finalizar",
        "continueShopping": "Continuar"
      },
      "cartNudge": {
        "title": "Reservado",
        "subtitle": "{qty} un. reservada(s)",
        "checkout": "Ver reserva",
        "continue": "Continuar"
      },
      "howReceive": {
        "items": [
          {
            "title": "Reserve em 10 segundos",
            "desc": "Escolha cor e tamanho e reserve — sem pagamento."
          },
          {
            "title": "Experimente no ponto",
            "desc": "Nós preparamos os itens para você experimentar."
          },
          {
            "title": "Você decide na hora",
            "desc": "Leve só o que gostar. Sem compromisso."
          }
        ]
      },
      "seo": {
        "imageMainAlt": "{title} — imagem principal",
        "thumbAlt": "{title} — foto {index}",
        "variantAlt": "{title} — cor {color}"
      },
      "reco": {
        "title": "Você também pode gostar"
      }
    }
  },
  "en": {
    "offices": {
      "title": "Try-on points"
    },
    "product": {
      "price": "Price",
      "size": "Size",
      "color": "Color",
      "add": "Add",
      "description": "Description",
      "brand": "Brand",
      "meta": {
        "titleSuffix": "Amoda Angola",
        "description": "Free reservation at Amoda: pick your size, confirm on WhatsApp, and come try on at the pickup point. No online payment."
      },
      "ui": {
        "chooseSize": "Choose a size to reserve",
        "howReceiveTitle": "How it works",
        "pickupCta": "View all points",
        "supportCta": "Ask on WhatsApp",
        "ctaNote": "Free reservation • Try at the point • You decide on the spot",
        "addToCart": "Reserve to try on",
        "addToCartShort": "Reserve",
        "inCart": "Reserved",
        "inCartShort": "reserved {qty}",
        "checkout": "Checkout",
        "continueShopping": "Continue"
      },
      "cartNudge": {
        "title": "Reserved",
        "subtitle": "{qty} item(s) reserved",
        "checkout": "View reservation",
        "continue": "Continue"
      },
      "howReceive": {
        "items": [
          {
            "title": "Reserve in 10 seconds",
            "desc": "Pick color and size and reserve — no payment."
          },
          {
            "title": "Try on at the point",
            "desc": "We’ll prepare the items for fitting."
          },
          {
            "title": "Decide on the spot",
            "desc": "Take only what you like. No obligation."
          }
        ]
      },
      "seo": {
        "imageMainAlt": "{title} — main image",
        "thumbAlt": "{title} — photo {index}",
        "variantAlt": "{title} — color {color}"
      },
      "reco": {
        "title": "You may also like"
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageBody>
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- LEFT: GALLERY -->
        <div class="flex-1 w-full">
          <div class="relative w-full">
            <UCarousel
              v-if="hasGalleryImages"
              ref="carousel"
              v-slot="{ item }"
              fade
              loop
              :items="carouselItems"
              :prev="{ onClick: onClickPrev }"
              :next="{ onClick: onClickNext }"
              class="w-full overflow-hidden"
              :ui="{
                container: 'flex w-full ms-0',
                item: 'basis-full shrink-0 ps-0'
              }"
              @select="onSelect"
            >
              <div class="w-full aspect-[4/5] overflow-hidden rounded-2xl bg-gray-50">
                <NuxtImg
                  :src="item.url"
                  :alt="item.alt"
                  class="w-full h-full object-cover"
                />
              </div>
            </UCarousel>

            <!-- FALLBACK -->
            <div
              v-else
              class="relative w-full aspect-[4/5] overflow-hidden rounded-2xl bg-gray-50"
            >
              <NuxtImg
                src="/placeholder.webp"
                :alt="t('product.seo.imageMainAlt', { title: productTitle })"
                class="object-cover w-full h-full"
              />
            </div>

            <!-- MOBILE COUNTER -->
            <div
              v-if="hasGalleryImages"
              class="absolute bottom-3 right-3 lg:hidden bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm"
            >
              {{ activeIndex + 1 }} / {{ carouselItems.length }}
            </div>
          </div>

          <!-- THUMBNAILS (DESKTOP) -->
          <div
            v-if="hasGalleryImages && carouselItems.length > 1"
            class="flex gap-2 pt-4 overflow-x-auto hidden md:flex"
          >
            <button
              v-for="(thumb, index) in carouselItems"
              :key="thumb.idx"
              type="button"
              class="size-11 flex-none rounded-lg overflow-hidden border transition-opacity"
              :class="activeIndex === index
                ? 'opacity-100 border-primary'
                : 'opacity-40 border-gray-200 hover:opacity-100'"
              @click="select(index)"
            >
              <NuxtImg
                :src="thumb.url"
                :alt="thumb.alt"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          </div>
        </div>

        <!-- RIGHT: INFO -->
        <div class="flex flex-col gap-6">
          <!-- Breadcrumbs + H1 -->
          <div class="space-y-2">
            <UBreadcrumb
              :items="breadcrumbs"
              class="hidden md:block"
              :ui="{
                root: 'mb-4 hidden md:block',
                list: 'flex items-center gap-1 min-w-0',
                item: 'shrink-0 last:flex-1 last:min-w-0',
                link: 'text-xs md:text-sm hover:text-primary-600 aria-[current=page]:pointer-events-none',
                linkLabel: 'block whitespace-nowrap overflow-hidden text-ellipsis truncate aria-[current=page]:font-medium',
                separator: 'mx-1 text-gray-400'
              }"
            />

            <h1 class="text-2xl md:text-3xl font-semibold tracking-tight">
              {{ productData?.title }}
            </h1>

            <div class="text-sm text-gray-500">
              {{ productData?.brand_name || '—' }}
            </div>
          </div>

          <!-- Price -->
          <div>
            <div class="text-xs uppercase text-gray-500">
              {{ t('product.price') }}
            </div>

            <div class="text-3xl font-bold text-primary">
              {{ formattedPriceAOA }}
            </div>
          </div>

          <!-- Color -->
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
                  :alt="t('product.seo.variantAlt', { title: productTitle, color: variantOption.label })"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            </div>
          </div>

          <!-- Size -->
          <div v-if="sizeOptions.length">
            <div class="text-sm font-medium mb-2">
              {{ t('product.size') }}
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="sizeOption in sizeOptions"
                :key="sizeOption.id"
                type="button"
                class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
                :class="selectedSizeId === sizeOption.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-400'"
                @click="selectedSizeId = sizeOption.id"
              >
                <span class="font-medium">{{ sizeOption.label }}</span>

                <UBadge
                  v-if="sizeOption.inCartQty > 0"
                  size="xs"
                  variant="solid"
                  :label="t('product.ui.inCartShort', { qty: sizeOption.inCartQty })"
                />
              </button>
            </div>

            <div
              v-if="!selectedSizeId"
              class="text-sm text-red-600 mt-2"
            >
              {{ t('product.ui.chooseSize') }}
            </div>
          </div>

          <!-- CTA (smart) -->
          <div class="space-y-3 hidden sm:block">
            <!-- если SKU уже в корзине — показываем степпер -->
            <div
              v-if="canAdd && currentSkuQty > 0"
              class="flex flex-col gap-3"
            >
              <div class="flex items-center gap-3">
                <UButton
                  variant="outline"
                  class="shrink-0"
                  :disabled="!currentSkuKey"
                  @click="decrement(currentSkuKey)"
                >
                  −
                </UButton>

                <div class="flex-1 text-center">
                  <div class="text-sm text-gray-500">
                    {{ t('product.ui.inCart') }}
                  </div>

                  <div class="text-2xl font-semibold">
                    {{ currentSkuQty }}
                  </div>
                </div>

                <UButton
                  variant="outline"
                  class="shrink-0"
                  :disabled="!currentSkuKey"
                  @click="increment(currentSkuKey)"
                >
                  +
                </UButton>
              </div>

              <UButton
                size="xl"
                class="w-full justify-center uppercase"
                color="primary"
                :to="cartPageTo"
              >
                {{ t('product.ui.checkout') }}
              </UButton>
            </div>

            <!-- иначе обычная кнопка add -->
            <UButton
              v-else
              size="xl"
              color="primary"
              class="w-full justify-center uppercase"
              :disabled="!selectedSizeId"
              @click="addProductToCart"
            >
              <span>
                {{ selectedSizeId ? t('product.ui.addToCart') : t('product.ui.chooseSize') }}
              </span>

              <UBadge
                v-if="currentSkuQty > 0"
                class="ms-2"
                variant="solid"
                size="sm"
                :label="String(currentSkuQty)"
              />
            </UButton>

            <p class="text-xs text-gray-500 text-center">
              {{ t('product.ui.ctaNote') }}
            </p>
          </div>

          <!-- How receive (USP) -->
          <div class="rounded-2xl bg-gray-50 p-4">
            <div class="text-sm font-semibold mb-3">
              {{ t('product.ui.howReceiveTitle') }}
            </div>

            <div class="space-y-3">
              <div
                v-for="x in tm('product.howReceive.items')"
                :key="rt(x.title)"
                class="flex gap-3"
              >
                <div class="mt-1 w-2 h-2 rounded-full bg-primary" />

                <div>
                  <div class="text-sm font-medium">
                    {{ rt(x.title) }}
                  </div>

                  <div class="text-sm text-gray-600">
                    {{ rt(x.desc) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Pickup points preview -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="text-sm font-medium mb-2">
                {{ t('offices.title') }}
              </div>

              <div
                v-if="officesPending"
                class="text-sm text-gray-600"
              >
                ...
              </div>

              <div
                v-else
                class="space-y-2"
              >
                <div
                  v-for="o in topOffices"
                  :key="o.id"
                  class="text-sm text-gray-700"
                >
                  <div class="font-medium">
                    {{ o.name }}
                  </div>

                  <div class="text-gray-600">
                    {{ o.address }}
                  </div>
                </div>

                <UButton
                  variant="outline"
                  size="sm"
                  :to="officesPageTo"
                  class="mt-2"
                >
                  {{ t('product.ui.pickupCta') }}
                </UButton>
              </div>
            </div>

            <div class="mt-4">
              <UButton
                variant="ghost"
                :to="whatsappHref"
                target="_blank"
                icon="i-simple-icons-whatsapp"
                class="px-0"
              >
                {{ t('product.ui.supportCta') }}
              </UButton>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h2 class="text-lg font-semibold mb-2">
              {{ t('product.description') }}
            </h2>

            <p class="text-sm text-gray-700 leading-relaxed">
              {{ productData?.description || '—' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <UPageSection
        v-if="recItems.length"
        :title="t('product.reco.title')"
        :ui="{ title: 'text-md font-semibold' }"
        class="mt-10"
      >
        <UBlogPosts class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <UBlogPost
            v-for="item in recItems"
            :key="item.id"
            :title="item.title"
            :description="`${new Intl.NumberFormat('pt-AO').format(item.price)} AOA`"
            :image="item.images?.[0]?.url || '/placeholder.webp'"
            :to="localeRoute({ name: 'product-slug', params: { slug: item.slug } })"
            :ui="{ header: 'aspect-[4/5] object-cover', body: 'sm:p-3', title: 'line-clamp-2 overflow-hidden' }"
            variant="outline"
            @click="sendSelectProductEvent(item)"
          />
        </UBlogPosts>
      </UPageSection>

      <!-- Mini cart (Drawer) -->
      <UDrawer
        v-model:open="cartDrawerOpen"
        title=" "
        :ui="{
          header: 'px-0 pt-4 pb-0',
          body: 'p-0'
        }"
      >
        <span class="hidden" />

        <template #header>
          <div class="max-w-(--ui-container) mx-auto px-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold">
                  {{ t('product.cartNudge.title') }}
                </div>

                <div class="text-xs text-gray-600">
                  {{ t('product.cartNudge.subtitle', { qty: currentSkuQty }) }}
                </div>
              </div>

              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                @click="closeCartDrawer"
              />
            </div>
          </div>
        </template>

        <template #body>
          <div class="max-w-(--ui-container) mx-auto px-4 pb-5">
            <div class="flex gap-3">
              <div class="size-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                <NuxtImg
                  :src="galleryImages?.[0]?.url || '/placeholder.webp'"
                  :alt="productTitle"
                  class="w-full h-full object-cover"
                />
              </div>

              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium line-clamp-2">
                  {{ productTitle }}
                </div>

                <div class="text-xs text-gray-600 mt-1">
                  {{ formattedPriceAOA }}
                </div>
              </div>
            </div>

            <div class="mt-3 flex flex-col gap-2">
              <UButton
                color="primary"
                class="w-full justify-center uppercase"
                :to="cartPageTo"
                @click="closeCartDrawer"
              >
                {{ t('product.cartNudge.checkout') }}
              </UButton>

              <UButton
                color="neutral"
                variant="outline"
                class="w-full justify-center uppercase"
                @click="closeCartDrawer"
              >
                {{ t('product.cartNudge.continue') }}
              </UButton>
            </div>
          </div>
        </template>
      </UDrawer>

      <!-- Sticky bottom bar (mobile) -->
      <div class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 sm:hidden">
        <div class="max-w-(--ui-container) mx-auto px-4 flex gap-3 items-center">
          <UButton
            variant="outline"
            :to="whatsappHref"
            target="_blank"
            icon="i-simple-icons-whatsapp"
            class="shrink-0"
          />

          <!-- если SKU уже в корзине: степпер + checkout -->
          <template v-if="canAdd && currentSkuQty > 0">
            <div class="flex-1 flex items-center gap-2">
              <UButton
                variant="outline"
                class="shrink-0"
                :disabled="!currentSkuKey"
                @click="decrement(currentSkuKey)"
              >
                −
              </UButton>

              <div class="min-w-0 flex-1 text-center">
                <div class="text-xs text-gray-500 leading-none">
                  {{ t('product.ui.inCart') }}
                </div>

                <div class="text-base font-semibold leading-tight">
                  {{ currentSkuQty }}
                </div>
              </div>

              <UButton
                variant="outline"
                class="shrink-0"
                :disabled="!currentSkuKey"
                @click="increment(currentSkuKey)"
              >
                +
              </UButton>
            </div>

            <UButton
              color="primary"
              class="shrink-0 uppercase"
              :to="cartPageTo"
            >
              {{ t('product.ui.checkout') }}
            </UButton>
          </template>

          <!-- иначе: add + отдельный checkout -->
          <template v-else>
            <UButton
              color="primary"
              class="flex-1 justify-center uppercase"
              :disabled="!selectedSizeId"
              @click="addProductToCart"
            >
              {{ selectedSizeId ? isEmptyCart ? t('product.ui.addToCart') : t('product.ui.addToCartShort') : t('product.ui.chooseSize') }}
            </UButton>

            <UButton
              v-if="!isEmptyCart"
              variant="outline"
              class="shrink-0 uppercase"
              :to="cartPageTo"
            >
              {{ t('product.ui.checkout') }}
            </UButton>
          </template>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
