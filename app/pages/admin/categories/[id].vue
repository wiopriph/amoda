<script setup lang="ts">
definePageMeta({
  name: 'admin-categories-edit',
  layout: 'admin',
  middleware: 'admin',
});

useHead({
  title: 'Editar categoria',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  active: boolean
  image: string | null
  seo_title: string | null
  seo_description: string | null
  seo_content: string | null
  h1_override: string | null
};

type CategoryOption = {
  id: number | string
  name: string
};

const route = useRoute();
const toast = useToast();

const [
  { data: category, refresh: refreshCategory },
  { data: allCategories },
] = await Promise.all([
  useFetch<Category>(`/api/admin/categories/${route.params.id}`),
  useFetch<CategoryOption[]>('/api/admin/categories/list'),
]);

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' });
}

const form = reactive({
  name: category.value.name,
  slug: category.value.slug,
  active: category.value.active,
  'parent_id': category.value.parent_id,
  'seo_title': category.value.seo_title ?? '',
  'seo_description': category.value.seo_description ?? '',
  'seo_content': category.value.seo_content ?? '',
  'h1_override': category.value.h1_override ?? '',
});

watch(category, (val) => {
  if (!val) return;

  Object.assign(form, {
    name: val.name,
    slug: val.slug,
    active: val.active,
    'parent_id': val.parent_id,
    'seo_title': val.seo_title ?? '',
    'seo_description': val.seo_description ?? '',
    'seo_content': val.seo_content ?? '',
    'h1_override': val.h1_override ?? '',
  });
});

const parentOptions = computed(() => [
  { label: '— Nível raiz (sem categoria pai)', value: null },
  ...(allCategories.value || [])
    .filter(c => c.id !== category.value?.id)
    .map(c => ({ label: c.name, value: c.id })),
]);

const isSaving = ref(false);

const saveCategory = async () => {
  isSaving.value = true;

  try {
    await $fetch('/api/admin/categories/save', {
      method: 'POST',
      body: {
        id: category.value!.id,
        name: form.name,
        slug: form.slug,
        active: form.active,
        'parent_id': form.parent_id,
        'seo_title': form.seo_title || null,
        'seo_description': form.seo_description || null,
        'seo_content': form.seo_content || null,
        'h1_override': form.h1_override || null,
      },
    });

    await refreshCategory();

    toast.add({
      title: 'Sucesso',
      description: 'Categoria guardada com sucesso.',
      color: 'success',
    });
  } catch (error: any) {
    const msg = error?.data?.statusMessage || error?.message || '';

    toast.add({
      title: 'Erro',
      description: msg.includes('Slug already exists') ? 'Já existe uma categoria com este slug.' : 'Falha ao guardar categoria.',
      color: 'error',
    });
  } finally {
    isSaving.value = false;
  }
};

const pendingImageFile = ref<File[]>([]);
const isUploadingImage = ref(false);

const uploadImage = async (clearFiles?: () => void) => {
  const file = (pendingImageFile.value as File[])?.[0];

  if (!file || !category.value?.id) return;

  isUploadingImage.value = true;

  try {
    const formData = new FormData();

    formData.append('category_id', String(category.value.id));
    formData.append('file', file);

    await $fetch('/api/admin/categories/upload', { method: 'POST', body: formData });

    clearFiles?.();
    pendingImageFile.value = [];
    await refreshCategory();

    toast.add({ title: 'Sucesso', description: 'Imagem carregada com sucesso.', color: 'success' });
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: error?.data?.statusMessage || 'Falha ao carregar imagem.',
      color: 'error',
    });
  } finally {
    isUploadingImage.value = false;
  }
};

const isDeleting = ref(false);

const deleteCategory = async () => {
  if (!category.value?.id || !confirm(`Eliminar categoria "${category.value.name}" e as suas subcategorias?`)) {
    return;
  }

  isDeleting.value = true;

  try {
    await $fetch('/api/admin/categories/remove', {
      method: 'POST',
      body: { id: category.value.id },
    });

    toast.add({ title: 'Sucesso', description: 'Categoria eliminada.', color: 'success' });
    await navigateTo({ name: 'admin-categories' });
  } catch {
    toast.add({ title: 'Erro', description: 'Falha ao eliminar categoria.', color: 'error' });
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <UPage>
    <UPageHeader
      :title="category?.name || 'Editar categoria'"
      description="Editar detalhes da categoria"
    >
      <template #links>
        <UButton
          :to="{ name: 'admin-categories' }"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          Voltar
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody v-if="category">
      <UCard>
        <div class="space-y-5">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <UFormField
              label="Nome"
              required
            >
              <UInput
                v-model="form.name"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Slug">
              <UInput
                v-model="form.slug"
                class="w-full"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <UFormField label="Categoria pai">
              <USelect
                v-model="form.parent_id"
                :items="parentOptions"
                placeholder="Sem categoria pai"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Estado">
              <UCheckbox
                v-model="form.active"
                label="Categoria ativa"
              />
            </UFormField>
          </div>

          <USeparator label="Imagem" />

          <div class="flex items-start gap-6">
            <div
              v-if="category.image"
              class="shrink-0"
            >
              <NuxtImg
                :src="category.image"
                class="h-20 w-20 rounded-md border border-gray-200 object-cover"
              />
            </div>

            <div
              v-else
              class="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-400"
            >
              <UIcon
                name="i-lucide-image"
                class="size-8"
              />
            </div>

            <UFileUpload
              v-model="pendingImageFile"
              multiple
              accept="image/*"
              label="Carregar imagem (400×400)"
              description="PNG, JPG ou WEBP — será convertida para quadrado 400×400"
              class="flex-1"
            >
              <template #files-bottom="{ files, removeFile }">
                <div
                  v-if="files?.length"
                  class="mt-3 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <span class="min-w-0 flex-1 truncate text-sm text-gray-600">{{ files[0]?.name }}</span>

                  <UButton
                    size="xs"
                    variant="ghost"
                    icon="i-lucide-x"
                    aria-label="remover"
                    @click.stop.prevent="() => { removeFile(); pendingImageFile = []; }"
                  />

                  <UButton
                    size="xs"
                    color="primary"
                    :loading="isUploadingImage"
                    :disabled="isUploadingImage"
                    @click.stop.prevent="() => uploadImage(removeFile)"
                  >
                    Carregar
                  </UButton>
                </div>
              </template>
            </UFileUpload>
          </div>

          <USeparator label="SEO" />

          <UFormField label="H1 (override)">
            <UInput
              v-model="form.h1_override"
              class="w-full"
              placeholder="Deixar vazio para usar o nome"
            />
          </UFormField>

          <UFormField label="SEO Title">
            <UInput
              v-model="form.seo_title"
              class="w-full"
            />
          </UFormField>

          <UFormField label="SEO Description">
            <UTextarea
              v-model="form.seo_description"
              class="w-full"
              :rows="3"
            />
          </UFormField>

          <UFormField label="SEO Content">
            <UTextarea
              v-model="form.seo_content"
              class="w-full"
              :rows="5"
            />
          </UFormField>

          <div class="flex justify-end pt-2">
            <UButton
              color="primary"
              :loading="isSaving"
              :disabled="isSaving"
              @click="saveCategory"
            >
              Guardar alterações
            </UButton>
          </div>
        </div>
      </UCard>

      <div class="mt-8 rounded-lg border border-error/30 bg-error/5 p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-sm font-semibold text-error">
              Eliminar categoria
            </h3>

            <p class="mt-1 text-sm text-gray-600">
              Remove a categoria e todas as suas subcategorias.
            </p>
          </div>

          <UButton
            color="error"
            variant="soft"
            icon="i-lucide-trash-2"
            :loading="isDeleting"
            :disabled="isDeleting"
            @click="deleteCategory"
          >
            Eliminar categoria
          </UButton>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>
