<script setup lang="ts">
definePageMeta({ name: 'admin-products-edit', layout: 'admin', middleware: 'admin' });

const { t } = useI18n();
const route = useRoute();

/** fetch product, brands, categories */
const { data: brands } = await useFetch('/api/admin/brands/list');
const { data: categories } = await useFetch('/api/admin/categories/list');
const { data: product, refresh } = await useFetch(`/api/admin/products/${route.params.id}`);

/** save main product info */
const saveProduct = async (p: any) => {
  await $fetch('/api/admin/products/save', { method: 'POST', body: p });
  await refresh();
};

/** variants logic */
const isVariantModalOpen = ref(false);
const isSizeModalOpen = ref(false);
const currentVariant = ref<any>({});
const currentSize = ref<any>({});
const currentVariantId = ref<number | null>(null);

/** VARIANTS */
const openNewVariant = () => {
  currentVariant.value = {
    product_id: product.value.id,
    color: '',
    price: 0,
    sku: '',
    active: true,
  };

  isVariantModalOpen.value = true;
};

const editVariant = (v: any) => {
  currentVariant.value = { ...v, product_id: product.value.id };
  isVariantModalOpen.value = true;
};

const saveVariant = async (v: any) => {
  await $fetch('/api/admin/products/variants/save', { method: 'POST', body: v });
  await refresh();
};

/** SIZES */
const addSize = (variant: any) => {
  currentVariantId.value = variant.id;
  currentSize.value = { variant_id: variant.id, size: '', stock: 0, sku: '' };
  isSizeModalOpen.value = true;
};

const saveSize = async (s: any) => {
  await $fetch('/api/admin/products/variants/sizes/save', { method: 'POST', body: s });
  await refresh();
};

/** UPLOAD IMAGES */
const uploadImage = async (variantId: number) => {
  const input = document.createElement('input');

  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;

  input.onchange = async () => {
    const files = Array.from(input.files || []);

    if (!files.length) return;

    for (const f of files) {
      const formData = new FormData();

      formData.append('file', f);
      formData.append('product_id', String(product.value.id));
      formData.append('variant_id', String(variantId));

      await $fetch('/api/admin/products/upload', {
        method: 'POST',
        body: formData,
      });
    }

    await refresh();
  };

  input.click();
};

/** remove variant */
const removeVariant = async (v: any) => {
  if (!confirm(`Delete variant #${v.id}?`)) return;

  await $fetch('/api/admin/products/variants/remove', { method: 'POST', body: { id: v.id } });
  await refresh();
};

/** remove size */
const removeSize = async (s: any) => {
  if (!confirm(`Delete size ${s.size}?`)) return;

  await $fetch('/api/admin/products/variants/sizes/remove', { method: 'POST', body: { id: s.id } });
  await refresh();
};

/** helpers */
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
  "pt-AO": {
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
        <!-- Main product form -->
        <AdminProductForm
          v-model="product"
          isEdit
          :brands="brands || []"
          :categories="categories || []"
          @save="saveProduct"
        />

        <!-- Variants -->
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
            v-if="product.variants?.length"
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

              <!-- Sizes -->
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
                    size="2xs"
                    variant="ghost"
                    icon="i-lucide-plus"
                    @click="addSize(variant)"
                  >
                    {{ t('common.add') }}
                  </UButton>
                </div>
              </div>

              <!-- Images -->
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

                  <UButton
                    size="2xs"
                    variant="outline"
                    icon="i-lucide-upload"
                    @click="uploadImage(variant.id)"
                  >
                    {{ t('common.upload') }}
                  </UButton>
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

    <!-- Modals -->
    <AdminVariantModal
      v-model:open="isVariantModalOpen"
      :modelValue="currentVariant"
      :productId="product.id"
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
