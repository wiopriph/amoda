<script setup lang="ts">
const props = defineProps({
  open: Boolean,
  modelValue: { type: Object, required: true },
});
const size = reactive({ ...props.modelValue });

watch(() => props.modelValue, v => Object.assign(size, v));

const isSaving = ref(false);


const emit = defineEmits(['update:open', 'save']);
const closeModal = () => emit('update:open', false);


const handleSave = () => {
  isSaving.value = true;

  emit('save', size);

  isSaving.value = false; //
  closeModal(); //
};

const { t } = useI18n();
</script>

<i18n lang="json">
{
  "en": {
    "size": {
      "add": "Add size",
      "edit": "Edit size",
      "name": "Size",
      "stock": "Stock"
    },
    "common": {
      "cancel": "Cancel",
      "add": "Add",
      "save": "Save"
    }
  },
  "pt": {
    "size": {
      "add": "Adicionar tamanho",
      "edit": "Editar tamanho",
      "name": "Tamanho",
      "stock": "Estoque"
    },
    "common": {
      "cancel": "Cancelar",
      "add": "Adicionar",
      "save": "Guardar"
    }
  }
}
</i18n>

<template>
  <UModal
    :open="props.open"
    :title="size.id ? t('size.edit') : t('size.add')"
    @update:open="closeModal"
  >
    <template #body>
      <UForm class="space-y-4">
        <UFormField
          :label="t('size.name')"
          required
          class="w-full"
        >
          <UInput
            v-model="size.size"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="t('size.stock')"
          class="w-full"
        >
          <UInput
            v-model="size.stock"
            type="number"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            @click="closeModal"
          >
            {{ t('common.cancel') }}
          </UButton>

          <UButton
            color="primary"
            :loading="isSaving"
            @click="handleSave"
          >
            {{ size.id ? t('common.save') : t('common.add') }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
