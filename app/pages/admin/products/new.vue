<script setup lang="ts">
definePageMeta({ name: 'admin-products-new', layout: 'admin', middleware: 'admin' });

const { t } = useI18n();
const router = useRouter();
const { data: brands } = await useFetch('/api/admin/brands/list');
const { data: categories } = await useFetch('/api/admin/categories/list');

const form = reactive({
  title: '',
  brand_id: null,
  primary_category_id: null,
  description: '',
  active: true,
});

const saveProduct = async (product: any) => {
  const res = await $fetch('/api/admin/products/save', {
    method: 'POST',
    body: product,
  });

  router.push(`/admin/products/${res.id}`);
};
</script>

<i18n lang="json">
{
  "en": {
    "productNew": {
      "title": "Create product",
      "description": "Add new product details"
    }
  },
  "pt-AO": {
    "productNew": {
      "title": "Criar produto",
      "description": "Adicionar detalhes do novo produto"
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('productNew.title')"
      :description="t('productNew.description')"
    />

    <UPageBody>
      <UCard>
        <AdminProductForm
          v-model="form"
          :brands="brands || []"
          :categories="categories || []"
          @save="saveProduct"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>
