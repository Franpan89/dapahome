import { cache } from 'react';
import { createSupabaseServer } from './server';
export { imageUrl } from './image';
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_PRODUCT_DETAIL,
  DEMO_SETTINGS,
  isSupabaseConfigured,
} from './demo';
import type {
  Category,
  Product,
  ProductImage,
  ProductVariant,
  ProductWithRelations,
  SiteSettings,
} from './types';

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) return DEMO_CATEGORIES;
  try {
    const sb = await createSupabaseServer();
    const { data } = await sb.from('categories').select('*').order('sort_order');
    return (data ?? []) as Category[];
  } catch {
    return DEMO_CATEGORIES;
  }
});

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured()) return DEMO_SETTINGS;
  try {
    const sb = await createSupabaseServer();
    const { data } = await sb.from('site_settings').select('key, value');
    const map = new Map((data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]));
    return {
      whatsapp: (map.get('whatsapp') as SiteSettings['whatsapp']) ?? DEMO_SETTINGS.whatsapp,
      checkout_template: (map.get('checkout_template') as SiteSettings['checkout_template']) ?? DEMO_SETTINGS.checkout_template,
      hero: (map.get('hero') as SiteSettings['hero']) ?? DEMO_SETTINGS.hero,
    };
  } catch {
    return DEMO_SETTINGS;
  }
});

export interface ListProductsFilters {
  category?: string;
  q?: string;
  featured?: boolean;
  limit?: number;
}

export async function listProducts(
  filters: ListProductsFilters = {},
): Promise<(Product & { images: ProductImage[]; category: Category | null })[]> {
  if (!isSupabaseConfigured()) return demoList(filters);
  try {
    const sb = await createSupabaseServer();
    let q = sb
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.featured) q = q.eq('featured', true);
    if (filters.category) q = q.eq('category.slug', filters.category);
    if (filters.q) q = q.ilike('search_text', `%${filters.q.toLowerCase()}%`);
    if (filters.limit) q = q.limit(filters.limit);

    const { data } = await q;
    return (data ?? []) as never;
  } catch {
    return demoList(filters);
  }
}

function demoList(filters: ListProductsFilters) {
  let items = [...DEMO_PRODUCTS];
  if (filters.featured) items = items.filter((p) => p.featured);
  if (filters.category) items = items.filter((p) => p.category?.slug === filters.category);
  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q));
  }
  if (filters.limit) items = items.slice(0, filters.limit);
  return items;
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithRelations | null> {
  if (!isSupabaseConfigured()) return DEMO_PRODUCT_DETAIL(slug);
  try {
    const sb = await createSupabaseServer();
    const { data } = await sb
      .from('products')
      .select('*, category:categories(*), images:product_images(*), variants:product_variants(*)')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();
    if (!data) return null;
    const product = data as ProductWithRelations;
    product.images = (product.images ?? []).sort((a, b) => a.sort_order - b.sort_order);
    product.variants = (product.variants ?? []).sort((a: ProductVariant, b: ProductVariant) => a.sort_order - b.sort_order);
    return product;
  } catch {
    return DEMO_PRODUCT_DETAIL(slug);
  }
}
