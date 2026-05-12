<script setup lang="ts">
type OpeningHours = Record<string, Array<[string, string]>>;

type OfficePayload = {
  id?: number;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  locationLat: number | null;
  locationLng: number | null;
  phone: string | null;
  openingHours: OpeningHours | null;
  active: boolean;
};

type OfficeFormProps = {
  mode: 'create' | 'edit'
  initial?: Partial<OfficePayload> | null
  submitLabel?: string
};

const props = defineProps<OfficeFormProps>();

const emit = defineEmits<{
  saved: [officeId: number]
}>();

const toast = useToast();

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'data' in error) {
    const fetchError = error as { data?: { message?: string }; message?: string };

    return fetchError.data?.message || fetchError.message || String(error);
  }

  return String(error);
};

const getInitialOfficeForm = (initial?: Partial<OfficePayload> | null): OfficePayload => ({
  id: initial?.id,
  slug: initial?.slug || '',
  name: initial?.name || '',
  description: initial?.description ?? null,
  address: initial?.address ?? null,
  locationLat: initial?.locationLat ?? null,
  locationLng: initial?.locationLng ?? null,
  phone: initial?.phone ?? null,
  openingHours: initial?.openingHours ?? null,
  active: initial?.active ?? true,
});

const officeForm = reactive<OfficePayload>(getInitialOfficeForm(props.initial));
const submitButtonLabel = computed(() => props.submitLabel || (props.mode === 'create' ? 'Criar' : 'Guardar'));
const openingHoursText = ref('');
const openingHoursError = ref('');
const isSavingOffice = ref(false);

const updateOpeningHoursText = () => {
  openingHoursError.value = '';
  openingHoursText.value = officeForm.openingHours ? JSON.stringify(officeForm.openingHours, null, 2) : '';
};

watch(
  () => props.initial,
  (initial) => {
    if (!initial) {
      return;
    }

    Object.assign(officeForm, getInitialOfficeForm(initial));

    updateOpeningHoursText();
  },
  { deep: true },
);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createDefaultOpeningHours = (): OpeningHours => ({
  mon: [['09:00', '18:00']],
  tue: [['09:00', '18:00']],
  wed: [['09:00', '18:00']],
  thu: [['09:00', '18:00']],
  fri: [['09:00', '18:00']],
  sat: [['09:00', '18:00']],
  sun: [],
});

const isOpeningHours = (value: unknown): value is OpeningHours => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  for (const ranges of Object.values(value)) {
    if (!Array.isArray(ranges)) {
      return false;
    }

    for (const range of ranges) {
      if (!Array.isArray(range) || range.length !== 2) {
        return false;
      }
    }
  }

  return true;
};

const parseOpeningHoursText = (): OpeningHours | null => {
  const openingHoursJson = openingHoursText.value.trim();

  if (!openingHoursJson) {
    return null;
  }

  try {
    const parsedOpeningHours = JSON.parse(openingHoursJson);

    if (!isOpeningHours(parsedOpeningHours)) {
      throw new Error('Invalid opening hours');
    }

    return parsedOpeningHours;
  } catch (error: unknown) {
    openingHoursError.value = getErrorMessage(error) || 'Invalid JSON';

    return null;
  }
};

onMounted(updateOpeningHoursText);

const saveOffice = async () => {
  openingHoursError.value = '';

  if (!officeForm.slug.trim()) {
    toast.add({ title: 'Slug é obrigatório', color: 'error' });

    return;
  }

  if (!officeForm.name.trim()) {
    toast.add({ title: 'Nome é obrigatório', color: 'error' });

    return;
  }

  const parsedOpeningHours = parseOpeningHoursText();

  if (openingHoursText.value.trim() && !parsedOpeningHours) {
    toast.add({ title: 'JSON inválido', color: 'error' });

    return;
  }

  isSavingOffice.value = true;

  try {
    const officePayload = {
      slug: officeForm.slug.trim(),
      name: officeForm.name.trim(),
      description: officeForm.description,
      address: officeForm.address,
      locationLat: officeForm.locationLat,
      locationLng: officeForm.locationLng,
      phone: officeForm.phone,
      openingHours: parsedOpeningHours,
      active: officeForm.active,
    };

    if (props.mode === 'create') {
      const createdOffice = await $fetch<{ id: number }>('/api/admin/offices/create', {
        method: 'POST',
        body: officePayload,
      });

      toast.add({ title: 'Ponto criado' });
      emit('saved', createdOffice.id);

      return;
    }

    if (!officeForm.id) {
      toast.add({ title: 'ID é obrigatório', color: 'error' });

      return;
    }

    const updatedOffice = await $fetch<{ id: number }>('/api/admin/offices/update', {
      method: 'PATCH',
      body: { id: officeForm.id, ...officePayload },
    });

    toast.add({ title: 'Guardado' });
    emit('saved', updatedOffice.id);
  } catch (error: unknown) {
    toast.add({
      title: 'Erro ao guardar',
      description: getErrorMessage(error),
      color: 'error',
    });
  } finally {
    isSavingOffice.value = false;
  }
};

const fillSlugFromName = () => {
  if (!officeForm.slug.trim()) {
    officeForm.slug = slugify(officeForm.name);
  }
};

const applyDefaultOpeningHours = () => {
  officeForm.openingHours = createDefaultOpeningHours();
  updateOpeningHoursText();
};

const formatOpeningHoursJson = () => {
  const parsedOpeningHours = parseOpeningHoursText();

  if (parsedOpeningHours) {
    openingHoursText.value = JSON.stringify(parsedOpeningHours, null, 2);
  }
};
</script>

<template>
  <UCard>
    <div class="grid gap-5">
      <UFormField
        label="Nome"
        class="w-full"
        required
      >
        <UInput
          v-model="officeForm.name"
          placeholder="Amoda Viana"
          class="w-full"
          @blur="fillSlugFromName"
        />
      </UFormField>

      <UFormField
        label="Slug"
        help="Minúsculas + hífen. Gerado a partir do nome."
        required
      >
        <UInput
          v-model="officeForm.slug"
          placeholder="amoda-viana"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Descrição">
        <UTextarea
          v-model="officeForm.description"
          :rows="5"
          class="w-full"
          resize
        />
      </UFormField>

      <UFormField label="Endereço">
        <UTextarea
          v-model="officeForm.address"
          :rows="5"
          class="w-full"
          resize
        />
      </UFormField>

      <UFormField label="Telefone">
        <UInput
          v-model="officeForm.phone"
          placeholder="+244..."
          class="w-full"
        />
      </UFormField>

      <UFormField label="Latitude">
        <UInput
          v-model.number="officeForm.locationLat"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Longitude">
        <UInput
          v-model.number="officeForm.locationLng"
          type="number"
          class="w-full"
        />
      </UFormField>

      <div class="space-y-2">
        <div class="flex justify-between">
          <div>
            <div class="text-sm font-medium">
              Horário (JSON)
            </div>

            <div class="text-xs text-gray-500">
              Vazio = null. dia -&gt; [["HH:mm","HH:mm"], ...]
            </div>
          </div>

          <div class="flex gap-2">
            <UButton
              size="xs"
              variant="soft"
              @click="applyDefaultOpeningHours"
            >
              Padrão
            </UButton>

            <UButton
              size="xs"
              variant="soft"
              @click="formatOpeningHoursJson"
            >
              Formatar
            </UButton>
          </div>
        </div>

        <UTextarea
          v-model="openingHoursText"
          :rows="14"
          resize
          class="w-full font-mono text-sm"
        />

        <UAlert
          v-if="openingHoursError"
          :description="openingHoursError"
          color="error"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
        />
      </div>

      <UFormField>
        <UCheckbox
          v-model="officeForm.active"
          label="Ativo"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="mt-6 flex justify-end">
      <UButton
        :loading="isSavingOffice"
        color="primary"
        icon="i-lucide-save"
        @click="saveOffice"
      >
        {{ submitButtonLabel }}
      </UButton>
    </div>
  </UCard>
</template>
