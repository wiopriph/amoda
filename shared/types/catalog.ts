export type CatalogBreadcrumb = {
  label: string
  to: { name: string; params: Record<string, string> }
};

export type CatalogCategory = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  image: string | null
  seo_title: string | null
  seo_description: string | null
  seo_content: string | null
  h1_override: string | null
};

export type CatalogProductCard = {
  id: number
  slug: string
  title: string
  badges: string[]
  primary_category_id: number | null
  brand_id: number | null
  brand_name: string | null
  price: number
  default_variant_id: number | null
  default_size_id: number | null
  default_variant_color: string | null
  default_size_label: string | null
  image: string | null
};

export type CatalogListResponse = {
  breadcrumbs: CatalogBreadcrumb[]
  category: CatalogCategory | null
  items: CatalogProductCard[]
  total: number
  page: number
  limit: number
};
