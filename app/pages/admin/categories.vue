<script setup lang="ts">
definePageMeta({ name: 'admin-categories', layout: 'admin', middleware: 'admin' });

const { t } = useI18n();
const toast = useToast();

type Gender = {
  id: number
  name: string
  code: string
};

type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  active: boolean
  gender_id: number | null
  gender?: Gender
  children?: Category[]
};

const { data: categories, refresh } = await useFetch('/api/admin/categories/tree');
const { data: genders } = await useFetch<Gender[]>('/api/admin/categories/genders');

const gendersOptions = computed(() => genders.value?.map(({ name, id }) => ({ label: name, value: id })) ?? []);

const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const selectedCategory = ref<Category | null>(null);

const form = reactive({
  id: null as number | null,
  name: '',
  parent_id: null as number | null,
  gender_id: null as number | null,
  active: true,
});

const openCreateModal = (parent: Category | null = null) => {
  Object.assign(form, {
    id: null,
    name: '',
    parent_id: parent?.id ?? null,
    gender_id: parent?.gender_id ?? null,
    active: true,
  });

  selectedCategory.value = null;
  isModalOpen.value = true;
};

const openEditModal = (cat: Category) => {
  Object.assign(form, cat);
  selectedCategory.value = cat;
  isModalOpen.value = true;
};

const saveCategory = async () => {
  try {
    await $fetch('/api/admin/categories/save', { method: 'POST', body: form });
    isModalOpen.value = false;
    await refresh();

    toast.add({
      title: t('categories.success'),
      description: form.id ? t('categories.updated') : t('categories.created'),
      color: 'success',
    });
  } catch (error: any) {
    const message = error?.data?.statusMessage || error?.message || 'Unknown error';

    let errorText = t('categories.errorDefault');

    if (message.includes('Slug already exists')) {
      errorText = t('categories.errorSlug');
    }

    toast.add({
      title: t('categories.error'),
      description: errorText,
      color: 'error',
    });
  }
};

const openDeleteModal = (cat: Category) => {
  selectedCategory.value = cat;
  isDeleteModalOpen.value = true;
};

const deleteCategory = async () => {
  try {
    await $fetch('/api/admin/categories/remove', {
      method: 'POST',
      body: { id: selectedCategory.value?.id },
    });

    isDeleteModalOpen.value = false;
    await refresh();

    toast.add({
      title: t('categories.success'),
      description: t('categories.deleted'),
      color: 'success',
    });
  } catch {
    toast.add({
      title: t('categories.error'),
      description: t('categories.errorDefault'),
      color: 'error',
    });
  }
};
</script>

<i18n lang="json">
{
  "en": {
    "categories": {
      "title": "Categories",
      "description": "Manage product categories and hierarchy",
      "add": "Add category",
      "edit": "Edit category",
      "name": "Category name",
      "gender": "Gender",
      "active": "Category active",
      "cancel": "Cancel",
      "save": "Save changes",
      "create": "Add category",
      "delete": "Delete",
      "deleteTitle": "Delete category?",
      "deleteConfirm": "Delete {name} and its subcategories?",
      "loading": "Loading...",
      "selectGender": "Select gender",
      "success": "Success",
      "created": "Category created successfully.",
      "updated": "Category updated successfully.",
      "deleted": "Category deleted successfully.",
      "error": "Error",
      "errorSlug": "A category with this name already exists.",
      "errorDefault": "Failed to save category. Please try again."
    }
  },
  "pt-AO": {
    "categories": {
      "title": "Categorias",
      "description": "Gerir categorias e hierarquias de produtos",
      "add": "Adicionar categoria",
      "edit": "Editar categoria",
      "name": "Nome da categoria",
      "gender": "Género",
      "active": "Categoria ativa",
      "cancel": "Cancelar",
      "save": "Guardar alterações",
      "create": "Adicionar categoria",
      "delete": "Eliminar",
      "deleteTitle": "Eliminar categoria?",
      "deleteConfirm": "Eliminar {name} e as suas subcategorias?",
      "loading": "A carregar...",
      "selectGender": "Selecionar género",
      "success": "Sucesso",
      "created": "Categoria criada com sucesso.",
      "updated": "Categoria atualizada com sucesso.",
      "deleted": "Categoria eliminada com sucesso.",
      "error": "Erro",
      "errorSlug": "Já existe uma categoria com este nome.",
      "errorDefault": "Falha ao guardar categoria. Tente novamente."
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('categories.title')"
      :description="t('categories.description')"
    >
      <template #links>
        <UButton
          icon="i-lucide-plus"
          color="primary"
          @click="openCreateModal()"
        >
          {{ t('categories.add') }}
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <div
          v-if="!categories"
          class="text-gray-500"
        >
          {{ t('categories.loading') }}
        </div>

        <template v-else>
          <CategoryTree
            :items="categories"
            @edit="openEditModal"
            @add="openCreateModal"
            @remove="openDeleteModal"
          />
        </template>
      </UCard>
    </UPageBody>

    <UModal
      v-model:open="isModalOpen"
      :title="form.id ? t('categories.edit') : t('categories.create')"
    >
      <template #body>
        <UForm class="space-y-4">
          <UFormField
            :label="t('categories.name')"
            required
          >
            <UInput v-model="form.name" />
          </UFormField>

          <UFormField
            :label="t('categories.gender')"
            required
          >
            <USelect
              v-model="form.gender_id"
              :items="gendersOptions"
              :placeholder="t('categories.selectGender')"
            />
          </UFormField>

          <UFormField :label="t('categories.active')">
            <UCheckbox
              v-model="form.active"
              :label="t('categories.active')"
            />
          </UFormField>

          <div class="flex justify-end gap-3 pt-2">
            <UButton
              variant="ghost"
              @click="isModalOpen = false"
            >
              {{ t('categories.cancel') }}
            </UButton>

            <UButton
              color="primary"
              @click="saveCategory"
            >
              {{ form.id ? t('categories.save') : t('categories.create') }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteModalOpen"
      :title="t('categories.deleteTitle')"
    >
      <template #body>
        <p v-text="t('categories.deleteConfirm', { name: selectedCategory?.name })" />

        <div class="flex justify-end gap-3 pt-4">
          <UButton
            variant="ghost"
            @click="isDeleteModalOpen = false"
          >
            {{ t('categories.cancel') }}
          </UButton>

          <UButton
            color="error"
            @click="deleteCategory"
          >
            {{ t('categories.delete') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </UPage>
</template>
