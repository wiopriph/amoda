<script setup lang="ts">
type VariantForm = {
  id?: number | string | null
  product_id?: number | string | null
  color?: string | null
  price?: number | string | null
  active?: boolean
};

const props = withDefaults(defineProps<{
  modelValue: VariantForm
  open?: boolean
}>(), {
  open: false,
});

const variantForm = reactive<VariantForm>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (modelValue) => {
    Object.assign(variantForm, modelValue);
  },
);

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [variantForm: VariantForm]
}>();

const isSavingVariant = ref(false);
const modalTitle = computed(() => variantForm.id ? 'Editar variante' : 'Adicionar variante');
const submitLabel = computed(() => variantForm.id ? 'Guardar' : 'Adicionar');

watch(
  () => props.open,
  () => {
    isSavingVariant.value = false;
  },
);

const saveVariant = () => {
  isSavingVariant.value = true;

  emit('save', variantForm);
};

const closeModal = () => emit('update:open', false);
</script>

<template>
  <UModal
    :open="props.open"
    :title="modalTitle"
    @update:open="closeModal"
  >
    <template #body>
      <UForm class="space-y-4">
        <UFormField
          label="Cor"
          class="w-full"
        >
          <UInput
            v-model="variantForm.color"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Preço (AOA)"
          required
          class="w-full"
        >
          <UInput
            v-model="variantForm.price"
            type="number"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Ativa"
          class="w-full"
        >
          <UCheckbox
            v-model="variantForm.active"
            label="Ativa"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            variant="ghost"
            @click="closeModal"
          >
            Cancelar
          </UButton>

          <UButton
            :loading="isSavingVariant"
            color="primary"
            @click="saveVariant"
          >
            {{ submitLabel }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
