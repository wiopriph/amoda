<script setup lang="ts">
type SizeForm = {
  id?: number | string | null
  'variant_id'?: number | string | null
  size?: string | null
  stock?: number | string | null
  msCode?: string | null
  sku?: string | null
};

const props = withDefaults(defineProps<{
  open?: boolean
  modelValue: SizeForm
}>(), {
  open: false,
});

const getEmptySizeForm = (): SizeForm => ({
  id: null,
  'variant_id': null,
  size: '',
  stock: 0,
  msCode: '',
  sku: '',
});

const sizeForm = reactive<SizeForm>(getEmptySizeForm());

const setSizeForm = (modelValue: SizeForm = {}) => {
  Object.assign(sizeForm, {
    ...getEmptySizeForm(),
    ...modelValue,
  });
};

watch(
  () => props.modelValue,
  (modelValue) => {
    setSizeForm(modelValue);
  },
  { immediate: true },
);

const emit = defineEmits<{
  'update:open': [open: boolean]
  save: [sizeForm: SizeForm]
}>();

const closeModal = () => emit('update:open', false);

const modalTitle = computed(() => sizeForm.id ? 'Editar tamanho' : 'Adicionar tamanho');
const submitLabel = computed(() => sizeForm.id ? 'Guardar' : 'Adicionar');


const isSavingSize = ref(false);

const saveSize = () => {
  isSavingSize.value = true;

  emit('save', { ...sizeForm });

  isSavingSize.value = false;
  closeModal();
};
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
          label="Tamanho"
          required
          class="w-full"
        >
          <UInput
            v-model="sizeForm.size"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Estoque"
          class="w-full"
        >
          <UInput
            v-model="sizeForm.stock"
            type="number"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Código Moysklad"
          class="w-full"
        >
          <UInput
            v-model="sizeForm.msCode"
            placeholder="code"
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
            :loading="isSavingSize"
            color="primary"
            @click="saveSize"
          >
            {{ submitLabel }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
