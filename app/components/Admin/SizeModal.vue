<script setup lang="ts">
const { t } = useI18n()
const props = defineProps({
  open: Boolean,
  variantId: Number,
  modelValue: Object,
})
const emit = defineEmits(['update:open', 'save'])

const size = reactive({ ...props.modelValue })
watch(() => props.modelValue, v => Object.assign(size, v))

const isSaving = ref(false)
const handleSave = async () => {
  isSaving.value = true
  await emit('save', size)
  isSaving.value = false
  emit('update:open', false)
}
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
      "save": "Save"
    }
  },
  "pt-AO": {
    "size": {
      "add": "Adicionar tamanho",
      "edit": "Editar tamanho",
      "name": "Tamanho",
      "stock": "Estoque"
    },
    "common": {
      "cancel": "Cancelar",
      "save": "Guardar"
    }
  }
}
</i18n>

<template>
  <UModal v-model:open="props.open" :title="size.id ? t('size.edit') : t('size.add')">
    <template #body>
      <UForm class="space-y-4">
        <UFormField :label="t('size.name')" required>
          <UInput v-model="size.size" />
        </UFormField>

        <UFormField :label="t('size.stock')">
          <UInput v-model="size.stock" type="number" />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="emit('update:open', false)">
            {{ t('common.cancel') }}
          </UButton>
          <UButton color="primary" :loading="isSaving" @click="handleSave">
            {{ t('common.save') }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
