<script setup lang="ts">
definePageMeta({ name: 'admin-products-edit', layout: 'admin', middleware: 'admin' });

const { t } = useI18n();

useHead(() => ({
  title: `${t('productEdit.title')} | Amoda Admin`,
  meta: [
    { name: 'description', content: t('productEdit.description') },
    { property: 'og:title', content: `${t('productEdit.title')} | Amoda Admin` },
    { property: 'og:description', content: t('productEdit.description') },
    { property: 'twitter:title', content: `${t('productEdit.title')} | Amoda Admin` },
    { property: 'twitter:description', content: t('productEdit.description') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const route = useRoute();

const { data: brands } = await useFetch('/api/admin/brands/list');
const { data: categories } = await useFetch('/api/admin/categories/list');
const { data: product, refresh } = await useFetch(`/api/admin/products/${route.params.id}`);

const saveProduct = async (p: any) => {
  await $fetch('/api/admin/products/save', { method: 'POST', body: p });
  await refresh();
};

const isVariantModalOpen = ref(false);
const currentVariant = ref<any>({});

const openNewVariant = () => {
  currentVariant.value = {
    id: '',
    product_id: product.value?.id,
    color: '',
    price: 0,
    active: true,
  };

  isVariantModalOpen.value = true;
};

const editVariant = (v: any) => {
  currentVariant.value = {
    ...v,
    product_id: product.value.id,
  };

  isVariantModalOpen.value = true;
};

const saveVariant = async (v: any) => {
  await $fetch('/api/admin/products/variants/save', { method: 'POST', body: v });

  await refresh();

  isVariantModalOpen.value = false;
};

const removeVariant = async (v: any) => {
  if (!confirm(`Delete variant #${v.id}?`)) {
    return;
  }

  await $fetch('/api/admin/products/variants/remove', { method: 'POST', body: { id: v.id } });
  await refresh();
};


const isSizeModalOpen = ref(false);
const currentVariantId = ref<number | null>(null);
const currentSize = ref<any>({});


const addSize = (variant: any) => {
  currentVariantId.value = variant.id;
  currentSize.value = { variant_id: variant.id, size: '', stock: 0, sku: '' };
  isSizeModalOpen.value = true;
};

const saveSize = async (s: any) => {
  await $fetch('/api/admin/products/variants/sizes/save', { method: 'POST', body: s });
  await refresh();
};

const removeSize = async (s: any) => {
  if (!confirm(`Delete size ${s.size}?`)) return;

  await $fetch('/api/admin/products/variants/sizes/remove', { method: 'POST', body: { id: s.id } });
  await refresh();
};

const pendingFiles = reactive<Record<number, File[]>>({});

const setPendingFiles = (variantId: number, files: File[] = []) => {
  pendingFiles[variantId] = files;
};

const uploading = ref<Record<number, boolean>>({});

const uploadPendingForVariant = async (variantId: number, clear?: () => void) => {
  const files = (pendingFiles[variantId] || []).slice();

  if (!files.length || !product?.value?.id) return;

  uploading.value[variantId] = true;

  try {
    const form = new FormData();

    form.append('product_id', String(product.value.id));
    form.append('variant_id', String(variantId));

    for (const f of files) {
      form.append('files', f);
    }

    await $fetch('/api/admin/products/upload', {
      method: 'POST',
      body: form,
    });

    clear?.();
    setPendingFiles(variantId, []);
    await refresh();
  } finally {
    uploading.value[variantId] = false;
  }
};


const fmtPrice = (val?: number | null) => (val ? `${new Intl.NumberFormat('pt-AO').format(val)} AOA` : '—');
</script>

<i18n lang="json">
{
  "en": {
    "productEdit": {
      "title": "Edit product",
      "description": "Edit product details",
      "variants": "Variants",
      "noVariants": "No variants yet",
      "sizes": "Sizes",
      "images": "Images"
    },
    "common": {
      "add": "Add",
      "edit": "Edit",
      "delete": "Delete",
      "inactive": "Inactive",
      "upload": "Upload"
    }
  },
  "pt": {
    "productEdit": {
      "title": "Editar produto",
      "description": "Editar detalhes do produto",
      "variants": "Variantes",
      "noVariants": "Sem variantes",
      "sizes": "Tamanhos",
      "images": "Imagens"
    },
    "common": {
      "add": "Adicionar",
      "edit": "Editar",
      "delete": "Eliminar",
      "inactive": "Inativo",
      "upload": "Carregar"
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="product?.title || t('productEdit.title')"
      :description="t('productEdit.description')"
    />

    <UPageBody>
      <UCard v-if="product">
        <AdminProductForm
          v-model="product"
          isEdit
          :brands="brands || []"
          :categories="categories || []"
          @save="saveProduct"
        />

        <UCard class="mt-8">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-lg">
              {{ t('productEdit.variants') }}
            </h3>

            <UButton
              icon="i-lucide-plus"
              color="primary"
              @click="openNewVariant"
            >
              {{ t('common.add') }}
            </UButton>
          </div>

          <div
            v-if="product?.variants?.length"
            class="space-y-4"
          >
            <div
              v-for="variant in product.variants"
              :key="variant.id"
              class="border border-gray-200 rounded-md p-4 bg-gray-50"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium">
                    {{ variant.color || '—' }} — {{ fmtPrice(variant.price) }}
                  </p>

                  <UBadge
                    v-if="!variant.active"
                    color="error"
                    variant="subtle"
                  >
                    {{ t('common.inactive') }}
                  </UBadge>
                </div>

                <div class="flex gap-1.5">
                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-pen-line"
                    @click="editVariant(variant)"
                  />

                  <UButton
                    size="xs"
                    variant="ghost"
                    color="error"
                    icon="i-lucide-trash-2"
                    @click="removeVariant(variant)"
                  />
                </div>
              </div>

              <div class="mt-3">
                <p class="text-gray-500 text-xs mb-1">
                  {{ t('productEdit.sizes') }}
                </p>

                <div class="flex flex-wrap gap-1.5 items-center">
                  <UBadge
                    v-for="s in variant.sizes"
                    :key="s.id"
                    variant="soft"
                  >
                    {{ s.size }} · {{ s.stock }}
                  </UBadge>

                  <UButton
                    variant="ghost"
                    icon="i-lucide-plus"
                    @click="addSize(variant)"
                  >
                    {{ t('common.add') }}
                  </UButton>
                </div>
              </div>

              <div class="mt-3">
                <p class="text-gray-500 text-xs mb-1">
                  {{ t('productEdit.images') }}
                </p>

                <div class="flex gap-2 flex-wrap items-center">
                  <NuxtImg
                    v-for="img in variant.images"
                    :key="img.url"
                    :src="img.url"
                    class="w-16 h-20 rounded border border-gray-200 object-cover"
                  />
                </div>

                <div class="mt-2">
                  <UFileUpload
                    v-model="pendingFiles[variant.id]"
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
                            v-for="(file, i) in files"
                            :key="i"
                            class="flex items-center gap-2 px-2 py-1 rounded border border-gray-200 bg-white"
                          >
                            <span class="text-xs truncate max-w-48">{{ file.name }}</span>

                            <UButton
                              size="xs"
                              variant="ghost"
                              icon="i-lucide-x"
                              aria-label="remove file"
                              @click="removeFile(i)"
                            />
                          </div>
                        </div>

                        <div class="flex gap-2 mt-3">
                          <UButton
                            variant="soft"
                            @click.stop.prevent="() => { removeFile(); setPendingFiles(variant.id, []); }"
                          >
                            {{ t('common.delete') }}
                          </UButton>

                          <UButton
                            color="primary"
                            :disabled="!files?.length || uploading[variant.id]"
                            :loading="uploading[variant.id]"
                            @click.stop.prevent="() => uploadPendingForVariant(variant.id, removeFile)"
                          >
                            {{ t('common.upload') }}
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
            class="text-gray-500 text-sm"
          >
            {{ t('productEdit.noVariants') }}
          </p>
        </UCard>
      </UCard>
    </UPageBody>

    <AdminVariantModal
      v-model:open="isVariantModalOpen"
      :modelValue="currentVariant"
      @save="saveVariant"
    />

    <AdminSizeModal
      v-model:open="isSizeModalOpen"
      :variantId="currentVariantId"
      :modelValue="currentSize"
      @save="saveSize"
    />
  </UPage>
</template>
