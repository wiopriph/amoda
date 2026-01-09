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

const props = defineProps<{
  mode: 'create' | 'edit';
  initial?: Partial<OfficePayload> | null;
  submitLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'saved', id: number): void;
}>();

const { t } = useI18n();
const toast = useToast();

/* ---------------- state ---------------- */

const form = reactive<OfficePayload>({
  id: props.initial?.id,
  slug: props.initial?.slug || '',
  name: props.initial?.name || '',
  description: props.initial?.description ?? null,
  address: props.initial?.address ?? null,
  locationLat: props.initial?.locationLat ?? null,
  locationLng: props.initial?.locationLng ?? null,
  phone: props.initial?.phone ?? null,
  openingHours: props.initial?.openingHours ?? null,
  active: props.initial?.active ?? true,
});

watch(
  () => props.initial,
  (val) => {
    if (!val) {
      return;
    }

    Object.assign(form, {
      id: val.id,
      slug: val.slug || '',
      name: val.name || '',
      description: val.description ?? null,
      address: val.address ?? null,
      locationLat: val.locationLat ?? null,
      locationLng: val.locationLng ?? null,
      phone: val.phone ?? null,
      openingHours: (val.openingHours as any) ?? null,
      active: val.active ?? true,
    });

    syncOpeningHoursText();
  },
  { deep: true },
);

/* ---------------- helpers ---------------- */

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const makeDefaultHours = (): OpeningHours => ({
  mon: [['09:00', '18:00']],
  tue: [['09:00', '18:00']],
  wed: [['09:00', '18:00']],
  thu: [['09:00', '18:00']],
  fri: [['09:00', '18:00']],
  sat: [['09:00', '18:00']],
  sun: [],
});

/* ---------------- opening hours ---------------- */

const openingHoursText = ref('');
const openingHoursError = ref('');

const syncOpeningHoursText = () => {
  openingHoursError.value = '';

  openingHoursText.value = form.openingHours ?
    JSON.stringify(form.openingHours, null, 2) :
    '';
};

const parseOpeningHours = (): OpeningHours | null => {
  const raw = openingHoursText.value.trim();

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid JSON');
    }

    for (const ranges of Object.values(parsed)) {
      if (!Array.isArray(ranges)) {
        throw new Error('Invalid ranges');
      }

      for (const r of ranges as any[]) {
        if (!Array.isArray(r) || r.length !== 2) {
          throw new Error('Invalid time range');
        }
      }
    }

    return parsed as OpeningHours;
  } catch (e: any) {
    openingHoursError.value = e?.message || 'Invalid JSON';

    return null;
  }
};

onMounted(syncOpeningHoursText);

/* ---------------- submit ---------------- */

const saving = ref(false);

const submit = async () => {
  openingHoursError.value = '';

  if (!form.slug.trim()) {
    toast.add({ title: t('officeForm.errors.slugRequired'), color: 'error' });

    return;
  }

  if (!form.name.trim()) {
    toast.add({ title: t('officeForm.errors.nameRequired'), color: 'error' });

    return;
  }

  const parsedHours = parseOpeningHours();

  if (openingHoursText.value.trim() && !parsedHours) {
    toast.add({ title: t('officeForm.errors.openingHoursInvalid'), color: 'error' });

    return;
  }

  saving.value = true;

  try {
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description,
      address: form.address,
      locationLat: form.locationLat,
      locationLng: form.locationLng,
      phone: form.phone,
      openingHours: parsedHours,
      active: form.active,
    };

    if (props.mode === 'create') {
      const res = await $fetch<{ id: number }>('/api/admin/offices/create', {
        method: 'POST',
        body: payload,
      });

      toast.add({ title: t('officeForm.toasts.created') });
      emit('saved', res.id);

      return;
    }

    if (!form.id) {
      toast.add({ title: t('officeForm.errors.idRequired'), color: 'error' });

      return;
    }

    const res = await $fetch<{ id: number }>('/api/admin/offices/update', {
      method: 'PATCH',
      body: { id: form.id, ...payload },
    });

    toast.add({ title: t('officeForm.toasts.saved') });
    emit('saved', res.id);
  } catch (e: any) {
    toast.add({
      title: t('officeForm.toasts.saveErrorTitle'),
      description: e?.data?.message || e?.message || String(e),
      color: 'error',
    });
  } finally {
    saving.value = false;
  }
};

const autofillSlug = () => {
  if (!form.slug.trim()) {
    form.slug = slugify(form.name);
  }
};

const setDefaultHours = () => {
  form.openingHours = makeDefaultHours();
  syncOpeningHoursText();
};

const prettifyHours = () => {
  const parsed = parseOpeningHours();

  if (parsed) {
    openingHoursText.value = JSON.stringify(parsed, null, 2);
  }
};
</script>

<i18n lang="json">
{
  "en": {
    "officeForm": {
      "labels": {
        "name": "Name",
        "slug": "Slug",
        "description": "Description",
        "address": "Address",
        "phone": "Phone",
        "active": "Active",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "openingHours": "Opening hours (JSON)"
      },
      "help": {
        "slug": "Lowercase latin + dashes. Auto-generated from name.",
        "openingHours": "Empty = null. day -> [[\"HH:mm\",\"HH:mm\"], ...]"
      },
      "actions": {
        "default": "Default",
        "prettify": "Prettify",
        "create": "Create",
        "save": "Save"
      },
      "placeholders": {
        "name": "Amoda Viana",
        "slug": "amoda-viana",
        "description": "Optional",
        "address": "Rua ...",
        "phone": "+244...",
        "openingHours": "openingHours",
        "lat": "-8.83",
        "lng": "13.24"
      },
      "errors": {
        "slugRequired": "Slug is required",
        "nameRequired": "Name is required",
        "idRequired": "Office id is required",
        "openingHoursInvalid": "Invalid opening hours JSON"
      },
      "toasts": {
        "created": "Office created",
        "saved": "Saved",
        "saveErrorTitle": "Save error"
      }
    }
  },
  "pt": {
    "officeForm": {
      "labels": {
        "name": "Nome",
        "slug": "Slug",
        "description": "Descrição",
        "address": "Endereço",
        "phone": "Telefone",
        "active": "Ativo",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "openingHours": "Horário (JSON)"
      },
      "help": {
        "slug": "Minúsculas + hífen. Gerado a partir do nome.",
        "openingHours": "Vazio = null. dia -> [[\"HH:mm\",\"HH:mm\"], ...]"
      },
      "actions": {
        "default": "Padrão",
        "prettify": "Formatar",
        "create": "Criar",
        "save": "Guardar"
      },
      "placeholders": {
        "name": "Amoda Viana",
        "slug": "amoda-viana",
        "description": "Opcional",
        "address": "Rua ...",
        "phone": "+244...",
        "openingHours": "openingHours",
        "lat": "-8.83",
        "lng": "13.24"
      },
      "errors": {
        "slugRequired": "Slug é obrigatório",
        "nameRequired": "Nome é obrigatório",
        "idRequired": "ID é obrigatório",
        "openingHoursInvalid": "JSON inválido"
      },
      "toasts": {
        "created": "Ponto criado",
        "saved": "Guardado",
        "saveErrorTitle": "Erro ao guardar"
      }
    }
  }
}
</i18n>

<template>
  <UCard>
    <div class="grid gap-5">
      <UFormField
        :label="t('officeForm.labels.name')"
        class="w-full"
        required
      >
        <UInput
          v-model="form.name"
          :placeholder="t('officeForm.placeholders.name')"
          class="w-full"
          @blur="autofillSlug"
        />
      </UFormField>

      <UFormField
        :label="t('officeForm.labels.slug')"
        :help="t('officeForm.help.slug')"
        required
      >
        <UInput
          v-model="form.slug"
          :placeholder="t('officeForm.placeholders.slug')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('officeForm.labels.description')">
        <UTextarea
          v-model="form.description"
          :rows="5"
          class="w-full"
          resize
        />
      </UFormField>

      <UFormField :label="t('officeForm.labels.address')">
        <UTextarea
          v-model="form.address"
          :rows="5"
          class="w-full"
          resize
        />
      </UFormField>

      <UFormField :label="t('officeForm.labels.phone')">
        <UInput
          v-model="form.phone"
          :placeholder="t('officeForm.placeholders.phone')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('officeForm.labels.latitude')">
        <UInput
          v-model.number="form.locationLat"
          type="number"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('officeForm.labels.longitude')">
        <UInput
          v-model.number="form.locationLng"
          type="number"
          class="w-full"
        />
      </UFormField>

      <div class="space-y-2">
        <div class="flex justify-between">
          <div>
            <div class="text-sm font-medium">
              {{ t('officeForm.labels.openingHours') }}
            </div>

            <div class="text-xs text-gray-500">
              {{ t('officeForm.help.openingHours') }}
            </div>
          </div>

          <div class="flex gap-2">
            <UButton
              size="xs"
              variant="soft"
              @click="setDefaultHours"
            >
              {{ t('officeForm.actions.default') }}
            </UButton>

            <UButton
              size="xs"
              variant="soft"
              @click="prettifyHours"
            >
              {{ t('officeForm.actions.prettify') }}
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
          color="error"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
          :description="openingHoursError"
        />
      </div>

      <UFormField>
        <UCheckbox
          v-model="form.active"
          :label="t('officeForm.labels.active')"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="mt-6 flex justify-end">
      <UButton
        color="primary"
        icon="i-lucide-save"
        :loading="saving"
        @click="submit"
      >
        {{ submitLabel || (mode === 'create'
          ? t('officeForm.actions.create')
          : t('officeForm.actions.save')) }}
      </UButton>
    </div>
  </UCard>
</template>
