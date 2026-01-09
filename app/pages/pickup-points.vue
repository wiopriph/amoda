<script setup lang="ts">
definePageMeta({ name: 'pickup-points' });

const { t } = useI18n();

const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const { data, error } = await useFetch('/api/offices/list');

const offices = computed(() => data.value?.items ?? []);

const seoTitle = computed(() => t('offices.meta.title'));
const seoDescription = computed(() => t('offices.meta.description'));

useHead(() => ({
  title: seoTitle.value,
  meta: [
    { name: 'description', content: seoDescription.value },
    { property: 'og:title', content: seoTitle.value },
    { property: 'og:description', content: seoDescription.value },
    { property: 'twitter:title', content: seoTitle.value },
    { property: 'twitter:description', content: seoDescription.value },
  ],
}));

const toTel = (phone?: string) => {
  if (!phone) {
    return '';
  }

  return phone.replace(/[^\d+]/g, '');
};

const formatRanges = (ranges?: [string, string][]) => {
  if (!ranges?.length) {
    return '';
  }

  return ranges
    .filter(r => r?.[0] && r?.[1])
    .map(r => `${r[0]}–${r[1]}`)
    .join(', ');
};
</script>

<i18n lang="json">
{
  "pt": {
    "offices": {
      "title": "Pontos de levantamento",
      "error": "Erro ao carregar os pontos de levantamento.",
      "empty": "Ainda não há pontos de levantamento disponíveis.",
      "hours": "Horário de funcionamento",
      "closed": "Fechado",
      "meta": {
        "title": "Pontos de levantamento Amoda Angola — recolha gratuita de encomendas",
        "description": "Encontre o ponto de levantamento Amoda mais perto de si em Luanda e Soyo. Horário de funcionamento, morada e contacto para recolher as suas encomendas com segurança."
      },
      "days": {
        "mon": "Seg",
        "tue": "Ter",
        "wed": "Qua",
        "thu": "Qui",
        "fri": "Sex",
        "sat": "Sáb",
        "sun": "Dom"
      }
    }
  },
  "en": {
    "offices": {
      "title": "Pickup points",
      "error": "Failed to load pickup points.",
      "empty": "No pickup points available yet.",
      "hours": "Opening hours",
      "closed": "Closed",
      "meta": {
        "title": "Amoda Angola pickup points — free order collection",
        "description": "Find the nearest Amoda pickup point in Luanda and Soyo. Opening hours, address and contact information to collect your orders safely."
      },
      "days": {
        "mon": "Mon",
        "tue": "Tue",
        "wed": "Wed",
        "thu": "Thu",
        "fri": "Fri",
        "sat": "Sat",
        "sun": "Sun"
      }
    }
  }
}
</i18n>

<template>
  <UPage>
    <UPageHeader
      :title="t('offices.title')"
      :description="t('offices.meta.description')"
    />

    <UPageBody class="max-w-3xl mx-auto">
      <UAlert
        v-if="error"
        variant="soft"
        icon="i-lucide-alert-triangle"
        :title="t('offices.error')"
      />

      <div
        v-else
        class="space-y-6"
      >
        <UAlert
          v-if="offices.length === 0"
          variant="soft"
          icon="i-lucide-map-pin"
          :title="t('offices.empty')"
        />

        <UCard
          v-for="office in offices"
          v-else
          :key="office.id"
          class="p-6"
        >
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div class="flex-1 space-y-3">
              <h2 class="text-xl font-semibold">
                {{ office.name }}
              </h2>

              <p
                v-if="office.address"
                class="text-gray-600 text-sm"
              >
                {{ office.address }}
              </p>

              <p
                v-if="office.phone"
                class="text-sm"
              >
                <a
                  class="text-primary underline underline-offset-2"
                  :href="`tel:${toTel(office.phone)}`"
                >
                  {{ office.phone }}
                </a>
              </p>

              <p
                v-if="office.description"
                class="text-sm leading-relaxed"
              >
                {{ office.description }}
              </p>
            </div>

            <div class="md:w-64">
              <p class="font-semibold mb-2 text-sm">
                {{ t('offices.hours') }}
              </p>

              <ul class="space-y-1 text-sm">
                <li
                  v-for="day in weekDays"
                  :key="day"
                  class="flex justify-between gap-3"
                >
                  <span class="w-16 font-medium">
                    {{ t(`offices.days.${day}`) }}:
                  </span>

                  <span class="tabular-nums text-gray-700 text-right">
                    <template v-if="formatRanges(office.opening_hours?.[day])">
                      {{ formatRanges(office.opening_hours?.[day]) }}
                    </template>

                    <template v-else>
                      {{ t('offices.closed') }}
                    </template>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>
