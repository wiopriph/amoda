<script setup lang="ts">
import type { ProductBadge } from '~/utils/productBadges';
import { formatPrice } from '~/utils/formatPrice';


definePageMeta({
  name: 'admin-products-edit',
  layout: 'admin',
  middleware: 'admin',
});

const title = 'Editar produto';
const description = 'Editar detalhes do produto';

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});

type Brand = {
  id: number | string
  name: string
};

type Category = {
  id: number | string
  name: string
};

type ProductImage = {
  url: string
};

type VariantSize = {
  id?: number
  'variant_id'?: number
  size: string
  stock: number
  msCode?: string | null
  sku?: string
};

type ProductVariant = {
  id: number
  'product_id'?: number | string
  color: string
  price: number
  active: boolean
  images?: ProductImage[]
  sizes?: VariantSize[]
};

type EditableProductVariant = Partial<ProductVariant> & {
  id?: number | string
};

type Product = {
  id: number | string
  title: string
  slug?: string
  brand_id?: number | string | null
  primary_category_id?: number | string | null
  description?: string | null
  active?: boolean
  badges?: ProductBadge[]
  variants?: ProductVariant[]
};

const route = useRoute();

const [
  { data: brandOptions },
  { data: categoryOptions },
  { data: product, refresh: refreshProduct },
] = await Promise.all([
  useFetch<Brand[]>('/api/admin/brands/list'),
  useFetch<Category[]>('/api/admin/categories/list'),
  useFetch<Product>(`/api/admin/products/${route.params.id}`),
]);

const brands = computed(() => brandOptions.value || []);
const categories = computed(() => categoryOptions.value || []);
const productTitle = computed(() => product.value?.title || title);
const productVariants = computed(() => product.value?.variants || []);
const productPublicTo = computed(() => product.value?.slug ? { name: 'product-slug', params: { slug: product.value.slug } } : undefined);

const toast = useToast();

const getOperationErrorText = (error: any, fallback: string) =>
  error?.data?.statusMessage || error?.data?.message || error?.message || fallback;

const saveProduct = async (productPayload: Product) => {
  try {
    await $fetch('/api/admin/products/save', { method: 'POST', body: productPayload });
    await refreshProduct();

    toast.add({
      title: 'Sucesso',
      description: 'Produto guardado com sucesso.',
      color: 'success',
    });
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: getOperationErrorText(error, 'Falha ao guardar produto. Tente novamente.'),
      color: 'error',
    });
  }
};

const isDeletingProduct = ref(false);

const deleteProduct = async () => {
  if (!product.value?.id || !confirm(`Delete product #${product.value.id}?`)) {
    return;
  }

  isDeletingProduct.value = true;

  try {
    const result = await $fetch<{ deleted: boolean; removedFiles: number; storageError?: string }>(
      '/api/admin/products/remove',
      {
        method: 'POST',
        body: { id: product.value.id },
      },
    );

    toast.add({
      title: result.storageError ? 'Produto eliminado' : 'Sucesso',
      description: result.storageError ?
        `Produto eliminado, mas falha ao remover ficheiros: ${result.storageError}` :
        'Produto eliminado com sucesso.',
      color: result.storageError ? 'warning' : 'success',
    });

    await navigateTo({ name: 'admin-products' });
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: getOperationErrorText(error, 'Falha ao eliminar produto. Tente novamente.'),
      color: 'error',
    });
  } finally {
    isDeletingProduct.value = false;
  }
};

const isVariantModalOpen = ref(false);
const selectedVariant = ref<EditableProductVariant>({});

const openCreateVariantModal = () => {
  selectedVariant.value = {
    id: '',
    'product_id': product.value?.id,
    color: '',
    price: 0,
    active: true,
  };

  isVariantModalOpen.value = true;
};

const openEditVariantModal = (variant: ProductVariant) => {
  selectedVariant.value = {
    ...variant,
    'product_id': product.value?.id,
  };

  isVariantModalOpen.value = true;
};

const saveVariant = async (variantPayload: ProductVariant) => {
  try {
    const isEditing = !!variantPayload.id;

    await $fetch('/api/admin/products/variants/save', { method: 'POST', body: variantPayload });
    await refreshProduct();
    isVariantModalOpen.value = false;

    toast.add({
      title: 'Sucesso',
      description: isEditing ? 'Variante atualizada com sucesso.' : 'Variante criada com sucesso.',
      color: 'success',
    });
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: getOperationErrorText(error, 'Falha ao guardar variante. Tente novamente.'),
      color: 'error',
    });
  }
};

const deleteVariant = async (variant: ProductVariant) => {
  if (!confirm(`Delete variant #${variant.id}?`)) {
    return;
  }

  try {
    await $fetch('/api/admin/products/variants/remove', { method: 'POST', body: { id: variant.id } });
    await refreshProduct();

    toast.add({
      title: 'Sucesso',
      description: 'Variante eliminada com sucesso.',
      color: 'success',
    });
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: getOperationErrorText(error, 'Falha ao eliminar variante. Tente novamente.'),
      color: 'error',
    });
  }
};

const isSizeModalOpen = ref(false);
const selectedSize = ref<Partial<VariantSize>>({});

const openCreateSizeModal = (variant: ProductVariant) => {
  const variantId = Number(variant.id);

  selectedSize.value = { 'variant_id': variantId, size: '', stock: 0, msCode: '', sku: '' };
  isSizeModalOpen.value = true;
};

const openEditSizeModal = (variant: ProductVariant, size: VariantSize) => {
  const variantId = Number(variant.id);

  selectedSize.value = { ...size, 'variant_id': size['variant_id'] ?? variantId };
  isSizeModalOpen.value = true;
};

const saveSize = async (sizePayload: VariantSize) => {
  try {
    const isEditing = !!sizePayload.id;

    await $fetch('/api/admin/products/variants/sizes/save', { method: 'POST', body: sizePayload });
    await refreshProduct();
    isSizeModalOpen.value = false;

    toast.add({
      title: 'Sucesso',
      description: isEditing ? 'Tamanho atualizado com sucesso.' : 'Tamanho criado com sucesso.',
      color: 'success',
    });
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: getOperationErrorText(error, 'Falha ao guardar tamanho. Tente novamente.'),
      color: 'error',
    });
  }
};

const pendingImageFilesByVariantId = reactive<Record<number, File[]>>({});

const setPendingImageFiles = (variantId: number, files: File[] = []) => {
  pendingImageFilesByVariantId[variantId] = files;
};

const uploadingImagesByVariantId = ref<Record<number, boolean>>({});

const uploadPendingImagesForVariant = async (variantId: number, clearFiles?: () => void) => {
  const imageFiles = (pendingImageFilesByVariantId[variantId] || []).slice();

  if (!imageFiles.length || !product.value?.id) {
    return;
  }

  uploadingImagesByVariantId.value[variantId] = true;

  try {
    const uploadForm = new FormData();

    uploadForm.append('product_id', String(product.value.id));
    uploadForm.append('variant_id', String(variantId));

    for (const imageFile of imageFiles) {
      uploadForm.append('files', imageFile);
    }

    await $fetch('/api/admin/products/upload', {
      method: 'POST',
      body: uploadForm,
    });

    clearFiles?.();
    setPendingImageFiles(variantId, []);
    await refreshProduct();

    toast.add({
      title: 'Sucesso',
      description: 'Imagens carregadas com sucesso.',
      color: 'success',
    });
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: getOperationErrorText(error, 'Falha ao carregar imagens. Tente novamente.'),
      color: 'error',
    });
  } finally {
    uploadingImagesByVariantId.value[variantId] = false;
  }
};
</script>

<template>
  <UPage>
    <UPageHeader
      :title="productTitle"
      :description="description"
    >
      <template #links>
        <UButton
          v-if="productPublicTo"
          :to="productPublicTo"
          target="_blank"
          variant="outline"
          icon="i-lucide-external-link"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard v-if="product">
        <AdminProductForm
          v-model="product"
          :brands="brands"
          :categories="categories"
          isEdit
          @save="saveProduct"
        />

        <UCard class="mt-8">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              Variantes
            </h3>

            <UButton
              icon="i-lucide-plus"
              color="primary"
              @click="openCreateVariantModal"
            >
              Adicionar
            </UButton>
          </div>

          <div
            v-if="productVariants.length"
            class="space-y-4"
          >
            <div
              v-for="variant in productVariants"
              :key="variant.id"
              class="rounded-md border border-gray-200 bg-gray-50 p-4"
            >
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-medium">
                    {{ variant.color || '—' }} — {{ formatPrice(variant.price) }}
                  </p>

                  <UBadge
                    v-if="!variant.active"
                    color="error"
                    variant="subtle"
                  >
                    Inativo
                  </UBadge>
                </div>

                <div class="flex gap-1.5">
                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-pen-line"
                    @click="openEditVariantModal(variant)"
                  />

                  <UButton
                    size="xs"
                    variant="ghost"
                    color="error"
                    icon="i-lucide-trash-2"
                    @click="deleteVariant(variant)"
                  />
                </div>
              </div>

              <div class="mt-3">
                <p class="mb-1 text-xs text-gray-500">
                  Tamanhos
                </p>

                <div class="flex flex-wrap items-center gap-1.5">
                  <UBadge
                    v-for="variantSize in variant.sizes || []"
                    :key="variantSize.id"
                    variant="soft"
                    :color="variantSize.msCode ? 'neutral' : 'warning'"
                    class="cursor-pointer transition hover:ring-1 hover:ring-primary/40"
                    @click="openEditSizeModal(variant, variantSize)"
                  >
                    <strong>{{ variantSize.size }}</strong> · {{ variantSize.stock || 0 }} · {{ variantSize.msCode || 'sem código' }}
                  </UBadge>

                  <UButton
                    variant="ghost"
                    icon="i-lucide-plus"
                    @click="openCreateSizeModal(variant)"
                  >
                    Adicionar
                  </UButton>
                </div>
              </div>

              <div class="mt-3">
                <p class="mb-1 text-xs text-gray-500">
                  Imagens
                </p>

                <div class="flex flex-wrap items-center gap-2">
                  <NuxtImg
                    v-for="variantImage in variant.images || []"
                    :key="variantImage.url"
                    :src="variantImage.url"
                    class="h-20 w-16 rounded border border-gray-200 object-cover"
                  />
                </div>

                <div class="mt-2">
                  <UFileUpload
                    v-model="pendingImageFilesByVariantId[variant.id]"
                    multiple
                    label="Drop your images here"
                    description="PNG, JPG or WEBP (max. 2MB)"
                    accept="image/*"
                  >
                    <template #files-bottom="{ files, removeFile }">
                      <div
                        v-if="files?.length"
                        class="mt-3 border border-gray-200 rounded-md p-3 bg-gray-50"
                      >
                        <div class="flex flex-wrap gap-2">
                          <div
                            v-for="(selectedFile, selectedFileIndex) in files"
                            :key="selectedFileIndex"
                            class="flex items-center gap-2 rounded border border-gray-200 bg-white px-2 py-1"
                          >
                            <span
                              class="max-w-48 truncate text-xs"
                              v-text="selectedFile.name"
                            />

                            <UButton
                              size="xs"
                              variant="ghost"
                              icon="i-lucide-x"
                              aria-label="remove file"
                              @click="removeFile(selectedFileIndex)"
                            />
                          </div>
                        </div>

                        <div class="mt-3 flex gap-2">
                          <UButton
                            variant="soft"
                            @click.stop.prevent="() => { removeFile(); setPendingImageFiles(variant.id, []); }"
                          >
                            Eliminar
                          </UButton>

                          <UButton
                            :disabled="!files?.length || uploadingImagesByVariantId[variant.id]"
                            :loading="uploadingImagesByVariantId[variant.id]"
                            color="primary"
                            @click.stop.prevent="() => uploadPendingImagesForVariant(variant.id, removeFile)"
                          >
                            Carregar
                          </UButton>
                        </div>
                      </div>
                    </template>
                  </UFileUpload>
                </div>
              </div>
            </div>
          </div>

          <p
            v-else
            class="text-sm text-gray-500"
          >
            Sem variantes
          </p>
        </UCard>

        <div class="mt-8 rounded-lg border border-error/30 bg-error/5 p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="text-sm font-semibold text-error">
                Eliminar produto
              </h3>

              <p class="mt-1 text-sm text-gray-600">
                Remove o produto, variantes, tamanhos, imagens e itens pendentes no carrinho.
              </p>
            </div>

            <UButton
              color="error"
              variant="soft"
              icon="i-lucide-trash-2"
              :loading="isDeletingProduct"
              :disabled="isDeletingProduct"
              @click="deleteProduct"
            >
              Eliminar produto
            </UButton>
          </div>
        </div>
      </UCard>
    </UPageBody>

    <AdminVariantModal
      v-model:open="isVariantModalOpen"
      :modelValue="selectedVariant"
      @save="saveVariant"
    />

    <AdminSizeModal
      v-model:open="isSizeModalOpen"
      :modelValue="selectedSize"
      @save="saveSize"
    />
  </UPage>
</template>
