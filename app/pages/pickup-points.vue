<script setup lang="ts">
definePageMeta({ name: 'pickup-points' });

const title = 'Pontos de experimentação da Amoda em Luanda | Horários e mapas';
const description = 'Encontre pontos de experimentação da Amoda em Luanda: veja endereço, horário, contacto e localização para provar antes de pagar.';

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: description },
  ],
  link: [
    { rel: 'canonical', href: 'https://amoda.ao/pickup-points' },
  ],
});

const WEEKDAY_LABELS = {
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
  sun: 'Dom',
} as const;

type OpeningHours = Record<string, [string, string][]>;

type WeekDay = keyof typeof WEEKDAY_LABELS;

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

type ScheduleGroup = {
  label: string
  value: string
};

type PickupPoint = Office & {
  isOpen: boolean
  mapUrl: string | null
  phoneHref: string | null
  schedule: ScheduleGroup[]
};

const closedLabel = 'Fechado';
const openNowLabel = 'Aberto agora';

const weekDays = Object.keys(WEEKDAY_LABELS) as WeekDay[];


const { data: officesResponse, error } = await useFetch<{ items: Office[] }>('/api/offices/list');

const toTel = (phone?: string | null) => {
  if (!phone) {
    return '';
  }

  return phone.replace(/[^\d+]/g, '');
};

const toMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);

  return hours * 60 + minutes;
};

const formatTimeRanges = (timeRanges?: [string, string][]) => {
  if (!timeRanges?.length) {
    return '';
  }

  return timeRanges
    .filter(([startTime, endTime]) => startTime && endTime)
    .map(([startTime, endTime]) => `${startTime}–${endTime}`)
    .join(', ');
};

const getTodayKey = () => {
  const dayIndex = new Date().getDay();

  return weekDays[dayIndex === 0 ? 6 : dayIndex - 1];
};

const isOpenNow = (hours?: OpeningHours | null) => {
  const todayHours = hours?.[todayKey];

  if (!todayHours?.length) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  return todayHours.some(([startTime, endTime]) => {
    const opensAt = toMinutes(startTime);
    const closesAt = toMinutes(endTime);

    return currentTime >= opensAt && currentTime <= closesAt;
  });
};

const todayKey = getTodayKey();

const getCompactSchedule = (hours?: OpeningHours | null) => weekDays.reduce<ScheduleGroup[]>((groups, day) => {
  const value = formatTimeRanges(hours?.[day]) || closedLabel;
  const previousGroup = groups[groups.length - 1];

  if (previousGroup?.value === value) {
    previousGroup.label = `${previousGroup.label.split('–')[0]}–${WEEKDAY_LABELS[day]}`;
  } else {
    groups.push({
      label: WEEKDAY_LABELS[day],
      value,
    });
  }

  return groups;
}, []);

const resolveMapUrl = (office: Office) => {
  if (office.map_url) {
    return office.map_url;
  }

  if (office.location_lat && office.location_lng) {
    return `https://www.google.com/maps?q=${office.location_lat},${office.location_lng}`;
  }

  return null;
};

const toPickupPoint = (office: Office): PickupPoint => {
  const phoneNumber = toTel(office.phone);

  return {
    ...office,
    isOpen: isOpenNow(office.opening_hours),
    mapUrl: resolveMapUrl(office),
    phoneHref: phoneNumber ? `tel:${phoneNumber}` : null,
    schedule: getCompactSchedule(office.opening_hours),
  };
};

const pickupPoints = computed(() => (officesResponse.value?.items ?? []).map(toPickupPoint));
const firstPickupPoint = computed(() => pickupPoints.value[0] ?? null);

const { makeWhatsappHref } = useWhatsappLink();
const whatsappHref = makeWhatsappHref(() => 'Olá! Quero ajuda com os pontos de experimentação da Amoda.');
</script>

<template>
  <UPage>
    <UPageBody class="mx-auto max-w-4xl sm:px-6 lg:px-8">
      <section
        class="overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-fuchsia-50 p-5 shadow-sm sm:p-8"
      >
        <UBadge
          v-if="firstPickupPoint"
          :color="firstPickupPoint.isOpen ? 'success' : 'error'"
          variant="soft"
          class="mb-4"
        >
          {{ firstPickupPoint.isOpen ? openNowLabel : closedLabel }}
        </UBadge>

        <h1 class="text-3xl font-black tracking-tight text-highlighted sm:text-5xl">
          Pontos de experimentação
        </h1>

        <p class="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Escolha um ponto, veja o horário e abra a localização no mapa.
        </p>
      </section>

      <UAlert
        v-if="error"
        class="mt-5 sm:mt-6"
        variant="soft"
        color="error"
        icon="i-lucide-alert-triangle"
        title="Erro ao carregar os pontos."
      />

      <UAlert
        v-else-if="pickupPoints.length === 0"
        class="mt-5 sm:mt-6"
        variant="soft"
        icon="i-lucide-map-pin"
        title="Ainda não há pontos disponíveis."
      />

      <section
        v-else
        class="mt-5 grid gap-4 sm:mt-6"
      >
        <UCard
          v-for="point in pickupPoints"
          :key="point.id"
        >
          <div class="flex flex-col gap-5">
            <div>
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h2
                    class="text-xl font-bold text-highlighted"
                    v-text="point.name"
                  />
                </div>

                <UBadge
                  :color="point.isOpen ? 'success' : 'error'"
                  variant="soft"
                  class="shrink-0"
                >
                  {{ point.isOpen ? openNowLabel : closedLabel }}
                </UBadge>
              </div>

              <p
                v-if="point.address"
                class="mt-2 text-sm leading-6 text-muted"
                v-text="point.address"
              />

              <p
                v-if="point.description"
                class="mt-3 text-sm leading-6 text-toned"
                v-text="point.description"
              />
            </div>

            <div class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <div class="mb-3 flex items-center gap-2">
                <UIcon
                  name="i-lucide-clock"
                  class="size-4 text-primary"
                />

                <h3 class="text-sm font-semibold text-highlighted">
                  Horário
                </h3>
              </div>

              <div class="grid gap-2 text-sm sm:grid-cols-2">
                <div
                  v-for="group in point.schedule"
                  :key="`${group.label}-${group.value}`"
                  class="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2"
                >
                  <span
                    class="font-medium text-toned"
                    v-text="group.label"
                  />

                  <span
                    class="tabular-nums text-muted"
                    v-text="group.value"
                  />
                </div>
              </div>
            </div>

            <div class="grid gap-3 sm:flex sm:flex-wrap">
              <UButton
                v-if="point.mapUrl"
                :to="point.mapUrl"
                target="_blank"
                color="primary"
                size="lg"
                icon="i-lucide-map-pin"
                class="justify-center"
              >
                Abrir no Google Maps
              </UButton>

              <UButton
                v-if="point.phoneHref"
                :to="point.phoneHref"
                color="neutral"
                variant="soft"
                size="lg"
                icon="i-lucide-phone"
                class="justify-center"
              >
                Ligar
              </UButton>
            </div>
          </div>
        </UCard>
      </section>

      <section class="mt-6">
        <UAlert
          color="success"
          variant="soft"
          icon="i-simple-icons-whatsapp"
          title="Precisa de ajuda?"
          description="Fale connosco no WhatsApp para escolher o melhor ponto ou tirar dúvidas antes de visitar."
        >
          <template #actions>
            <UButton
              :to="whatsappHref"
              target="_blank"
              color="success"
            >
              Falar no WhatsApp
            </UButton>
          </template>
        </UAlert>
      </section>
    </UPageBody>
  </UPage>
</template>
