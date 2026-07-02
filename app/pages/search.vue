<script setup lang="ts">
import { getProductBadgeColor, getProductBadgeLabel } from '~/utils/productBadges';
import { useAnalyticsEvent } from '~/composables/useAnalyticsEvent';
import { formatPrice } from '~/utils/formatPrice';
import { makeGa4Item } from '~/utils/ga4';
import type { CatalogProductCard } from '#shared/types/catalog';


definePageMeta({ name: 'search' });

const title = 'Pesquisar produtos | Amoda';
const description = 'Pesquise roupa feminina na Amoda em Luanda. Escolha online, experimente primeiro e pague só o que gostar.';

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: 'noindex, follow' },
  ],
});

const route = useRoute();
const router = useRouter();

const PRODUCTS_PER_PAGE = 20;

const searchInput = ref(String(route.query.q ?? ''));
const submittedQuery = computed(() => String(route.query.q ?? '').trim());
const page = computed(() => Math.max(1, Number(route.query.page || 1)));

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(searchInput, (value) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);

  searchDebounceTimer = setTimeout(() => {
    router.replace({
      query: {
        ...route.query,
        q: value.trim() || undefined,
        page: undefined,
      },
    });
  }, 400);
});

const { data: searchResponse, pending: isSearchPending } = useFetch('/api/catalog/list', {
  query: {
    q: submittedQuery,
    page,
    limit: PRODUCTS_PER_PAGE,
  },
  watch: [submittedQuery, page],
  immediate: true,
});

const searchResults = computed(() => submittedQuery.value ? searchResponse.value?.items || [] : []);
const totalResults = computed(() => submittedQuery.value ? searchResponse.value?.total || 0 : 0);
const productSkeletons = Array.from({ length: 10 }, (_, index) => index);

const getPaginationTo = (pageNumber: number) => ({
  query: {
    ...route.query,
    page: pageNumber === 1 ? undefined : pageNumber,
  },
});

const { trackSelectItem } = useAnalyticsEvent();

const trackResultSelect = (product: CatalogProductCard) => {
  const variantId = Number(product.default_variant_id);
  const sizeId = Number(product.default_size_id);

  if (!variantId || !sizeId) return;

  trackSelectItem({
    listId: 'search_results',
    listName: 'Search results',
    items: [
      makeGa4Item({
        productId: product.id,
        name: product.title,
        brand: product.brand_name ?? undefined,
        price: product.price ?? 0,
        quantity: 1,
        variantId,
        sizeId,
        variantLabel: product.default_variant_color ?? undefined,
        sizeLabel: product.default_size_label ?? undefined,
      }),
    ],
  });
};

const searchInputRef = ref<any>(null);

onMounted(() => {
  if (!submittedQuery.value) {
    searchInputRef.value?.inputRef?.focus?.();
  }
});

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => `Olá! Estou à procura de: ${submittedQuery.value || 'uma peça'}. Podem ajudar?`);
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-6xl sm:px-6 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          Pesquisar
        </h1>

        <UInput
          ref="searchInputRef"
          v-model="searchInput"
          icon="i-lucide-search"
          size="xl"
          placeholder="Vestido, biquíni, conjunto..."
          autocomplete="off"
          class="mt-5 w-full sm:max-w-md"
          :loading="isSearchPending"
        />

        <p
          v-if="submittedQuery && !isSearchPending"
          class="mt-3 text-sm text-muted"
        >
          {{ totalResults }} {{ totalResults === 1 ? 'resultado' : 'resultados' }} para «{{ submittedQuery }}»
        </p>
      </section>

      <!-- Empty state: no query yet -->
      <section
        v-if="!submittedQuery"
        class="mt-6"
      >
        <UCard>
          <div class="flex flex-col items-center py-10 text-center">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UIcon
                name="i-lucide-search"
                class="size-7"
              />
            </div>

            <h2 class="mt-4 text-xl font-bold text-highlighted">
              O que procura hoje?
            </h2>

            <p class="mt-2 max-w-sm text-sm leading-6 text-muted">
              Digite o nome da peça — vestido, biquíni, conjunto — e veja o que temos para si.
            </p>
          </div>
        </UCard>
      </section>

      <!-- Loading skeletons -->
      <section
        v-else-if="isSearchPending"
        class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4"
      >
        <UCard
          v-for="skeletonIndex in productSkeletons"
          :key="skeletonIndex"
          :ui="{ body: 'sm:p-3' }"
          class="overflow-hidden border border-gray-100"
        >
          <USkeleton class="aspect-[4/5] w-full rounded-t-lg" />

          <div class="space-y-3 pt-3">
            <USkeleton class="h-4 w-full" />

            <USkeleton class="h-5 w-24" />
          </div>
        </UCard>
      </section>

      <!-- No results -->
      <UEmpty
        v-else-if="!searchResults.length"
        class="mt-6"
        icon="i-lucide-search-x"
        title="Nenhum resultado encontrado."
        :description="`Não encontrámos nada para «${submittedQuery}». Tente outra palavra ou fale connosco — podemos ajudar a encontrar.`"
      >
        <template #actions>
          <UButton
            :to="whatsappHref"
            target="_blank"
            color="success"
            icon="i-simple-icons-whatsapp"
          >
            Pedir ajuda no WhatsApp
          </UButton>

          <UButton
            :to="{ name: 'index' }"
            variant="soft"
          >
            Ver produtos
          </UButton>
        </template>
      </UEmpty>

      <!-- Results -->
      <section
        v-else
        class="mt-6"
      >
        <UBlogPosts class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4">
          <UBlogPost
            v-for="searchProduct in searchResults"
            :key="searchProduct.id"
            :title="searchProduct.title"
            :description="formatPrice(searchProduct.price)"
            :image="searchProduct.image || '/placeholder.webp'"
            :to="{ name: 'product-slug', params: { slug: searchProduct.slug } }"
            :ui="{
              root: 'group overflow-hidden border border-gray-100 rounded-2xl hover:shadow-md transition',
              header: 'aspect-[4/5] overflow-hidden bg-gray-50',
              image: 'h-full w-full object-cover transition duration-300 group-hover:scale-105',
              body: 'sm:p-3',
              title: 'text-sm font-semibold text-highlighted line-clamp-2 min-h-[40px]',
              description: 'mt-2 text-sm font-bold text-primary'
            }"
            variant="outline"
            @click="trackResultSelect(searchProduct)"
          >
            <template #badge>
              <div
                v-if="searchProduct.badges?.length"
                class="absolute left-2 top-2 flex flex-wrap gap-1"
              >
                <UBadge
                  v-for="badge in searchProduct.badges"
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

        <div
          v-if="totalResults > PRODUCTS_PER_PAGE"
          class="mt-8 flex justify-center"
        >
          <UPagination
            :page="page"
            :itemsPerPage="PRODUCTS_PER_PAGE"
            :total="totalResults"
            :to="getPaginationTo"
          />
        </div>
      </section>
    </UPageBody>

    <WhatsappButton
      :to="whatsappHref"
      aria-label="Falar com a Amoda no WhatsApp"
    />
  </UPage>
</template>
