<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{
  modelValue: any
  isEdit?: boolean
  brands: { id: number; name: string }[]
  categories: { id: number; name: string }[]
}>();

const emit = defineEmits(['update:modelValue', 'save']);

const product = ref({ ...props.modelValue });

watch(
  () => props.modelValue,
  v => Object.assign(product.value, v),
  { deep: true },
);

const handleInput = (key: string, val: any) => {
  product.value[key] = val;
  emit('update:modelValue', product.value);
};

const isSaving = ref(false);

const handleSave = async () => {
  isSaving.value = true;

  await emit('save', product.value);

  isSaving.value = false;
};
</script>

<i18n lang="json">
{
  "en": {
    "productForm": {
      "title": "Title",
      "brand": "Brand",
      "category": "Category",
      "description": "Description",
      "active": "Product active",
      "create": "Create product",
      "save": "Save changes"
    }
  },
  "pt": {
    "productForm": {
      "title": "Título",
      "brand": "Marca",
      "category": "Categoria",
      "description": "Descrição",
      "active": "Produto ativo",
      "create": "Criar produto",
      "save": "Guardar alterações"
    }
  }
}
</i18n>

<template>
  <UForm class="space-y-4">
    <UFormField
      :label="t('productForm.title')"
      required
      class="w-full"
    >
      <UInput
        v-model="product.title"
        :placeholder="t('productForm.title')"
        class="w-full"
        @input="handleInput('title', $event)"
      />
    </UFormField>

    <UFormField
      :label="t('productForm.category')"
      class="w-full"
    >
      <USelect
        v-model="product.primary_category_id"
        :items="categories.map(c => ({ label: c.name, value: c.id }))"
        :placeholder="t('productForm.category')"
        class="w-full"
        @update:model-value="handleInput('primary_category_id', $event)"
      />
    </UFormField>

    <UFormField
      :label="t('productForm.brand')"
      class="w-full"
    >
      <USelect
        v-model="product.brand_id"
        :items="brands.map(b => ({ label: b.name, value: b.id }))"
        :placeholder="t('productForm.brand')"
        class="w-full"
        @update:model-value="handleInput('brand_id', $event)"
      />
    </UFormField>

    <UFormField
      :label="t('productForm.description')"
      class="w-full"
    >
      <UTextarea
        v-model="product.description"
        :rows="6"
        class="w-full"
        @update:model-value="handleInput('description', $event)"
      />
    </UFormField>

    <UFormField
      :label="t('productForm.active')"
      class="w-full"
    >
      <UCheckbox
        v-model="product.active"
        :label="t('productForm.active')"
        @update:model-value="handleInput('active', $event)"
      />
    </UFormField>

    <div class="flex justify-end gap-2 pt-4">
      <UButton
        :loading="isSaving"
        color="primary"
        @click="handleSave"
      >
        {{ props.isEdit ? t('productForm.save') : t('productForm.create') }}
      </UButton>
    </div>
  </UForm>
</template>
