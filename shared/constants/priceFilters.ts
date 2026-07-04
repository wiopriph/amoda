export type PricePreset = {
  value: string
  label: string
  min?: number
  max?: number
};

export const PRICE_PRESETS: PricePreset[] = [
  { value: 'lt10', label: 'Até 10.000', max: 10000 },
  { value: '10-20', label: '10.000 – 20.000', min: 10000, max: 20000 },
  { value: 'gt20', label: '+20.000 Kz', min: 20000 },
];

export const PRICE_PRESET_MAP: Record<string, PricePreset> = Object.fromEntries(
  PRICE_PRESETS.map(preset => [preset.value, preset]),
);

// Translate a preset token into catalog API query params
export function pricePresetToQuery(value?: string | null): { min_price?: number; max_price?: number } {
  const preset = value ? PRICE_PRESET_MAP[value] : null;

  if (!preset) return {};

  const query: { min_price?: number; max_price?: number } = {};

  if (preset.min !== undefined) query.min_price = preset.min;

  if (preset.max !== undefined) query.max_price = preset.max;

  return query;
}
