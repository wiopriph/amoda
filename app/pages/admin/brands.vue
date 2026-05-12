<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';


definePageMeta({
  name: 'admin-brands',
  layout: 'admin',
  middleware: 'admin',
});


const title = 'Marcas';
const description = 'Gerir marcas de produtos';

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

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');

type Brand = {
  id: number | string
  name: string
  slug?: string
  active: boolean
};

type BrandForm = {
  id: number | string | null
  name: string
  active: boolean
};

const { data: brandList, refresh: refreshBrandList } = await useFetch<Brand[]>('/api/admin/brands/list');

const selectedBrand = ref<Brand | null>(null);
const isBrandModalOpen = ref(false);
const isSavingBrand = ref(false);

const brandForm = reactive<BrandForm>({
  id: null,
  name: '',
  active: true,
});

const brandModalTitle = computed(() => brandForm.id ? 'Editar marca' : 'Adicionar marca');
const brandSubmitLabel = computed(() => brandForm.id ? 'Guardar alterações' : 'Adicionar');

const resetBrandForm = () => {
  Object.assign(brandForm, {
    id: null,
    name: '',
    active: true,
  });
};

const openCreateBrandModal = () => {
  resetBrandForm();
  selectedBrand.value = null;
  isBrandModalOpen.value = true;
};

const openEditBrandModal = (brand: Brand) => {
  Object.assign(brandForm, {
    id: brand.id,
    name: brand.name,
    active: brand.active,
  });

  selectedBrand.value = brand;
  isBrandModalOpen.value = true;
};

const getSaveBrandErrorText = (error: any) => {
  const message = error?.data?.statusMessage || error?.message || '';

  return message.includes('Slug already exists') ?
    'Já existe uma marca com este nome.' :
    'Falha ao guardar marca. Tente novamente.';
};


const toast = useToast();

const saveBrand = async () => {
  if (!brandForm.name.trim()) {
    return;
  }

  isSavingBrand.value = true;

  try {
    const isEditing = !!brandForm.id;

    await $fetch('/api/admin/brands/save', {
      method: 'POST',
      body: {
        id: brandForm.id,
        name: brandForm.name,
        active: brandForm.active,
      },
    });

    toast.add({
      title: 'Sucesso',
      description: isEditing ? 'Marca atualizada com sucesso.' : 'Marca criada com sucesso.',
      color: 'success',
    });

    isBrandModalOpen.value = false;
    await refreshBrandList();
  } catch (error: any) {
    toast.add({
      title: 'Erro',
      description: getSaveBrandErrorText(error),
      color: 'error',
    });
  } finally {
    isSavingBrand.value = false;
  }
};

const isDeleteBrandModalOpen = ref(false);
const deleteBrandDescription = computed(() => `Tem a certeza que deseja eliminar ${selectedBrand.value?.name || ''}?`);

const openDeleteBrandModal = (brand: Brand) => {
  selectedBrand.value = brand;
  isDeleteBrandModalOpen.value = true;
};

const deleteBrand = async () => {
  if (!selectedBrand.value) {
    return;
  }

  try {
    await $fetch('/api/admin/brands/remove', {
      method: 'POST',
      body: { id: selectedBrand.value.id },
    });

    toast.add({
      title: 'Sucesso',
      description: 'Marca eliminada com sucesso.',
      color: 'success',
    });
  } catch {
    toast.add({
      title: 'Erro',
      description: 'Falha ao eliminar marca. Tente novamente.',
      color: 'error',
    });
  } finally {
    isDeleteBrandModalOpen.value = false;
    await refreshBrandList();
  }
};

const columns: TableColumn<Brand>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'slug', header: 'Slug' },
  {
    accessorKey: 'active',
    header: 'Ativa',
    cell: ({ row }) => {
      const isActive = Boolean(row.getValue('active'));

      return h(
        UBadge,
        { class: 'capitalize', variant: 'subtle', color: isActive ? 'success' : 'error' },
        () => (isActive ? 'Ativa' : 'Inativa'),
      );
    },
  },
  {
    accessorKey: 'actions',
    header: 'Ações',
    meta: { class: { th: 'w-24 text-right', td: 'text-right' } },
    cell: ({ row }) => {
      const brand = row.original as Brand;

      return h('div', { class: 'inline-flex gap-2' }, [
        h(UButton, {
          size: 'xs',
          variant: 'ghost',
          icon: 'i-lucide-pen-line',
          title: 'Editar',
          onClick: () => openEditBrandModal(brand),
        }),
        h(UButton, {
          size: 'xs',
          variant: 'ghost',
          color: 'error',
          icon: 'i-lucide-trash-2',
          title: 'Eliminar',
          onClick: () => openDeleteBrandModal(brand),
        }),
      ]);
    },
  },
];
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
          @click="openCreateBrandModal"
        >
          Adicionar marca
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <UTable
          :data="brandList"
          :columns="columns"
          :loading="!brandList"
        />
      </UCard>
    </UPageBody>

    <UModal
      v-model:open="isBrandModalOpen"
      :title="brandModalTitle"
    >
      <template #body>
        <UForm class="space-y-4">
          <UFormField
            label="Nome"
            required
          >
            <UInput
              v-model="brandForm.name"
              placeholder="ex.: Zara, Nike"
            />
          </UFormField>

          <UFormField label="Ativa">
            <UCheckbox
              v-model="brandForm.active"
              label="A marca está ativa"
            />
          </UFormField>

          <UAlert
            icon="i-lucide-info"
            variant="soft"
            description="O slug será gerado automaticamente com base no nome."
          />

          <div class="flex justify-end gap-3 pt-2">
            <UButton
              variant="ghost"
              @click="isBrandModalOpen = false"
            >
              Cancelar
            </UButton>

            <UButton
              :loading="isSavingBrand"
              color="primary"
              @click="saveBrand"
            >
              {{ brandSubmitLabel }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="isDeleteBrandModalOpen"
      title="Eliminar marca?"
    >
      <template #body>
        <div class="space-y-4">
          <p v-text="deleteBrandDescription" />

          <div class="flex justify-end gap-3">
            <UButton
              variant="ghost"
              @click="isDeleteBrandModalOpen = false"
            >
              Cancelar
            </UButton>

            <UButton
              color="error"
              @click="deleteBrand"
            >
              Eliminar
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UPage>
</template>
