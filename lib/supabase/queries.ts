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
  BlogPost,
  Category,
  Installation,
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
      promo_bar: (map.get('promo_bar') as SiteSettings['promo_bar']) ?? DEMO_SETTINGS.promo_bar,
    };
  } catch {
    return DEMO_SETTINGS;
  }
});

export const listInstallations = cache(async (): Promise<Installation[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const sb = await createSupabaseServer();
    const { data } = await sb
      .from('installations')
      .select('*')
      .order('sort_order', { ascending: true });
    return (data ?? []) as Installation[];
  } catch {
    return [];
  }
});

export interface ListProductsFilters {
  category?: string;
  q?: string;
  featured?: boolean;
  limit?: number;
}

export type CatalogSort = 'recientes' | 'destacados' | 'precio-asc' | 'precio-desc';

export interface SearchCatalogFilters extends ListProductsFilters {
  sort?: CatalogSort;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  perPage?: number;
}

export type CatalogProduct = Product & { images: ProductImage[]; category: Category | null };

export async function listProducts(
  filters: ListProductsFilters = {},
): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) return demoList(filters);
  try {
    const sb = await createSupabaseServer();
    const categorySelect = filters.category ? 'category:categories!inner(*)' : 'category:categories(*)';
    let q = sb
      .from('products')
      .select(`*, ${categorySelect}, images:product_images(*)`)
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.featured) q = q.eq('featured', true);
    if (filters.category) q = q.eq('categories.slug', filters.category);
    if (filters.q) q = q.ilike('search_text', `%${filters.q.toLowerCase()}%`);
    if (filters.limit) q = q.limit(filters.limit);

    const { data } = await q;
    return (data ?? []) as never;
  } catch {
    return demoList(filters);
  }
}

export async function searchCatalog(
  filters: SearchCatalogFilters = {},
): Promise<{ items: CatalogProduct[]; total: number; page: number; perPage: number }> {
  const perPage = filters.perPage ?? 12;
  const page = Math.max(1, filters.page ?? 1);

  if (!isSupabaseConfigured()) {
    const all = demoSearch(filters);
    return {
      items: all.slice((page - 1) * perPage, page * perPage),
      total: all.length,
      page,
      perPage,
    };
  }

  try {
    const sb = await createSupabaseServer();
    const categorySelect = filters.category ? 'category:categories!inner(*)' : 'category:categories(*)';
    let q = sb
      .from('products')
      .select(`*, ${categorySelect}, images:product_images(*)`, { count: 'exact' })
      .eq('status', 'active');

    if (filters.category) q = q.eq('categories.slug', filters.category);
    if (filters.q) q = q.ilike('search_text', `%${filters.q.toLowerCase()}%`);
    if (typeof filters.priceMin === 'number') q = q.gte('base_price', filters.priceMin);
    if (typeof filters.priceMax === 'number') q = q.lte('base_price', filters.priceMax);

    switch (filters.sort) {
      case 'precio-asc':
        q = q.order('base_price', { ascending: true });
        break;
      case 'precio-desc':
        q = q.order('base_price', { ascending: false });
        break;
      case 'destacados':
        q = q.order('featured', { ascending: false }).order('created_at', { ascending: false });
        break;
      case 'recientes':
      default:
        q = q.order('created_at', { ascending: false });
    }

    const from = (page - 1) * perPage;
    q = q.range(from, from + perPage - 1);

    const { data, count } = await q;
    return {
      items: (data ?? []) as CatalogProduct[],
      total: count ?? 0,
      page,
      perPage,
    };
  } catch {
    const all = demoSearch(filters);
    return {
      items: all.slice((page - 1) * perPage, page * perPage),
      total: all.length,
      page,
      perPage,
    };
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

function demoSearch(filters: SearchCatalogFilters): CatalogProduct[] {
  let items = demoList({ category: filters.category, q: filters.q });
  if (typeof filters.priceMin === 'number') items = items.filter((p) => p.base_price >= filters.priceMin!);
  if (typeof filters.priceMax === 'number') items = items.filter((p) => p.base_price <= filters.priceMax!);
  switch (filters.sort) {
    case 'precio-asc':
      items = [...items].sort((a, b) => a.base_price - b.base_price);
      break;
    case 'precio-desc':
      items = [...items].sort((a, b) => b.base_price - a.base_price);
      break;
    case 'destacados':
      items = [...items].sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }
  return items;
}

export async function listRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
): Promise<CatalogProduct[]> {
  if (!isSupabaseConfigured()) {
    return DEMO_PRODUCTS.filter((p) => p.id !== productId).slice(0, limit);
  }
  try {
    const sb = await createSupabaseServer();
    let q = sb
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .eq('status', 'active')
      .neq('id', productId)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (categoryId) q = q.eq('category_id', categoryId);
    const { data } = await q;
    if (data && data.length > 0) return data as CatalogProduct[];
    // Fallback si la categoría tiene pocos productos: muestra recientes globales.
    const fallback = await sb
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .eq('status', 'active')
      .neq('id', productId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return (fallback.data ?? []) as CatalogProduct[];
  } catch {
    return DEMO_PRODUCTS.filter((p) => p.id !== productId).slice(0, limit);
  }
}

export async function listBlogPosts(opts: { limit?: number } = {}): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const sb = await createSupabaseServer();
    let q = sb
      .from('blog_posts')
      .select('*')
      .eq('status', 'active')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (opts.limit) q = q.limit(opts.limit);
    const { data } = await q;
    return (data ?? []) as BlogPost[];
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const sb = await createSupabaseServer();
    const { data } = await sb
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();
    return (data as BlogPost) ?? null;
  } catch {
    return null;
  }
}

export async function listProductsByIds(ids: string[]): Promise<CatalogProduct[]> {
  if (!ids.length) return [];
  if (!isSupabaseConfigured()) return [];
  try {
    const sb = await createSupabaseServer();
    const { data } = await sb
      .from('products')
      .select('*, category:categories(*), images:product_images(*)')
      .in('id', ids)
      .eq('status', 'active');
    return (data ?? []) as CatalogProduct[];
  } catch {
    return [];
  }
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
