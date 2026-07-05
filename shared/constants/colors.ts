export type BaseColor = {
  value: string
  label: string
  // Solid hex for the swatch, or null for special multi/pattern swatches
  hex: string | null
  // 'pattern' → leopard/print, 'multi' → rainbow gradient
  swatch?: 'pattern' | 'multi'
  // true when the swatch needs a visible border on white (branco/creme)
  needsBorder?: boolean
};

export const BASE_COLORS: BaseColor[] = [
  { value: 'preto', label: 'Preto', hex: '#1a1a1a' },
  { value: 'branco', label: 'Branco', hex: '#ffffff', needsBorder: true },
  { value: 'cinza', label: 'Cinza', hex: '#9ca3af' },
  { value: 'bege', label: 'Bege', hex: '#e6d9c2', needsBorder: true },
  { value: 'castanho', label: 'Castanho', hex: '#7b4a2e' },
  { value: 'vermelho', label: 'Vermelho', hex: '#d4283b' },
  { value: 'vinho', label: 'Vinho', hex: '#6b1f2e' },
  { value: 'rosa', label: 'Rosa', hex: '#e86a9b' },
  { value: 'laranja', label: 'Laranja', hex: '#f08a3c' },
  { value: 'amarelo', label: 'Amarelo', hex: '#f2c744' },
  { value: 'azul', label: 'Azul', hex: '#2f6bd8' },
  { value: 'verde', label: 'Verde', hex: '#2f9e5f' },
  { value: 'roxo', label: 'Roxo', hex: '#7a4ab7' },
  { value: 'dourado', label: 'Dourado', hex: '#c9a24b' },
  { value: 'prateado', label: 'Prateado', hex: '#c0c4c8' },
  { value: 'estampado', label: 'Estampado', hex: null, swatch: 'pattern' },
  { value: 'multicor', label: 'Multicor', hex: null, swatch: 'multi' },
];

export const BASE_COLOR_MAP: Record<string, BaseColor> = Object.fromEntries(
  BASE_COLORS.map(color => [color.value, color]),
);

export function colorLabel(value?: string | null): string {
  if (!value) {
    return '';
  }

  return BASE_COLOR_MAP[value]?.label ?? value;
}
