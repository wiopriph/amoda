<script setup lang="ts">
const { t } = useI18n();

const { data, error } = await useFetch('/api/offices/list');

const offices = computed(() => data.value?.items || []);

const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

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
</script>

<i18n lang="json">
{
  "pt": {
    "offices": {
      "title": "Pontos de levantamento",
      "error": "Erro ao carregar os pontos de levantamento.",
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
    <UPageHeader :title="t('offices.title')" />

    <UPageBody>
      <div v-if="error">
        <p>
          {{ t('offices.error') }}
        </p>
      </div>

      <div
        v-else
        class="flex flex-col gap-6"
      >
        <UCard
          v-for="office in offices"
          :key="office.id"
          class="p-6"
        >
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div class="flex-1 space-y-3">
              <h2 class="text-xl font-semibold">
                {{ office.name }}
              </h2>

              <p class="text-gray-600 text-sm">
                {{ office.address }}
              </p>

              <p class="text-sm">
                <a
                  class="text-primary underline underline-offset-2"
                  :href="`tel:${office.phone}`"
                >
                  {{ office.phone }}
                </a>
              </p>

              <p class="text-sm leading-relaxed">
                {{ office.description }}
              </p>
            </div>

            <!-- RIGHT SIDE (HOURS) -->
            <div class="md:w-64">
              <p class="font-semibold mb-2 text-sm">
                {{ t('offices.hours') }}
              </p>

              <ul class="space-y-1 text-sm">
                <li
                  v-for="day in weekDays"
                  :key="day"
                  class="flex justify-between"
                >
                  <span class="w-16 font-medium">
                    {{ t(`offices.days.${day}`) }}:
                  </span>

                  <span class="tabular-nums text-gray-700">
                    <template v-if="office.opening_hours?.[day]?.length">
                      <span
                        v-for="(range, idx) in office.opening_hours[day]"
                        :key="idx"
                      >
                        {{ range[0] }}–{{ range[1] }}<span v-if="idx < office.opening_hours[day].length - 1">, </span>
                      </span>
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
