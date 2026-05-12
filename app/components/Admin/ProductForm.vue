<script setup lang="ts">
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

const productForm = ref<ProductForm>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (modelValue) => {
    Object.assign(productForm.value, modelValue);
  },
  { deep: true },
);

const isEditingProduct = computed(() => !!productForm.value.id);
const submitLabel = computed(() => isEditingProduct.value ? 'Guardar alterações' : 'Criar produto');
const brandOptions = computed(() => props.brands.map(brand => ({ label: brand.name, value: brand.id })));
const categoryOptions = computed(() => props.categories.map(category => ({ label: category.name, value: category.id })));

const updateProductField = <Field extends keyof ProductForm>(field: Field, value: ProductForm[Field]) => {
  productForm.value[field] = value;
  emit('update:modelValue', productForm.value);
};

const isSavingProduct = ref(false);

const saveProduct = async () => {
  isSavingProduct.value = true;

  emit('save', productForm.value);

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

    productForm.value.slug = title ? slugify(title) : '';
    emit('update:modelValue', productForm.value);
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
        @input="updateProductField('title', $event)"
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
        @input="updateSlug($event)"
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
