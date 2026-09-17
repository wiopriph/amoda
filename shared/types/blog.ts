import type { CatalogProductCard } from './catalog';


export type BlogCategoryPreview = {
  category: {
    id: number
    name: string
    slug: string
    image: string | null
  }
  // Только товары в наличии (есть размер со stock > 0)
  items: CatalogProductCard[]
  total: number
  priceMin: number | null
  priceMax: number | null
};
