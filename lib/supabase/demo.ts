// Datos de demostración cuando no hay credenciales de Supabase.
// Permiten ver el diseño completo antes de conectar la base de datos.

import type {
  Category,
  Product,
  ProductImage,
  ProductWithRelations,
  SiteSettings,
} from './types';

export const DEMO_CATEGORIES: Category[] = [
  { id: 'c1', slug: 'iluminacion', name: 'Iluminación', description: 'Lámparas colgantes, de mesa, apliques y LED.', hero_image_path: null, parent_id: null, sort_order: 10 },
  { id: 'c2', slug: 'decoracion',  name: 'Decoración',  description: 'Maceteros, jarrones y objeto decorativo.',        hero_image_path: null, parent_id: null, sort_order: 20 },
  { id: 'c3', slug: 'domotica',    name: 'Domótica',    description: 'Cerraduras y dispositivos compatibles con Alexa.', hero_image_path: null, parent_id: null, sort_order: 30 },
  { id: 'c4', slug: 'mobiliario',  name: 'Mobiliario',  description: 'Piezas seleccionadas para interior y exterior.',   hero_image_path: null, parent_id: null, sort_order: 40 },
];

const IMG = (path: string, alt: string, id: string, primary = true): ProductImage => ({
  id, product_id: '', storage_path: path, alt, sort_order: 0, is_primary: primary,
});

const baseProduct = (
  id: string, slug: string, name: string, description: string, category_id: string,
  base_price: number, featured: boolean,
): Product => ({
  id, slug, name, description, category_id, base_price, currency: 'USD',
  status: 'active', featured,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
});

export const DEMO_PRODUCTS: (Product & { images: ProductImage[]; category: Category | null })[] = [
  {
    ...baseProduct('p1', 'lampara-aria', 'Lámpara Colgante Aria', 'Lámpara de líneas suaves en latón cepillado. Acabado mate que difunde luz cálida.', 'c1', 89, true),
    category: DEMO_CATEGORIES[0],
    images: [
      IMG('https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200', 'Lámpara colgante sobre comedor', 'i1'),
      IMG('https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=1200', 'Detalle del acabado', 'i1b', false),
    ],
  },
  {
    ...baseProduct('p2', 'macetero-luna', 'Macetero Cerámica Luna', 'Cerámica artesanal con esmalte craquelado.', 'c2', 34, true),
    category: DEMO_CATEGORIES[1],
    images: [IMG('https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200', 'Macetero con planta tropical', 'i2')],
  },
  {
    ...baseProduct('p3', 'cerradura-nova', 'Cerradura Inteligente Nova', 'Apertura biométrica, Wi-Fi y Alexa.', 'c3', 219, true),
    category: DEMO_CATEGORIES[2],
    images: [IMG('https://images.unsplash.com/photo-1558002038-1055907df827?w=1200', 'Cerradura instalada en puerta moderna', 'i3')],
  },
  {
    ...baseProduct('p4', 'mesa-orbe', 'Mesa Auxiliar Orbe', 'Roble macizo con base de hierro forjado.', 'c4', 189, true),
    category: DEMO_CATEGORIES[3],
    images: [IMG('https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200', 'Mesa auxiliar en sala minimalista', 'i4')],
  },
  {
    ...baseProduct('p5', 'aplique-sol', 'Aplique de Pared Sol', 'Aplique direccional con brazo articulado.', 'c1', 64, false),
    category: DEMO_CATEGORIES[0],
    images: [IMG('https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=1200', 'Aplique iluminando una librería', 'i5')],
  },
  {
    ...baseProduct('p6', 'jarron-onda', 'Jarrón Onda', 'Vidrio soplado a mano con textura ondulada.', 'c2', 48, false),
    category: DEMO_CATEGORIES[1],
    images: [IMG('https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=1200', 'Jarrón de vidrio soplado', 'i6')],
  },
  {
    ...baseProduct('p7', 'lampara-mesa-mio', 'Lámpara de Mesa Mio', 'Base de cerámica gres con pantalla de lino crudo. Luz cálida para mesas de noche.', 'c1', 78, false),
    category: DEMO_CATEGORIES[0],
    images: [IMG('https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200', 'Lámpara de mesa sobre mesa de noche', 'i7')],
  },
  {
    ...baseProduct('p8', 'silla-ona', 'Silla Ona', 'Silla de comedor en madera curvada y asiento de paja trenzada artesanal.', 'c4', 145, false),
    category: DEMO_CATEGORIES[3],
    images: [IMG('https://images.unsplash.com/photo-1503602642458-232111445657?w=1200', 'Silla de comedor de madera curvada', 'i8')],
  },
];

export const DEMO_PRODUCT_DETAIL = (slug: string): ProductWithRelations | null => {
  const base = DEMO_PRODUCTS.find((p) => p.slug === slug);
  if (!base) return null;
  return {
    ...base,
    variants: slug === 'lampara-aria'
      ? [
          { id: 'v1', product_id: base.id, name: 'Latón',      options: { color: 'laton' }, sku: 'ARIA-LT', price_override: null, stock: null, sort_order: 1 },
          { id: 'v2', product_id: base.id, name: 'Negro mate', options: { color: 'negro' }, sku: 'ARIA-NG', price_override: null, stock: null, sort_order: 2 },
        ]
      : slug === 'macetero-luna'
      ? [
          { id: 'v3', product_id: base.id, name: 'Pequeño', options: { size: 'S' }, sku: 'LUNA-S', price_override: 24, stock: null, sort_order: 1 },
          { id: 'v4', product_id: base.id, name: 'Mediano', options: { size: 'M' }, sku: 'LUNA-M', price_override: 34, stock: null, sort_order: 2 },
          { id: 'v5', product_id: base.id, name: 'Grande',  options: { size: 'L' }, sku: 'LUNA-L', price_override: 44, stock: null, sort_order: 3 },
        ]
      : [],
  };
};

export const DEMO_SETTINGS: SiteSettings = {
  whatsapp: { number: '593998001894', greeting: '¡Hola Dapa Home! 👋' },
  checkout_template: {
    intro: 'Hola Dapa Home 👋, quisiera hacer este pedido:',
    outro: 'Quedo atento(a) para coordinar el pago y la entrega. ¡Gracias!',
  },
  hero: {
    eyebrow: 'Catálogo demo',
    title: 'Diseño para el hogar que se siente personal.',
    subtitle: 'Iluminación, decoración y domótica curada en Ecuador.',
  },
  promo_bar: { enabled: false, text: '', link: '' },
};

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder'),
  );
}
