<script setup lang="ts">
type SizeForm = {
  id?: number | string | null
  'variant_id'?: number | string | null
  size?: string | null
  stock?: number | string | null
  msCode?: string | null
  msVariantId?: string | null
  sku?: string | null
};

type MsVariantOption = {
  id: string
  name: string
  code: string | null
  characteristics: { name: string; value: string }[]
  salePrice: number | null
};

const props = withDefaults(defineProps<{
  open?: boolean
  modelValue: SizeForm
  msVariants?: MsVariantOption[] | null
}>(), {
  open: false,
  msVariants: null,
});

const getEmptySizeForm = (): SizeForm => ({
  id: null,
  'variant_id': null,
  size: '',
  stock: 0,
  msCode: '',
  msVariantId: null,
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

const formatMsVariantLabel = (msVariant: MsVariantOption) => {
  const characteristics = msVariant.characteristics.map(c => c.value).join(' / ');
  const parts = [characteristics || msVariant.name];

  if (msVariant.code) {
    parts.push(msVariant.code);
  }

  if (msVariant.salePrice !== null) {
    parts.push(`${msVariant.salePrice} Kz`);
  }

  return parts.join(' · ');
};

const msVariantItems = computed(() => [
  { label: '— sem vínculo —', value: null as string | null },
  ...(props.msVariants ?? []).map(msVariant => ({
    label: formatMsVariantLabel(msVariant),
    value: msVariant.id,
  })),
]);

const updateMsVariant = (msVariantId: string | null) => {
  sizeForm.msVariantId = msVariantId;

  const msVariant = (props.msVariants ?? []).find(v => v.id === msVariantId);

  sizeForm.msCode = msVariant?.code ?? sizeForm.msCode;
};

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
          v-if="props.msVariants"
          label="Modificação MoySklad"
          description="Vínculo usado para sincronizar estoque e preço."
          class="w-full"
        >
          <USelect
            :modelValue="sizeForm.msVariantId"
            :items="msVariantItems"
            placeholder="Selecionar modificação"
            class="w-full"
            @update:model-value="updateMsVariant($event as string | null)"
          />
        </UFormField>

        <UAlert
          v-else
          color="warning"
          variant="soft"
          title="Sem vínculo MoySklad"
          description="Preencha o MoySklad ID do produto (via extensão) para escolher a modificação."
        />

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
