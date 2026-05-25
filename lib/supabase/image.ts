export function imageUrl(storagePath: string): string {
  if (!storagePath) return '';
  if (storagePath.startsWith('http')) return storagePath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/products/${storagePath}`;
}
