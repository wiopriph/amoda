<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';


definePageMeta({ name: 'admin-brands', layout: 'admin', middleware: 'admin' });

const { t } = useI18n();

const UBadge = resolveComponent('UBadge');
const UButton = resolveComponent('UButton');

type Brand = {
  id: string
  name: string
  slug?: string
  active: boolean
}

const { data: brands, refresh } = await useFetch('/api/admin/brands/list');

const columns: TableColumn<Brand>[] = [
  { accessorKey: 'id', header: t('admin.brands.id') },
  { accessorKey: 'name', header: t('admin.brands.name') },
  { accessorKey: 'slug', header: t('admin.brands.slug') },
  {
    accessorKey: 'active',
    header: t('admin.brands.active'),
    cell: ({ row }) => {
      const value = row.getValue('active');

      return h(
        UBadge,
        { class: 'capitalize', variant: 'subtle', color: value ? 'success' : 'error' },
        () => (value ? t('common.active') : t('common.inactive')),
      );
    },
  },
  {
    accessorKey: 'actions',
    header: t('common.actions'),
    meta: { class: { th: 'w-24 text-right', td: 'text-right' } },
    cell: ({ row }) => {
      const brand = row.original as Brand;

      return h('div', { class: 'inline-flex gap-2' }, [
        h(UButton, {
          size: 'xs',
          variant: 'ghost',
          icon: 'i-lucide-pen-line',
          title: t('common.edit'),
          onClick: () => openEditModal(brand),
        }),
        h(UButton, {
          size: 'xs',
          variant: 'ghost',
          color: 'error',
          icon: 'i-lucide-trash-2',
          title: t('common.delete'),
          onClick: () => openRemoveModal(brand),
        }),
      ]);
    },
  },
];

const selectedBrand = ref<Brand | null>(null);

const brandForm = reactive({
  id: null as number | null,
  name: '',
  active: true,
});

const isSaving = ref(false);
const isModalOpen = ref(false);
const isRemoveModalOpen = ref(false);

const openCreateModal = () => {
  Object.assign(brandForm, { id: null, name: '', active: true });
  selectedBrand.value = null;
  isModalOpen.value = true;
};

const openEditModal = (brand: Brand) => {
  Object.assign(brandForm, brand);
  selectedBrand.value = brand;
  isModalOpen.value = true;
};

const toast = useToast();

const save = async () => {
  if (!brandForm.name.trim()) {
    return;
  }

  isSaving.value = true;

  try {
    await $fetch('/api/admin/brands/save', {
      method: 'POST',
      body: { id: brandForm.id, name: brandForm.name, active: brandForm.active },
    });

    toast.add({
      title: t('admin.brands.success'),
      description: brandForm.id ? t('admin.brands.updated') : t('admin.brands.created'),
      color: 'success',
    });

    isModalOpen.value = false;
    await refresh();
  } catch (error: any) {
    const message = error?.data?.statusMessage || error?.message || '';

    let text = t('admin.brands.errorDefault');

    if (message.includes('Slug already exists')) {
      text = t('admin.brands.errorSlug');
    }

    toast.add({ title: t('admin.brands.error'), description: text, color: 'error' });
  } finally {
    isSaving.value = false;
  }
};

const openRemoveModal = (brand: Brand) => {
  selectedBrand.value = brand;
  isRemoveModalOpen.value = true;
};

const remove = async () => {
  if (!selectedBrand.value) {
    return;
  }

  try {
    await $fetch('/api/admin/brands/remove', { method: 'POST', body: { id: selectedBrand.value.id } });

    toast.add({
      title: t('admin.brands.success'),
      description: t('admin.brands.deleted'),
      color: 'success',
    });
  } catch {
    toast.add({
      title: t('admin.brands.error'),
      description: t('admin.brands.errorDefault'),
      color: 'error',
    });
  } finally {
    isRemoveModalOpen.value = false;
    await refresh();
  }
};
</script>

<i18n lang="json">
{
  "en": {
    "admin": {
      "brands": {
        "title": "Brands",
        "description": "Manage your product brands",
        "add": "Add brand",
        "edit": "Edit brand",
        "delete": "Delete brand?",
        "id": "ID",
        "name": "Name",
        "slug": "Slug",
        "active": "Active",
        "namePlaceholder": "e.g. Zara, Nike",
        "activeLabel": "Brand is active",
        "slugInfo": "Slug will be generated automatically based on brand name.",
        "confirmDelete": "Are you sure you want to delete {name}?",
        "success": "Success",
        "created": "Brand created successfully.",
        "updated": "Brand updated successfully.",
        "deleted": "Brand deleted successfully.",
        "error": "Error",
        "errorSlug": "A brand with this name already exists.",
        "errorDefault": "Failed to save brand. Please try again."
      }
    },
    "common": {
      "active": "Active",
      "inactive": "Inactive",
      "actions": "Actions",
      "cancel": "Cancel",
      "save": "Save changes",
      "add": "Add",
      "delete": "Delete",
      "edit": "Edit"
    }
  },
  "pt-AO": {
    "admin": {
      "brands": {
        "title": "Marcas",
        "description": "Gerir marcas de produtos",
        "add": "Adicionar marca",
        "edit": "Editar marca",
        "delete": "Eliminar marca?",
        "id": "ID",
        "name": "Nome",
        "slug": "Slug",
        "active": "Ativa",
        "namePlaceholder": "ex.: Zara, Nike",
        "activeLabel": "A marca está ativa",
        "slugInfo": "O slug será gerado automaticamente com base no nome.",
        "confirmDelete": "Tem a certeza que deseja eliminar {name}?",
        "success": "Sucesso",
        "created": "Marca criada com sucesso.",
        "updated": "Marca atualizada com sucesso.",
        "deleted": "Marca eliminada com sucesso.",
        "error": "Erro",
        "errorSlug": "Já existe uma marca com este nome.",
        "errorDefault": "Falha ao guardar marca. Tente novamente."
      }
    },
    "common": {
      "active": "Ativa",
      "inactive": "Inativa",
      "actions": "Ações",
      "cancel": "Cancelar",
      "save": "Guardar alterações",
      "add": "Adicionar",
      "delete": "Eliminar",
      "edit": "Editar"
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('admin.brands.title')"
      :description="t('admin.brands.description')"
    >
      <template #links>
        <UButton
          icon="i-lucide-plus"
          color="primary"
          @click="openCreateModal"
        >
          {{ t('admin.brands.add') }}
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <UCard>
        <UTable
          :data="brands"
          :columns="columns"
          :loading="!brands"
        />
      </UCard>
    </UPageBody>

    <UModal
      v-model:open="isModalOpen"
      :title="brandForm.id ? t('admin.brands.edit') : t('admin.brands.add')"
    >
      <template #body>
        <UForm class="space-y-4">
          <UFormField
            :label="t('admin.brands.name')"
            required
          >
            <UInput
              v-model="brandForm.name"
              :placeholder="t('admin.brands.namePlaceholder')"
            />
          </UFormField>

          <UFormField :label="t('admin.brands.active')">
            <UCheckbox
              v-model="brandForm.active"
              :label="t('admin.brands.activeLabel')"
            />
          </UFormField>

          <UAlert
            icon="i-lucide-info"
            variant="soft"
            :description="t('admin.brands.slugInfo')"
          />

          <div class="flex justify-end gap-3 pt-2">
            <UButton
              variant="ghost"
              @click="isModalOpen = false"
            >
              {{ t('common.cancel') }}
            </UButton>

            <UButton
              color="primary"
              :loading="isSaving"
              @click="save"
            >
              {{ brandForm.id ? t('common.save') : t('common.add') }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="isRemoveModalOpen"
      :title="t('admin.brands.delete')"
    >
      <template #body>
        <div class="space-y-4">
          <p>
            {{ t('admin.brands.confirmDelete', { name: selectedBrand?.name }) }}
          </p>

          <div class="flex justify-end gap-3">
            <UButton
              variant="ghost"
              @click="isRemoveModalOpen = false"
            >
              {{ t('common.cancel') }}
            </UButton>

            <UButton
              color="error"
              @click="remove"
            >
              {{ t('common.delete') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </UPage>
</template>
