<script setup lang="ts">
definePageMeta({ name: 'admin-products-new', layout: 'admin', middleware: 'admin' });

const { t } = useI18n();

useHead(() => ({
  title: `${t('productNew.title')} | Amoda Admin`,
  meta: [
    { name: 'description', content: t('productNew.description') },
    { property: 'og:title', content: `${t('productNew.title')} | Amoda Admin` },
    { property: 'og:description', content: t('productNew.description') },
    { property: 'twitter:title', content: `${t('productNew.title')} | Amoda Admin` },
    { property: 'twitter:description', content: t('productNew.description') },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
}));

const { data: brands } = await useFetch('/api/admin/brands/list');
const { data: categories } = await useFetch('/api/admin/categories/list');

const form = reactive({
  title: '',
  brand_id: null as number | null,
  primary_category_id: null as number | null,
  description: '',
  active: true,
});

const localeRoute = useLocaleRoute();

const saveProduct = async (product: any) => {
  const res = await $fetch('/api/admin/products/save', {
    method: 'POST',
    body: product,
  });

  navigateTo(localeRoute({
    name: 'admin-products-edit',
    params: { id: res.id },
  }));
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
  "pt": {
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
