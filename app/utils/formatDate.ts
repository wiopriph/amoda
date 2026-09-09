// Явный пояс магазина: иначе SSR (UTC) и браузер клиентки (UTC+1) дают разные дни у полуночных дат
const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'Africa/Luanda',
});

export const formatDate = (value: string | number | Date | null | undefined) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
};
