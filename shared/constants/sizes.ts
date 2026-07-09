// Canonical order for letter sizes; numeric sizes (36, 38…) sort numerically after them
const LETTER_SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

const LETTER_SIZE_ALIASES: Record<string, string> = {
  '2XS': 'XXS',
  '2XL': 'XXL',
  '3XL': 'XXXL',
};

export function normalizeSizeLabel(label?: string | null): string {
  const upper = String(label ?? '').trim()
    .toUpperCase();

  return LETTER_SIZE_ALIASES[upper] || upper;
}

function sizeRank(normalizedLabel: string): number {
  const letterIndex = LETTER_SIZE_ORDER.indexOf(normalizedLabel);

  if (letterIndex !== -1) {
    return letterIndex;
  }

  const numeric = Number.parseFloat(normalizedLabel.replace(',', '.'));

  if (Number.isFinite(numeric)) {
    return 100 + numeric;
  }

  return Number.MAX_SAFE_INTEGER;
}

export function compareSizeLabels(firstLabel?: string | null, secondLabel?: string | null): number {
  const first = normalizeSizeLabel(firstLabel);
  const second = normalizeSizeLabel(secondLabel);

  return sizeRank(first) - sizeRank(second) || first.localeCompare(second);
}
