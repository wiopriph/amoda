<script setup lang="ts">
import { PRODUCT_BADGE_LABELS, PRODUCT_BADGES, type ProductBadge } from '~/utils/productBadges';


type ProductOption = {
  id: number | string
  name: string
};

type ProductForm = {
  id?: number | string | null
  title?: string
  slug?: string
  primary_category_id?: number | string | null
  brand_id?: number | string | null
  description?: string | null
  active?: boolean
  badges?: ProductBadge[]
};

const props = defineProps<{
  modelValue: ProductForm
  brands: ProductOption[]
  categories: ProductOption[]
}>();

const emit = defineEmits<{
  'update:modelValue': [productForm: ProductForm]
  save: [productForm: ProductForm]
}>();

const cloneProductForm = (productForm: ProductForm): ProductForm => ({
  ...productForm,
  badges: Array.isArray(productForm.badges) ? [...productForm.badges] : [],
});

const productForm = ref<ProductForm>(cloneProductForm(props.modelValue));

watch(
  () => props.modelValue,
  (modelValue) => {
    productForm.value = cloneProductForm(modelValue);
  },
);

const isEditingProduct = computed(() => !!productForm.value.id);
const submitLabel = computed(() => isEditingProduct.value ? 'Guardar alterações' : 'Criar produto');
const brandOptions = computed(() => props.brands.map(brand => ({ label: brand.name, value: brand.id })));
const categoryOptions = computed(() => props.categories.map(category => ({ label: category.name, value: category.id })));

const updateProductField = <Field extends keyof ProductForm>(field: Field, value: ProductForm[Field]) => {
  productForm.value[field] = value;
  emit('update:modelValue', cloneProductForm(productForm.value));
};

const isProductBadgeSelected = (badge: ProductBadge) => productForm.value.badges?.includes(badge) ?? false;

const updateProductBadge = (badge: ProductBadge, selected: boolean) => {
  const currentBadges = productForm.value.badges || [];

  if (currentBadges.includes(badge) === selected) {
    return;
  }

  const badges = selected ?
    [...new Set([...currentBadges, badge])] :
    currentBadges.filter(currentBadge => currentBadge !== badge);

  updateProductField('badges', badges);
};

const isSavingProduct = ref(false);

const saveProduct = async () => {
  isSavingProduct.value = true;

  emit('save', cloneProductForm(productForm.value));

  isSavingProduct.value = false;
};

const slugTouched = ref(false);

const slugify = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .substring(0, 120);

watch(
  () => productForm.value.title,
  (title) => {
    if (isEditingProduct.value) {
      return;
    }

    if (slugTouched.value) {
      return;
    }

    const slug = title ? slugify(title) : '';

    if (productForm.value.slug === slug) {
      return;
    }

    updateProductField('slug', slug);
  },
);

const updateSlug = (slug: string) => {
  if (isEditingProduct.value) {
    return;
  }

  slugTouched.value = true;
  updateProductField('slug', slug);
};
</script>

<template>
  <UForm class="space-y-4">
    <UFormField
      label="Título"
      required
      class="w-full"
    >
      <UInput
        v-model="productForm.title"
        placeholder="Título"
        class="w-full"
        @update:model-value="updateProductField('title', String($event || ''))"
      />
    </UFormField>

    <UFormField
      label="Slug"
      class="w-full"
    >
      <UInput
        v-model="productForm.slug"
        :disabled="isEditingProduct"
        placeholder="Slug"
        class="w-full"
        @update:model-value="updateSlug(String($event || ''))"
      />
    </UFormField>

    <UFormField
      label="Categoria"
      class="w-full"
    >
      <USelect
        v-model="productForm.primary_category_id"
        :items="categoryOptions"
        placeholder="Categoria"
        class="w-full"
        @update:model-value="updateProductField('primary_category_id', $event)"
      />
    </UFormField>

    <UFormField
      label="Marca"
      class="w-full"
    >
      <USelect
        v-model="productForm.brand_id"
        :items="brandOptions"
        placeholder="Marca"
        class="w-full"
        @update:model-value="updateProductField('brand_id', $event)"
      />
    </UFormField>

    <UFormField
      label="Descrição"
      class="w-full"
    >
      <UTextarea
        v-model="productForm.description"
        :rows="6"
        class="w-full"
        @update:model-value="updateProductField('description', $event)"
      />
    </UFormField>

    <UFormField
      label="Produto ativo"
      class="w-full"
    >
      <UCheckbox
        v-model="productForm.active"
        label="Produto ativo"
        @update:model-value="updateProductField('active', $event)"
      />
    </UFormField>

    <UFormField
      label="Badges"
      class="w-full"
    >
      <div class="grid gap-2 sm:grid-cols-3">
        <UCheckbox
          v-for="badge in PRODUCT_BADGES"
          :key="badge"
          :modelValue="isProductBadgeSelected(badge)"
          :label="PRODUCT_BADGE_LABELS[badge]"
          @update:model-value="updateProductBadge(badge, Boolean($event))"
        />
      </div>
    </UFormField>

    <div class="flex justify-end gap-2 pt-4">
      <UButton
        :loading="isSavingProduct"
        color="primary"
        @click="saveProduct"
      >
        {{ submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
