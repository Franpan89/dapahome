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
  variant_id: string | null;
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

export interface ProductColor {
  id: string;
  product_id: string;
  name: string;
  hex: string | null;
  sort_order: number;
}

export interface ProductWithRelations extends Product {
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
  colors: ProductColor[];
}

export type BlogStatus = 'active' | 'draft' | 'archived';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_path: string | null;
  body: string;
  project_location: string | null;
  product_ids: string[];
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type InstallationMediaType = 'image' | 'video';

export interface Installation {
  id: string;
  storage_path: string;
  caption: string | null;
  alt: string | null;
  sort_order: number;
  media_type: InstallationMediaType;
}

export type TestimonialStatus = 'active' | 'draft';

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  body: string;
  photo_path: string | null;
  rating: number;
  featured: boolean;
  sort_order: number;
  status: TestimonialStatus;
  created_at: string;
}

export interface PromoBar {
  enabled: boolean;
  text: string;
  link: string;
}

export interface SiteSettings {
  whatsapp: { number: string; greeting: string };
  checkout_template: { intro: string; outro: string };
  hero: { eyebrow: string; title: string; subtitle: string };
  promo_bar: PromoBar;
}
