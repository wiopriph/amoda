<script setup lang="ts">
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
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
      "title": "Pontos para experimentar",
      "subtitle": "Reserve online e experimente no ponto mais conveniente."
    },
    "product": {
      "price": "Preço",
      "size": "Tamanho",
      "color": "Cor",
      "description": "Descrição",
      "meta": {
        "titleSuffix": "Amoda Angola",
        "description": "Reserve grátis na Amoda: escolha o tamanho, confirme no WhatsApp e experimente no ponto."
      },
      "ui": {
        "chooseSize": "Escolha um tamanho",
        "addToCart": "Reservar para experimentar",
        "addToCartShort": "Reservar",
        "inCart": "Reservado",
        "checkout": "Ver reserva",
        "pickupCta": "Ver pontos",
        "supportCta": "Falar no WhatsApp",
        "ctaNote": {
          "wallet": "Sem pagamento online",
          "shirt": "Experimente primeiro",
          "whatsapp": "Decida na hora"
        },
        "howReceiveTitle": "Como funciona"
      },
      "cartNudge": {
        "title": "Reservado",
        "subtitle": "{qty} item(s) reservado(s)",
        "checkout": "Ver reserva",
        "continue": "Continuar"
      },
      "howReceive": {
        "items": [
          {
            "title": "Reserve em segundos",
            "desc": "Escolha o tamanho e reserve sem pagar."
          },
          {
            "title": "Experimente no ponto",
            "desc": "Veja ao vivo e experimente com calma."
          },
          {
            "title": "Decida na hora",
            "desc": "Leve só o que gostar."
          }
        ]
      },
      "seo": {
        "imageMainAlt": "{title} — imagem",
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
      "title": "Try-on points",
      "subtitle": "Reserve online and try it at the most convenient location."
    },
    "product": {
      "price": "Price",
      "size": "Size",
      "color": "Color",
      "description": "Description",
      "meta": {
        "titleSuffix": "Amoda Angola",
        "description": "Free reservation at Amoda: choose your size, confirm on WhatsApp and try before paying."
      },
      "ui": {
        "chooseSize": "Choose a size",
        "addToCart": "Reserve to try",
        "addToCartShort": "Reserve",
        "inCart": "Reserved",
        "checkout": "View reservation",
        "pickupCta": "View points",
        "supportCta": "Chat on WhatsApp",
        "ctaNote": {
          "wallet": "No online payment",
          "shirt": "Try first",
          "whatsapp": "Decide later"
        },
        "howReceiveTitle": "How it works"
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
            "title": "Reserve in seconds",
            "desc": "Choose size and reserve without paying."
          },
          {
            "title": "Try at the point",
            "desc": "See it in real life and try it on."
          },
          {
            "title": "Decide on the spot",
            "desc": "Take only what you like."
          }
        ]
      },
      "seo": {
        "imageMainAlt": "{title} — image",
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
        <section class="flex-1 w-full">
          <div class="relative overflow-hidden rounded-3xl bg-gray-50">
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
              <div class="aspect-[4/5] w-full overflow-hidden bg-gray-50">
                <NuxtImg
                  :src="item.url"
                  :alt="item.alt"
                  class="h-full w-full object-cover"
                />
              </div>
            </UCarousel>

            <div
              v-else
              class="aspect-[4/5] w-full overflow-hidden bg-gray-50"
            >
              <NuxtImg
                src="/placeholder.webp"
                :alt="t('product.seo.imageMainAlt', { title: productTitle })"
                class="h-full w-full object-cover"
              />
            </div>

            <div
              v-if="hasGalleryImages && carouselItems.length > 1"
              class="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm"
            >
              {{ activeIndex + 1 }} / {{ carouselItems.length }}
            </div>
          </div>

          <div
            v-if="hasGalleryImages && carouselItems.length > 1"
            class="mt-3 hidden gap-2 overflow-x-auto md:flex"
          >
            <button
              v-for="(thumb, index) in carouselItems"
              :key="thumb.idx"
              type="button"
              class="size-14 flex-none overflow-hidden rounded-xl border transition"
              :class="activeIndex === index
                ? 'border-primary opacity-100 ring-1 ring-primary'
                : 'border-gray-200 opacity-50 hover:opacity-100'"
              @click="select(index)"
            >
              <NuxtImg
                :src="thumb.url"
                :alt="thumb.alt"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          </div>
        </section>

        <!-- PRODUCT INFO -->
        <section class="flex flex-col gap-5 px-2">
          <div>
            <UBreadcrumb
              :items="breadcrumbs"
              class="hidden md:block"
              :ui="{
                root: 'mb-4',
                list: 'flex items-center gap-1 min-w-0',
                item: 'shrink-0 last:flex-1 last:min-w-0',
                link: 'text-xs md:text-sm hover:text-primary aria-[current=page]:pointer-events-none',
                linkLabel: 'block whitespace-nowrap overflow-hidden text-ellipsis truncate aria-[current=page]:font-medium',
                separator: 'mx-1 text-gray-400'
              }"
            />

            <h1 class="text-2xl font-black tracking-tight text-highlighted sm:text-3xl">
              {{ productData?.title }}
            </h1>

            <p
              v-if="productData?.brand_name"
              class="mt-1 text-sm text-muted"
            >
              {{ productData.brand_name }}
            </p>

            <div class="mt-4 text-3xl font-black text-primary">
              {{ formattedPriceAOA }}
            </div>
          </div>

          <!-- TRUST STRIP -->
          <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-toned">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-wallet"
                class="size-4 text-primary"
              />

              <span v-text="t('product.ui.ctaNote.wallet')" />
            </div>

            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-shirt"
                class="size-4 text-primary"
              />

              <span v-text="t('product.ui.ctaNote.shirt')" />
            </div>

            <div class="flex items-center gap-2">
              <UIcon
                name="i-simple-icons-whatsapp"
                class="size-4 text-primary"
              />

              <span v-text="t('product.ui.ctaNote.whatsapp')" />
            </div>
          </div>

          <!-- OPTIONS -->
          <UCard>
            <div class="space-y-5">
              <div v-if="variantOptions.length > 1">
                <div class="mb-2 flex items-center justify-between gap-3">
                  <div class="text-sm font-semibold text-highlighted">
                    {{ t('product.color') }}
                  </div>

                  <div class="text-sm text-muted">
                    {{ selectedVariantLabel }}
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="variantOption in variantOptions"
                    :key="variantOption.id"
                    type="button"
                    class="relative size-14 overflow-hidden rounded-2xl border transition"
                    :class="selectedVariantId === variantOption.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-gray-200 hover:border-primary/50'"
                    @click="selectedVariantId = variantOption.id"
                  >
                    <NuxtImg
                      :src="variantOption.url"
                      :alt="t('product.seo.variantAlt', { title: productTitle, color: variantOption.label })"
                      class="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                </div>
              </div>

              <div v-if="sizeOptions.length">
                <div class="mb-2 text-sm font-semibold text-highlighted">
                  {{ t('product.size') }}
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="sizeOption in sizeOptions"
                    :key="sizeOption.id"
                    type="button"
                    class="inline-flex min-w-12 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition"
                    :class="selectedSizeId === sizeOption.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-white hover:border-primary/50'"
                    @click="selectedSizeId = sizeOption.id"
                  >
                    {{ sizeOption.label }}

                    <UBadge
                      v-if="sizeOption.inCartQty > 0"
                      size="xs"
                      variant="solid"
                      :label="String(sizeOption.inCartQty)"
                    />
                  </button>
                </div>

                <p
                  v-if="!selectedSizeId"
                  class="mt-2 text-sm text-red-600"
                >
                  {{ t('product.ui.chooseSize') }}
                </p>
              </div>

              <!-- DESKTOP CTA -->
              <div class="hidden space-y-3 sm:block">
                <!-- если SKU уже в корзине — показываем степпер -->
                <div
                  v-if="canAdd && currentSkuQty > 0"
                  class="space-y-3"
                >
                  <div class="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                    <UButton
                      variant="outline"
                      :disabled="!currentSkuKey"
                      @click="decrement(currentSkuKey)"
                    >
                      −
                    </UButton>

                    <div class="flex-1 text-center">
                      <div class="text-xs text-muted">
                        {{ t('product.ui.inCart') }}
                      </div>

                      <div class="text-xl font-bold text-highlighted">
                        {{ currentSkuQty }}
                      </div>
                    </div>

                    <UButton
                      variant="outline"
                      :disabled="!currentSkuKey"
                      @click="increment(currentSkuKey)"
                    >
                      +
                    </UButton>
                  </div>

                  <UButton
                    size="xl"
                    color="primary"
                    class="w-full justify-center"
                    :to="cartPageTo"
                  >
                    {{ t('product.ui.checkout') }}
                  </UButton>
                </div>

                <UButton
                  v-else
                  size="xl"
                  color="primary"
                  class="w-full justify-center"
                  :disabled="!selectedSizeId"
                  @click="addProductToCart"
                >
                  {{ selectedSizeId ? t('product.ui.addToCart') : t('product.ui.chooseSize') }}
                </UButton>
              </div>
            </div>
          </UCard>

          <!-- DESCRIPTION -->
          <UCard v-if="productData?.description">
            <h2 class="text-base font-bold text-highlighted">
              {{ t('product.description') }}
            </h2>

            <p class="mt-3 text-sm leading-7 text-toned">
              {{ productData.description }}
            </p>
          </UCard>

          <!-- HOW IT WORKS -->
          <UCard class="border-primary/20 bg-primary/5">
            <h2 class="text-base font-bold text-highlighted">
              {{ t('product.ui.howReceiveTitle') }}
            </h2>

            <div class="mt-4 space-y-3">
              <div
                v-for="(x, index) in tm('product.howReceive.items')"
                :key="rt(x.title)"
                class="flex gap-3"
              >
                <div
                  class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
                >
                  {{ index + 1 }}
                </div>

                <div>
                  <div class="text-sm font-semibold text-highlighted">
                    {{ rt(x.title) }}
                  </div>

                  <div class="text-sm leading-6 text-muted">
                    {{ rt(x.desc) }}
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- PICKUP / SUPPORT -->
          <UCard>
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-base font-bold text-highlighted">
                  {{ t('offices.title') }}
                </h2>

                <p class="mt-1 text-sm text-muted">
                  {{ t('offices.subtitle') }}
                </p>
              </div>

              <div class="grid gap-2 sm:flex">
                <UButton
                  :to="officesPageTo"
                  variant="outline"
                  size="xl"
                  icon="i-lucide:map-pin"
                  class="justify-center"
                >
                  <span
                    class="sm:hidden"
                    v-text="t('product.ui.pickupCta')"
                  />
                </UButton>

                <UButton
                  :to="whatsappHref"
                  size="xl"
                  target="_blank"
                  icon="i-simple-icons-whatsapp"
                  class="justify-center"
                >
                  <span
                    class="sm:hidden"
                    v-text="t('product.ui.supportCta')"
                  />
                </UButton>
              </div>
            </div>
          </UCard>
        </section>
      </div>

      <!-- RECOMMENDATIONS -->
      <section
        v-if="recItems.length"
        class="mt-10"
      >
        <h2 class="text-2xl font-black tracking-tight text-highlighted">
          {{ t('product.reco.title') }}
        </h2>

        <UBlogPosts class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4">
          <UBlogPost
            v-for="item in recItems"
            :key="item.id"
            :title="item.title"
            :description="`${new Intl.NumberFormat('pt-AO').format(item.price)} AOA`"
            :image="item.images?.[0]?.url || '/placeholder.webp'"
            :to="localeRoute({ name: 'product-slug', params: { slug: item.slug } })"
            :ui="{
              root: 'group overflow-hidden border border-gray-100 rounded-2xl hover:shadow-md transition',
              header: 'aspect-[4/5] overflow-hidden bg-gray-50',
              image: 'h-full w-full object-cover transition duration-300 group-hover:scale-105',
              body: 'p-3',
              title: 'text-sm font-semibold text-highlighted line-clamp-2 min-h-[40px]',
              description: 'mt-2 text-sm font-bold text-primary'
            }"
            variant="outline"
            @click="sendSelectProductEvent(item)"
          />
        </UBlogPosts>
      </section>

      <!-- DRAWER -->
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
          <div class="mx-auto max-w-(--ui-container) px-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold">
                  {{ t('product.cartNudge.title') }}
                </div>

                <div class="text-xs text-muted">
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
          <div class="mx-auto max-w-(--ui-container) px-4 pb-5">
            <div class="flex gap-3">
              <div class="size-16 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                <NuxtImg
                  :src="galleryImages?.[0]?.url || '/placeholder.webp'"
                  :alt="productTitle"
                  class="h-full w-full object-cover"
                />
              </div>

              <div class="min-w-0 flex-1">
                <div class="line-clamp-2 text-sm font-semibold">
                  {{ productTitle }}
                </div>

                <div class="mt-1 text-sm font-bold text-primary">
                  {{ formattedPriceAOA }}
                </div>
              </div>
            </div>

            <div class="mt-4 grid gap-2">
              <UButton
                :to="cartPageTo"
                size="xl"
                color="primary"
                class="w-full justify-center"
                @click="closeCartDrawer"
              >
                {{ t('product.cartNudge.checkout') }}
              </UButton>

              <UButton
                size="xl"
                color="neutral"
                variant="outline"
                class="w-full justify-center"
                @click="closeCartDrawer"
              >
                {{ t('product.cartNudge.continue') }}
              </UButton>
            </div>
          </div>
        </template>
      </UDrawer>

      <!-- MOBILE STICKY CTA -->
      <div class="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-3 sm:hidden">
        <div class="mx-auto flex max-w-(--ui-container) items-center gap-2 px-1">
          <UButton
            :to="whatsappHref"
            size="xl"
            variant="outline"
            target="_blank"
            icon="i-simple-icons-whatsapp"
            class="shrink-0"
          />

          <template v-if="canAdd && currentSkuQty > 0">
            <UButton
              :disabled="!currentSkuKey"
              size="xl"
              variant="outline"
              @click="decrement(currentSkuKey)"
            >
              −
            </UButton>

            <div class="min-w-0 flex-1 text-center">
              <div class="text-xs text-muted">
                {{ t('product.ui.inCart') }}
              </div>

              <div class="text-base font-bold">
                {{ currentSkuQty }}
              </div>
            </div>

            <UButton
              :disabled="!currentSkuKey"
              size="xl"
              variant="outline"
              @click="increment(currentSkuKey)"
            >
              +
            </UButton>

            <UButton
              :to="cartPageTo"
              size="xl"
              color="primary"
            >
              {{ t('product.ui.checkout') }}
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
              {{ selectedSizeId ? t('product.ui.addToCartShort') : t('product.size') }}
            </UButton>

            <UButton
              v-if="!isEmptyCart"
              :to="cartPageTo"
              size="xl"
              variant="outline"
            >
              {{ t('product.ui.checkout') }}
            </UButton>
          </template>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
