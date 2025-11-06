<script setup lang="ts">
const { t } = useI18n();
const props = defineProps({
  modelValue: { type: Object, required: true },
  open: { type: Boolean, default: false },
  productId: { type: Number, required: true },
});
const emit = defineEmits(['update:open', 'save']);

const variant = reactive({ ...props.modelValue });

watch(() => props.modelValue, v => Object.assign(variant, v));

const isSaving = ref(false);

const handleSave = async () => {
  isSaving.value = true;
  await emit('save', variant);
  isSaving.value = false;
  emit('update:open', false);
};
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
      "save": "Save"
    }
  },
  "pt-AO": {
    "variant": {
      "add": "Adicionar variante",
      "edit": "Editar variante",
      "color": "Cor",
      "price": "Preço (AOA)",
      "active": "Ativa"
    },
    "common": {
      "cancel": "Cancelar",
      "save": "Guardar"
    }
  }
}
</i18n>

<template>
  <UModal
    v-model:open="props.open"
    :title="variant.id ? t('variant.edit') : t('variant.add')"
  >
    <template #body>
      <UForm class="space-y-4">
        <UFormField :label="t('variant.color')">
          <UInput v-model="variant.color" />
        </UFormField>

        <UFormField
          :label="t('variant.price')"
          required
        >
          <UInput
            v-model="variant.price"
            type="number"
          />
        </UFormField>

        <UFormField :label="t('variant.active')">
          <UCheckbox
            v-model="variant.active"
            :label="t('variant.active')"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            @click="emit('update:open', false)"
          >
            {{ t('common.cancel') }}
          </UButton>

          <UButton
            color="primary"
            :loading="isSaving"
            @click="handleSave"
          >
            {{ t('common.save') }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
