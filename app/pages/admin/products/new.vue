<script setup lang="ts">
definePageMeta({
  name: 'admin-products-new',
  layout: 'admin',
  middleware: 'admin',
});

const title = 'Criar produto';
const description = 'Adicionar detalhes do novo produto';

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

type ProductForm = {
  title: string
  brand_id: number | null
  primary_category_id: number | null
  description: string
  active: boolean
};

const [
  { data: brandOptions },
  { data: categoryOptions },
] = await Promise.all([
  useFetch('/api/admin/brands/list'),
  useFetch('/api/admin/categories/list'),
]);

const brands = computed(() => brandOptions.value || []);
const categories = computed(() => categoryOptions.value || []);

const productForm = reactive<ProductForm>({
  title: '',
  brand_id: null,
  primary_category_id: null,
  description: '',
  active: true,
});

const saveProduct = async (productPayload: ProductForm) => {
  const savedProduct = await $fetch<{ id: number | string }>('/api/admin/products/save', {
    method: 'POST',
    body: productPayload,
  });

  navigateTo({
    name: 'admin-products-edit',
    params: { id: savedProduct.id },
  });
};
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :description="description"
    />

    <UPageBody>
      <UCard>
        <AdminProductForm
          v-model="productForm"
          :brands="brands"
          :categories="categories"
          @save="saveProduct"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>
