<script setup lang="ts">
const props = defineProps({
  modelValue: { type: Object, required: true },
  open: { type: Boolean, default: false },
});

const variant = reactive({ ...props.modelValue });

watch(() => props.modelValue, v => Object.assign(variant, v));


const emit = defineEmits(['update:open', 'save']);


const isSaving = ref(false);

watch(() => props.open, () => isSaving.value = false);

const handleSave = () => {
  isSaving.value = true;

  emit('save', variant);
};

const closeModal = () => emit('update:open', false);

const { t } = useI18n();
</script>

<i18n lang="json">
{
  "en": {
    "variant": {
      "add": "Add variant",
      "edit": "Edit variant",
      "color": "Color",
      "price": "Price (AOA)",
      "active": "Active"
    },
    "common": {
      "cancel": "Cancel",
      "add": "Add",
      "save": "Save"
    }
  },
  "pt": {
    "variant": {
      "add": "Adicionar variante",
      "edit": "Editar variante",
      "color": "Cor",
      "price": "Preço (AOA)",
      "active": "Ativa"
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
    :title="variant.id ? t('variant.edit') : t('variant.add')"
    @update:open="closeModal"
  >
    <template #body>
      <UForm class="space-y-4">
        <UFormField
          :label="t('variant.color')"
          class="w-full"
        >
          <UInput
            v-model="variant.color"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="t('variant.price')"
          required
          class="w-full"
        >
          <UInput
            v-model="variant.price"
            type="number"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="t('variant.active')"
          class="w-full"
        >
          <UCheckbox
            v-model="variant.active"
            :label="t('variant.active')"
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
            {{ variant.id ? t('common.save') : t('common.add') }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
