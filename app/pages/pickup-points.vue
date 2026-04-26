<script setup lang="ts">
definePageMeta({ name: 'pickup-points' });

type OpeningHours = Record<string, [string, string][]>;

type Office = {
  id: number
  name: string
  description?: string | null
  address?: string | null
  phone?: string | null
  opening_hours?: OpeningHours | null
  location_lat?: number | null
  location_lng?: number | null
  map_url?: string | null
};

const { t } = useI18n();

const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const { data, error } = await useFetch<{ items: Office[] }>('/api/offices/list');

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

const toTel = (phone?: string | null) => {
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
    .filter((r) => r?.[0] && r?.[1])
    .map((r) => `${r[0]}–${r[1]}`)
    .join(', ');
};

const getTodayKey = () => {
  const day = new Date().getDay();

  return weekDays[day === 0 ? 6 : day - 1];
};

const todayKey = getTodayKey();

const getTodayHours = (hours?: OpeningHours | null) => {
  const todayHours = hours?.[todayKey];

  return formatRanges(todayHours) || t('offices.closed');
};

const getCompactHours = (hours?: OpeningHours | null) => weekDays.reduce<{ label: string, value: string }[]>((acc, day) => {
  const value = formatRanges(hours?.[day]) || t('offices.closed');
  const prev = acc[acc.length - 1];

  if (prev?.value === value) {
    prev.label = `${prev.label.split('–')[0]}–${t(`offices.days.${day}`)}`;
  } else {
    acc.push({
      label: t(`offices.days.${day}`),
      value,
    });
  }

  return acc;
}, []);

const getMapUrl = (office: Office) => {
  if (office.map_url) {
    return office.map_url;
  }

  if (office.location_lat && office.location_lng) {
    return `https://www.google.com/maps?q=${office.location_lat},${office.location_lng}`;
  }

  return null;
};
</script>

<i18n lang="json">
{
  "pt": {
    "offices": {
      "title": "Pontos de experimentação",
      "subtitle": "Escolha um ponto, veja o horário e abra a localização no mapa.",
      "error": "Erro ao carregar os pontos.",
      "empty": "Ainda não há pontos disponíveis.",
      "today": "Hoje",
      "hours": "Horário",
      "closed": "Fechado",
      "phone": "Ligar",
      "map": "Abrir no Google Maps",
      "meta": {
        "title": "Pontos de experimentação Amoda em Luanda",
        "description": "Veja os pontos de experimentação Amoda em Luanda: endereço, horário, contacto e localização no mapa."
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
      "title": "Try-on points",
      "subtitle": "Choose a point, check opening hours, and open the location on the map.",
      "error": "Failed to load points.",
      "empty": "No points available yet.",
      "today": "Today",
      "hours": "Hours",
      "closed": "Closed",
      "phone": "Call",
      "map": "Open in Google Maps",
      "meta": {
        "title": "Amoda try-on points in Luanda",
        "description": "See Amoda try-on points in Luanda: address, opening hours, contact and map location."
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
    <UPageBody class="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <section class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8">
        <UBadge
          v-if="offices[0]"
          color="primary"
          variant="soft"
          class="mb-4"
        >
          {{ t('offices.today') }}: {{ getTodayHours(offices[0].opening_hours) }}
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          {{ t('offices.title') }}
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          {{ t('offices.subtitle') }}
        </p>
      </section>

      <UAlert
        v-if="error"
        class="mt-5 sm:mt-6"
        variant="soft"
        color="error"
        icon="i-lucide-alert-triangle"
        :title="t('offices.error')"
      />

      <UAlert
        v-else-if="offices.length === 0"
        class="mt-5 sm:mt-6"
        variant="soft"
        icon="i-lucide-map-pin"
        :title="t('offices.empty')"
      />

      <section
        v-else
        class="mt-5 grid gap-4 sm:mt-6"
      >
        <UCard
          v-for="office in offices"
          :key="office.id"
        >
          <div class="flex flex-col gap-5">
            <div>
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h2 class="text-xl font-bold text-highlighted">
                    {{ office.name }}
                  </h2>

                  <p
                    v-if="office.address"
                    class="mt-2 text-sm leading-6 text-muted"
                  >
                    {{ office.address }}
                  </p>
                </div>

                <UBadge
                  color="primary"
                  variant="soft"
                  class="shrink-0"
                >
                  {{ t('offices.today') }}: {{ getTodayHours(office.opening_hours) }}
                </UBadge>
              </div>

              <p
                v-if="office.description"
                class="mt-3 text-sm leading-6 text-toned"
              >
                {{ office.description }}
              </p>
            </div>

            <div class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <div class="mb-3 flex items-center gap-2">
                <UIcon
                  name="i-lucide-clock"
                  class="size-4 text-primary"
                />

                <h3 class="text-sm font-semibold text-highlighted">
                  {{ t('offices.hours') }}
                </h3>
              </div>

              <div class="grid gap-2 text-sm sm:grid-cols-2">
                <div
                  v-for="group in getCompactHours(office.opening_hours)"
                  :key="`${group.label}-${group.value}`"
                  class="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2"
                >
                  <span class="font-medium text-toned">
                    {{ group.label }}
                  </span>

                  <span class="tabular-nums text-muted">
                    {{ group.value }}
                  </span>
                </div>
              </div>
            </div>

            <div class="grid gap-3 sm:flex sm:flex-wrap">
              <UButton
                v-if="getMapUrl(office)"
                :to="getMapUrl(office)!"
                target="_blank"
                color="primary"
                size="lg"
                icon="i-lucide-map-pin"
                class="justify-center"
              >
                {{ t('offices.map') }}
              </UButton>

              <UButton
                v-if="office.phone"
                :to="`tel:${toTel(office.phone)}`"
                color="neutral"
                variant="soft"
                size="lg"
                icon="i-lucide-phone"
                class="justify-center"
              >
                {{ t('offices.phone') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </section>
    </UPageBody>
  </UPage>
</template>
