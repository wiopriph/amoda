<script setup lang="ts">
definePageMeta({
  name: 'admin-categories',
  layout: 'admin',
  middleware: 'admin',
});

const title = 'Categorias';
const description = 'Gerir categorias e hierarquias de produtos';

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

type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  active: boolean
  children?: Category[]
};

type CategoryForm = {
  id: number | null
  name: string
  parent_id: number | null
  active: boolean
};

const {
  data: categoryTree,
  refresh: refreshCategoryTree,
} = await useFetch<Category[]>('/api/admin/categories/tree');

const isCategoryModalOpen = ref(false);
const selectedCategory = ref<Category | null>(null);

const categoryForm = reactive<CategoryForm>({
  id: null,
  name: '',
  parent_id: null,
  active: true,
});

const resetCategoryForm = (parentCategory: Category | null = null) => {
  Object.assign(categoryForm, {
    id: null,
    name: '',
    parent_id: parentCategory?.id ?? null,
    active: true,
  });
};

const openCreateCategoryModal = (parentCategory: Category | null = null) => {
  resetCategoryForm(parentCategory);
  selectedCategory.value = null;
  isCategoryModalOpen.value = true;
};

const getSaveCategoryErrorText = (error: any) => {
  const message = error?.data?.statusMessage || error?.message || '';

  return message.includes('Slug already exists') ?
    'Já existe uma categoria com este nome.' :
    'Falha ao guardar categoria. Tente novamente.';
};

const toast = useToast();

const saveCategory = async () => {
  try {
    await $fetch('/api/admin/categories/save', { method: 'POST', body: categoryForm });
    isCategoryModalOpen.value = false;
    await refreshCategoryTree();

    toast.add({
      title: 'Sucesso',
      description: 'Categoria criada com sucesso.',
      color: 'success',
    });
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: getSaveCategoryErrorText(error),
      color: 'error',
    });
  }
};

const isDeleteCategoryModalOpen = ref(false);
const deleteCategoryDescription = computed(() => `Eliminar ${selectedCategory.value?.name || ''} e as suas subcategorias?`);

const openDeleteCategoryModal = (category: Category) => {
  selectedCategory.value = category;
  isDeleteCategoryModalOpen.value = true;
};

const deleteCategory = async () => {
  if (!selectedCategory.value) {
    return;
  }

  try {
    await $fetch('/api/admin/categories/remove', {
      method: 'POST',
      body: { id: selectedCategory.value.id },
    });

    isDeleteCategoryModalOpen.value = false;
    await refreshCategoryTree();

    toast.add({
      title: 'Sucesso',
      description: 'Categoria eliminada com sucesso.',
      color: 'success',
    });
  } catch {
    toast.add({
      title: 'Erro',
      description: 'Falha ao eliminar categoria. Tente novamente.',
      color: 'error',
    });
  }
};
</script>

<template>
  <UPage>
    <UPageHeader
      :title="title"
      :description="description"
    >
      <template #links>
        <UButton
          icon="i-lucide-plus"
          color="primary"
          @click="openCreateCategoryModal()"
        >
          Adicionar categoria
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <div
          v-if="!categoryTree"
          class="text-gray-500"
        >
          A carregar...
        </div>

        <template v-else>
          <AdminCategoryTree
            :items="categoryTree"
            @add="openCreateCategoryModal"
            @remove="openDeleteCategoryModal"
          />
        </template>
      </UCard>
    </UPageBody>

    <UModal
      v-model:open="isCategoryModalOpen"
      title="Adicionar categoria"
    >
      <template #body>
        <UForm class="space-y-4">
          <UFormField
            label="Nome da categoria"
            required
          >
            <UInput v-model="categoryForm.name" />
          </UFormField>

          <UFormField label="Categoria ativa">
            <UCheckbox
              v-model="categoryForm.active"
              label="Categoria ativa"
            />
          </UFormField>

          <div class="flex justify-end gap-3 pt-2">
            <UButton
              variant="ghost"
              @click="isCategoryModalOpen = false"
            >
              Cancelar
            </UButton>

            <UButton
              color="primary"
              @click="saveCategory"
            >
              Adicionar categoria
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteCategoryModalOpen"
      title="Eliminar categoria?"
    >
      <template #body>
        <p v-text="deleteCategoryDescription" />

        <div class="flex justify-end gap-3 pt-4">
          <UButton
            variant="ghost"
            @click="isDeleteCategoryModalOpen = false"
          >
            Cancelar
          </UButton>

          <UButton
            color="error"
            @click="deleteCategory"
          >
            Eliminar
          </UButton>
        </div>
      </template>
    </UModal>
  </UPage>
</template>
