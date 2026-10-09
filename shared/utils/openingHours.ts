export type OpeningHours = Record<string, [string, string][]>;

export const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export const WEEKDAY_LABELS: Record<(typeof WEEKDAY_KEYS)[number], string> = {
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
  sun: 'Dom',
};

const WEEKDAY_FULL: Record<(typeof WEEKDAY_KEYS)[number], string> = {
  mon: 'segunda',
  tue: 'terça',
  wed: 'quarta',
  thu: 'quinta',
  fri: 'sexta',
  sat: 'sábado',
  sun: 'domingo',
};

const toMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);

  return hours * 60 + minutes;
};

const dayKeyAt = (date: Date) => {
  const dayIndex = date.getDay();

  return WEEKDAY_KEYS[dayIndex === 0 ? 6 : dayIndex - 1];
};

export type OpeningStatus =
  | { isOpen: true; until: string }
  | { isOpen: false; opensAt: string | null; opensDay: string | null };

// Статус "открыто до 22:00" / "открывается завтра в 06:00" по расписанию офиса
export const getOpeningStatus = (hours?: OpeningHours | null, now = new Date()): OpeningStatus => {
  const todayKey = dayKeyAt(now);
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const todayRanges = (hours?.[todayKey] || []).filter(([start, end]) => start && end);

  for (const [start, end] of todayRanges) {
    if (currentTime >= toMinutes(start) && currentTime <= toMinutes(end)) {
      return { isOpen: true, until: end };
    }
  }

  const laterToday = todayRanges.find(([start]) => toMinutes(start) > currentTime);

  if (laterToday) {
    return { isOpen: false, opensAt: laterToday[0], opensDay: 'hoje' };
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const date = new Date(now);

    date.setDate(now.getDate() + offset);

    const key = dayKeyAt(date);
    const first = (hours?.[key] || []).find(([start, end]) => start && end);

    if (first) {
      return { isOpen: false, opensAt: first[0], opensDay: offset === 1 ? 'amanhã' : WEEKDAY_FULL[key] };
    }
  }

  return { isOpen: false, opensAt: null, opensDay: null };
};

export const formatOpeningStatus = (status: OpeningStatus) => {
  if (status.isOpen) {
    return `Aberto agora · até ${status.until}`;
  }

  if (status.opensAt && status.opensDay) {
    return `Fechado · abre ${status.opensDay} às ${status.opensAt}`;
  }

  return 'Fechado';
};

export const resolveOfficeMapUrl = (office: { map_url?: string | null; location_lat?: number | null; location_lng?: number | null }) => {
  if (office.map_url) {
    return office.map_url;
  }

  if (office.location_lat && office.location_lng) {
    return `https://www.google.com/maps?q=${office.location_lat},${office.location_lng}`;
  }

  return null;
};

export const toTelHref = (phone?: string | null) => {
  const digits = String(phone || '').replace(/[^\d+]/g, '');

  return digits ? `tel:${digits}` : null;
};
