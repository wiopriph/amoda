const AO_COUNTRY_CODE = '244';
const AO_NATIONAL_LENGTH = 9;

export const normalizeAoPhone = (raw: unknown): string | null => {
  const digits = String(raw ?? '').replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  const national = digits.startsWith(AO_COUNTRY_CODE) && digits.length === AO_COUNTRY_CODE.length + AO_NATIONAL_LENGTH ?
    digits.slice(AO_COUNTRY_CODE.length) :
    digits;

  if (national.length !== AO_NATIONAL_LENGTH) {
    return null;
  }

  return `+${AO_COUNTRY_CODE}${national}`;
};

export const formatAoPhone = (phone: string | null | undefined): string => {
  const normalized = normalizeAoPhone(phone);

  if (!normalized) {
    return phone ? String(phone) : '';
  }

  const national = normalized.slice(AO_COUNTRY_CODE.length + 1);

  return `+${AO_COUNTRY_CODE} ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
};
