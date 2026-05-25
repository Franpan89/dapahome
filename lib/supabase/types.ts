export type ProductStatus = 'active' | 'draft' | 'archived';

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  hero_image_path: string | null;
  parent_id: string | null;
  sort_order: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  options: Record<string, string>;
  sku: string | null;
  price_override: number | null;
  stock: number | null;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  currency: string;
  status: ProductStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithRelations extends Product {
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface SiteSettings {
  whatsapp: { number: string; greeting: string };
  checkout_template: { intro: string; outro: string };
  hero: { eyebrow: string; title: string; subtitle: string };
}
